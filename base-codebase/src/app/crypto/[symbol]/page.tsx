'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CryptocurrencyWithLatestData } from '@/lib/database/data-fetching';
import { HistoricalData } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Globe, Hash, Loader2, AlertCircle } from 'lucide-react';
import CryptoChart from '@/components/charts/CryptoChart';

// Extended interface for the actual API response
interface ExtendedBlockchairStatsData {
  blocks: number;
  transactions: number;
  outputs?: number;
  volume_usd?: number;
  mempool_transactions?: number;
  mempool_size?: number;
  market_price_usd?: number;
  market_price_btc?: number;
  market_cap_usd?: number;
  hash_rate?: number;
  inflation_usd?: number;
  average_transaction_fee_usd?: number;
  hashrate_24h?: number | string;
  volume_24h?: number;
  blocks_24h?: number;
  transactions_24h?: number;
  difficulty?: number;
  circulation?: number;
  best_block_time?: string;
  market_price_usd_change_24h_percentage?: number;
}

export default function CryptoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string;

  const [cryptocurrency, setCryptocurrency] = useState<CryptocurrencyWithLatestData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch cryptocurrency data
        const cryptoResponse = await fetch('/api/cryptocurrencies');
        if (!cryptoResponse.ok) {
          throw new Error(`Failed to fetch cryptocurrency data: ${cryptoResponse.status}`);
        }
        
        const cryptoData = await cryptoResponse.json();
        const crypto = cryptoData.find((c: CryptocurrencyWithLatestData) => 
          c.symbol.toLowerCase() === symbol.toLowerCase()
        );

        if (!crypto) {
          throw new Error(`Cryptocurrency ${symbol.toUpperCase()} not found`);
        }

        setCryptocurrency(crypto);

        // Fetch historical data
        const historicalResponse = await fetch(`/api/historical-data?symbol=${symbol}&range=30d`);
        if (!historicalResponse.ok) {
          throw new Error(`Failed to fetch historical data: ${historicalResponse.status}`);
        }
        
        const historicalData = await historicalResponse.json();
        setHistoricalData(historicalData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching crypto data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [symbol]);

  const formatNumber = (num: number | bigint | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    const numValue = typeof num === 'bigint' ? Number(num) : num;
    if (numValue >= 1e9) return (numValue / 1e9).toFixed(2) + 'B';
    if (numValue >= 1e6) return (numValue / 1e6).toFixed(2) + 'M';
    if (numValue >= 1e3) return (numValue / 1e3).toFixed(2) + 'K';
    return numValue.toLocaleString();
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatHashRate = (hashRate: string | number | null | undefined): string => {
    if (!hashRate) return 'N/A';
    const rate = typeof hashRate === 'string' ? parseFloat(hashRate) : hashRate;
    if (rate >= 1e18) return (rate / 1e18).toFixed(2) + ' EH/s';
    if (rate >= 1e15) return (rate / 1e15).toFixed(2) + ' PH/s';
    if (rate >= 1e12) return (rate / 1e12).toFixed(2) + ' TH/s';
    if (rate >= 1e9) return (rate / 1e9).toFixed(2) + ' GH/s';
    return rate.toLocaleString() + ' H/s';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading {symbol?.toUpperCase()} data...</span>
        </div>
      </div>
    );
  }

  if (error || !cryptocurrency) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-600">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const stats = cryptocurrency.blockchainStats?.data as ExtendedBlockchairStatsData;
  const priceChange = stats?.market_price_usd_change_24h_percentage;
  const isPriceUp = priceChange && priceChange > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cryptocurrency.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{cryptocurrency.symbol}</Badge>
              <Badge variant="secondary">{cryptocurrency.blockchain}</Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">
            {formatPrice(stats?.market_price_usd)}
          </div>
          {priceChange && (
            <div className={`flex items-center gap-1 text-lg ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
              {isPriceUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {priceChange.toFixed(2)}% (24h)
            </div>
          )}
        </div>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <CryptoChart data={historicalData} symbol={cryptocurrency.symbol} />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.market_cap_usd)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Volume 24h</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.volume_24h)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Circulation</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.circulation)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Hash Rate</p>
              <p className="text-2xl font-bold">{formatHashRate(stats?.hashrate_24h)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Blockchain Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Blockchain Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Blocks</p>
                <p className="font-bold">{formatNumber(stats?.blocks)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="font-bold">{formatNumber(stats?.transactions)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Blocks (24h)</p>
                <p className="font-bold">{formatNumber(stats?.blocks_24h)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Transactions (24h)</p>
                <p className="font-bold">{formatNumber(stats?.transactions_24h)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash size={20} />
              Network Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">{formatNumber(stats?.difficulty)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hash Rate (24h):</span>
                <span className="font-medium">{formatHashRate(stats?.hashrate_24h)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Block:</span>
                <span className="font-medium">
                  {stats?.best_block_time ? new Date(stats.best_block_time).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mempool Information */}
      {stats?.mempool_transactions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              Mempool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Transactions</p>
                <p className="text-2xl font-bold">{formatNumber(stats.mempool_transactions)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mempool Size</p>
                <p className="text-2xl font-bold">{formatNumber(stats.mempool_size)} bytes</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
