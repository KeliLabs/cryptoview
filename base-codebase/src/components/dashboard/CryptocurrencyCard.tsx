'use client';

import { CryptocurrencyWithLatestData } from '@/lib/database/data-fetching';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Globe, Hash } from 'lucide-react';
import JsonDisplay from '@/components/utils/jsondisplay';
import { BlockchairStats } from '@/lib/api/blockchair';
interface CryptocurrencyCardProps {
  cryptocurrency: CryptocurrencyWithLatestData;
}

export default function CryptocurrencyCard({ cryptocurrency }: CryptocurrencyCardProps) {
  const { blockchainStats } = cryptocurrency;
  const stats: unknown = blockchainStats?.data;

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

  const priceChange = stats?.market_price_usd_change_24h_percentage;
  const isPriceUp = priceChange && priceChange > 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{cryptocurrency.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{cryptocurrency.symbol}</Badge>
              <Badge variant="secondary" className="text-xs">
                {cryptocurrency.blockchain}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatPrice(stats?.market_price_usd)}
            </div>
            {priceChange && (
              <div className={`flex items-center gap-1 text-sm ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
                {isPriceUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {priceChange.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {/* <JsonDisplay jsonData={cryptocurrency} /> */}
      <CardContent className="space-y-4">
        {/* Market Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-medium">{formatNumber(stats?.market_cap_usd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Volume 24h</p>
            <p className="font-medium">{formatNumber(stats?.volume_24h)}</p>
          </div>
        </div>

        {/* Blockchain Statistics */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Activity size={16} />
            Blockchain Stats
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Blocks</p>
              <p className="font-medium">{formatNumber(stats?.blocks)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Transactions</p>
              <p className="font-medium">{formatNumber(stats?.transactions)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Blocks 24h</p>
              <p className="font-medium">{formatNumber(stats?.blocks_24h)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Transactions 24h</p>
              <p className="font-medium">{formatNumber(stats?.transactions_24h)}</p>
            </div>
          </div>
        </div>

        {/* Technical Data */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Hash size={16} />
            Network
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hash Rate:</span>
              <span className="font-medium">{formatHashRate(stats?.hashrate_24h)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium">{formatNumber(stats?.difficulty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Circulation:</span>
              <span className="font-medium">{formatNumber(stats?.circulation)}</span>
            </div>
          </div>
        </div>

        {/* Mempool Data */}
        {stats?.mempool_transactions && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Globe size={16} />
              Mempool
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Pending TXs</p>
                <p className="font-medium">{formatNumber(stats.mempool_transactions)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formatNumber(stats.mempool_size)} bytes</p>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          Last updated: {new Date(stats?.best_block_time || Date.now()).toLocaleString()}
        </div>
      </CardContent>
    </Card>
    
  );
}
