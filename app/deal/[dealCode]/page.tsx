'use client';

import { useState, useEffect } from 'react';
import { Shield, Package, Globe, Truck, DollarSign, Clock, User, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { formatNaira } from '@/utils/currency';

interface Deal {
  id: string;
  deal_code: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  delivery_method: string;
  delivery_address: string;
  status: string;
  link_active: boolean;
  expires_at: string;
  created_at: string;
  seller_id: string;
  users: {
    full_name: string;
    email: string;
    trust_score: number;
    total_deals: number;
    successful_deals: number;
  };
}

export default async function DealViewPage({ params }: { params: Promise<{ dealCode: string }> }) {
  const { dealCode } = await params;
  
  return <DealViewClient dealCode={dealCode} />;
}

function DealViewClient({ dealCode }: { dealCode: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    fetchDeal();
  }, [dealCode]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDeal = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          users!deals_seller_id_fkey (
            full_name,
            email,
            trust_score,
            total_deals,
            successful_deals
          )
        `)
        .eq('deal_code', dealCode)
        .eq('link_active', true)
        .single();

      if (error) {
        setError('Deal not found or has expired');
      } else {
        // Check if deal has expired
        if (new Date(data.expires_at) < new Date()) {
          setError('This deal has expired');
        } else {
          setDeal(data);
        }
      }
    } catch (err) {
      setError('Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (!user) {
      // Redirect to registration with deal code
      router.push(`/auth/register?dealCode=${dealCode}`);
      return;
    }

    setAccepting(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          buyer_id: user.id,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', deal?.id);

      if (error) {
        setError('Failed to accept deal');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setAccepting(false);
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'physical': return Package;
      case 'digital': return Globe;
      case 'service': return Truck;
      default: return Package;
    }
  };

  const getDeliveryLabel = (method: string) => {
    switch (method) {
      case 'physical': return 'Physical Item';
      case 'digital': return 'Digital Item';
      case 'service': return 'Service';
      default: return 'Physical Item';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-indigo-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  SafeTrade
                </span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Deal Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              href="/"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const DeliveryIcon = getDeliveryIcon(deal.delivery_method);
  const isExpiringSoon = new Date(deal.expires_at).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-indigo-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SafeTrade
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Deal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verified Deal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{deal.title}</h1>
          <p className="text-gray-400">Deal ID: {deal.deal_code}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Deal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-2xl border border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-white">
                    {formatNaira(deal.amount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Description */}
            {deal.description && (
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{deal.description}</p>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DeliveryIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{getDeliveryLabel(deal.delivery_method)}</p>
                  <p className="text-gray-400 text-sm">Delivery method</p>
                </div>
              </div>
              {deal.delivery_address && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Delivery Address:</p>
                  <p className="text-white">{deal.delivery_address}</p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">How SafeTrade Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <p className="text-gray-300">You accept this deal and create your SafeTrade account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <p className="text-gray-300">Your payment is held securely in escrow</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <p className="text-gray-300">Seller ships the item and provides tracking</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                  <p className="text-gray-300">You confirm receipt and funds are released to seller</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{deal.users.full_name}</p>
                  <p className="text-gray-400 text-sm">Verified Seller</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trust Score:</span>
                  <span className="text-green-400 font-medium">{deal.users.trust_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Deals:</span>
                  <span className="text-white">{deal.users.total_deals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400">
                    {deal.users.total_deals > 0 
                      ? Math.round((deal.users.successful_deals / deal.users.total_deals) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>

            {/* Deal Expiry */}
            <div className={`p-4 rounded-lg border ${isExpiringSoon ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-gray-800/50 border-gray-600'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isExpiringSoon ? 'text-yellow-400' : 'text-gray-400'}`}>
                  Deal Expires
                </span>
              </div>
              <p className="text-white text-sm">
                {new Date(deal.expires_at).toLocaleDateString()} at {new Date(deal.expires_at).toLocaleTimeString()}
              </p>
              {isExpiringSoon && (
                <p className="text-yellow-400 text-xs mt-1">Expires within 24 hours!</p>
              )}
            </div>

            {/* Accept Deal Button */}
            <div className="space-y-4">
              <button
                onClick={handleAcceptDeal}
                disabled={accepting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? 'Processing...' : user ? 'Accept Deal' : 'Accept Deal & Sign Up'}
              </button>
              
              {!user && (
                <p className="text-gray-400 text-sm text-center">
                  No account needed to view. You'll create one after accepting.
                </p>
              )}
              
              <div className="text-center">
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  ← Back to SafeTrade
                </Link>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Protected by SafeTrade</span>
              </div>
              <p className="text-gray-300 text-xs">
                Your payment is held in secure escrow until you confirm receipt of the item.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
