'use client';

import { useState } from 'react';
import { Shield, ArrowLeft, DollarSign, Package, Truck, Globe, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { formatNaira, DEFAULT_CURRENCY } from '@/utils/currency';

export default function CreateDealPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: DEFAULT_CURRENCY,
    deliveryMethod: 'physical',
    deliveryAddress: '',
    expiresIn: '7' // days
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdDeal, setCreatedDeal] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresIn));

      const { data, error } = await supabase
        .from('deals')
        .insert([
          {
            seller_id: user.id,
            title: formData.title,
            description: formData.description,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            delivery_method: formData.deliveryMethod,
            delivery_address: formData.deliveryAddress,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
            link_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        setError(error.message);
      } else {
        setCreatedDeal(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyDealLink = async () => {
    if (createdDeal) {
      const dealLink = `${window.location.origin}/deal/${createdDeal.deal_code}`;
      await navigator.clipboard.writeText(dealLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdDeal) {
    const dealLink = `${window.location.origin}/deal/${createdDeal.deal_code}`;
    
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
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Deal Created Successfully!</h1>
            <p className="text-gray-400">Your deal is now live and ready to be shared</p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Deal Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deal ID:</span>
                  <span className="text-white font-mono">{createdDeal.deal_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Title:</span>
                  <span className="text-white">{createdDeal.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">{formatNaira(createdDeal.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400 capitalize">{createdDeal.status}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Share Your Deal</h3>
              <p className="text-gray-400 mb-4">
                Send this link to your buyer. They can view the deal details and accept without creating an account first.
              </p>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={dealLink}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none"
                />
                <button
                  onClick={copyDealLink}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/dashboard/create-deal"
                onClick={() => {
                  setCreatedDeal(null);
                  setFormData({
                    title: '',
                    description: '',
                    amount: '',
                    currency: DEFAULT_CURRENCY,
                    deliveryMethod: 'physical',
                    deliveryAddress: '',
                    expiresIn: '7'
                  });
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-center"
              >
                Create Another Deal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Deal</h1>
          <p className="text-gray-400">Set up a secure escrow deal for your buyer</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Deal Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., iPhone 14 Pro Max - Unlocked"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Provide detailed information about the item or service..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Method *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'physical', label: 'Physical Item', icon: Package },
                  { value: 'digital', label: 'Digital Item', icon: Globe },
                  { value: 'service', label: 'Service', icon: Truck }
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.deliveryMethod === value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={value}
                      checked={formData.deliveryMethod === value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <Icon className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.deliveryMethod === 'physical' && (
              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Address
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  rows={3}
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Enter the delivery address..."
                />
              </div>
            )}

            <div>
              <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-300 mb-2">
                Deal Expires In
              </label>
              <select
                id="expiresIn"
                name="expiresIn"
                value={formData.expiresIn}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <h4 className="text-indigo-300 font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• You create the deal and share the link with your buyer</li>
                <li>• Buyer views the deal and accepts (no account needed initially)</li>
                <li>• Buyer creates account and funds are held in escrow</li>
                <li>• You ship the item and mark as shipped</li>
                <li>• Buyer confirms receipt and funds are released to you</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="flex-1 border border-gray-600 text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-700/50 transition-all duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Deal...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
