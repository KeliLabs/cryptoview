'use client';

import { useState, useEffect } from 'react';
import { CryptocurrencyWithLatestData } from '@/lib/database/data-fetching';
import CryptocurrencyCard from './CryptocurrencyCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export default function CryptocurrencyDashboard() {
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptocurrencyWithLatestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCryptocurrencies = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/cryptocurrencies?refresh=${forceRefresh}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCryptocurrencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching cryptocurrencies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptocurrencies();
  }, []);

  const handleRefresh = () => {
    fetchCryptocurrencies(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading cryptocurrencies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-600">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => fetchCryptocurrencies()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cryptocurrency Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time blockchain data and market statistics
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300">Total Cryptocurrencies</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{cryptocurrencies.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-700 dark:text-green-300">Active Networks</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {cryptocurrencies.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-purple-700 dark:text-purple-300">With Live Data</h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {cryptocurrencies.filter(c => c.blockchainStats).length}
          </p>
        </div>
      </div>

      {/* Cryptocurrency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptocurrencies.map((crypto) => (
          <CryptocurrencyCard key={crypto.id} cryptocurrency={crypto} />
        ))}
      </div>

      {/* Empty State */}
      {cryptocurrencies.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No cryptocurrencies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Try refreshing the data or check your connection.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-8 border-t">
        <p>
          Data provided by Blockchair API • Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
