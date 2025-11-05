'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Search, Bell, User, Settings, LogOut, ToggleLeft, ToggleRight, 
         ShoppingBag, Store, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type UserMode = 'buyer' | 'seller';

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  deal_code: string;
}

export default function DashboardPage() {
  const [userMode, setUserMode] = useState<UserMode>('buyer');
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    fetchDeals();
  }, [userMode]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
  };

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (userMode === 'seller') {
        query = query.eq('seller_id', user.id);
      } else {
        query = query.eq('buyer_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching deals:', error);
      } else {
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'funded': return 'text-blue-400 bg-blue-400/10';
      case 'shipped': return 'text-purple-400 bg-purple-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'funded': return <DollarSign className="w-4 h-4" />;
      case 'shipped': return <TrendingUp className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.deal_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals, IDs, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Settings className="h-6 w-6" />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Mode Switch */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {userMode === 'buyer' ? 'Buyer Dashboard' : 'Seller Dashboard'}
            </h1>
            <p className="text-gray-400">
              {userMode === 'buyer' 
                ? 'Track your purchases and escrow status' 
                : 'Manage your deals and withdraw funds'
              }
            </p>
          </div>

          {/* Mode Switch */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
              <div className={`flex items-center space-x-2 ${userMode === 'buyer' ? 'text-indigo-400' : 'text-gray-400'}`}>
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">Buyer</span>
              </div>
              
              <button
                onClick={() => setUserMode(userMode === 'buyer' ? 'seller' : 'buyer')}
                className="p-1"
              >
                {userMode === 'buyer' ? (
                  <ToggleLeft className="w-8 h-8 text-gray-400 hover:text-indigo-400 transition-colors" />
                ) : (
                  <ToggleRight className="w-8 h-8 text-indigo-400 hover:text-purple-400 transition-colors" />
                )}
              </button>
              
              <div className={`flex items-center space-x-2 ${userMode === 'seller' ? 'text-purple-400' : 'text-gray-400'}`}>
                <Store className="w-5 h-5" />
                <span className="font-medium">Seller</span>
              </div>
            </div>

            {userMode === 'seller' && (
              <Link
                href="/dashboard/create-deal"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Deal</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-2xl border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Deals</p>
                <p className="text-2xl font-bold text-white">
                  {deals.filter(d => ['pending', 'funded', 'shipped'].includes(d.status)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {deals.filter(d => d.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  ${deals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 rounded-2xl border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {deals.length > 0 ? Math.round((deals.filter(d => d.status === 'completed').length / deals.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Deals List */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-semibold text-white">
              {userMode === 'buyer' ? 'Your Purchases' : 'Your Deals'}
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading deals...</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {userMode === 'buyer' ? <ShoppingBag className="w-8 h-8 text-gray-400" /> : <Store className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {userMode === 'buyer' ? 'No purchases yet' : 'No deals created yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {userMode === 'buyer' 
                    ? 'When you accept deals, they will appear here.' 
                    : 'Create your first deal to start selling securely.'
                  }
                </p>
                {userMode === 'seller' && (
                  <Link
                    href="/dashboard/create-deal"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Deal</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                            {getStatusIcon(deal.status)}
                            <span className="capitalize">{deal.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Deal ID: {deal.deal_code}</span>
                          <span>${deal.amount.toLocaleString()}</span>
                          <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/dashboard/deals/${deal.id}`}
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
