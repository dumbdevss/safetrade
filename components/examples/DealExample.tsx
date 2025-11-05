'use client';

import { useState, useEffect } from 'react';
import { dealApi } from '@/utils/api';
import { Deal } from '@/types/database';
import { formatNaira, DEFAULT_CURRENCY } from '@/utils/currency';

export default function DealExample() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const response = await dealApi.getDeals() as { deals: Deal[] };
      setDeals(response.deals);
    } catch (err: any) {
      setError(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async () => {
    try {
      const newDeal = await dealApi.createDeal({
        title: 'Example Deal',
        description: 'This is an example deal',
        amount: 50000.00,
        currency: DEFAULT_CURRENCY,
        delivery_method: 'physical'
      });
      
      // Reload deals to show the new one
      loadDeals();
    } catch (err: any) {
      setError(err.message || 'Failed to create deal');
    }
  };

  if (loading) {
    return <div className="p-4">Loading deals...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Deals</h2>
        <button
          onClick={createDeal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Deal
        </button>
      </div>

      {deals.length === 0 ? (
        <p className="text-gray-500">No deals found. Create your first deal!</p>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{deal.title}</h3>
              <p className="text-gray-600">{deal.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{formatNaira(deal.amount)}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  deal.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {deal.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Deal Code: {deal.deal_code}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
