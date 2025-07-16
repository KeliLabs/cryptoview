# Blockchair Dashboard Features - Implementation Guide

## Overview
This guide provides detailed implementation instructions for integrating the proposed Blockchair API features into the CryptoView dashboard.

## Enhanced Blockchair API Client

### Extended API Client Implementation

```typescript
// Enhanced blockchair.ts - Add to existing file
import axios from 'axios';

// Add new types for additional endpoints
export interface BlockchairTransaction {
  data: Array<{
    hash: string;
    time: string;
    size: number;
    value: number;
    value_usd: number;
    fee: number;
    fee_usd: number;
    inputs: Array<{
      address: string;
      value: number;
    }>;
    outputs: Array<{
      address: string;
      value: number;
    }>;
  }>;
}

export interface BlockchairMempool {
  data: {
    transactions: number;
    size: number;
    tps: number;
    total_fee_usd: number;
    suggested_transaction_fee_per_byte_sat: number;
  };
}

export interface BlockchairBlocks {
  data: Array<{
    id: number;
    hash: string;
    time: string;
    size: number;
    transaction_count: number;
    difficulty: number;
    guessed_miner: string;
  }>;
}

// New API functions to add
export async function getRecentTransactions(
  blockchain: Blockchain, 
  limit: number = 10,
  minValue?: number
) {
  const url = `${BASE_URL}/${blockchain}/transactions`;
  const params = {
    ...getAuthParams(),
    limit,
    ...(minValue && { 'q': `output_total_usd(${minValue}..)` })
  };
  const response = await axios.get<BlockchairTransaction>(url, { params });
  return response.data;
}

export async function getMempoolInfo(blockchain: Blockchain) {
  const url = `${BASE_URL}/${blockchain}/mempool/fees`;
  const params = getAuthParams();
  const response = await axios.get<BlockchairMempool>(url, { params });
  return response.data;
}

export async function getRecentBlocks(blockchain: Blockchain, limit: number = 10) {
  const url = `${BASE_URL}/${blockchain}/blocks`;
  const params = { ...getAuthParams(), limit };
  const response = await axios.get<BlockchairBlocks>(url, { params });
  return response.data;
}

export async function getTopAddresses(blockchain: Blockchain, limit: number = 100) {
  const url = `${BASE_URL}/${blockchain}/addresses`;
  const params = { 
    ...getAuthParams(), 
    limit,
    'sort': 'balance',
    'order': 'desc'
  };
  const response = await axios.get(url, { params });
  return response.data;
}
```

## Feature Implementation Examples

### 1. Live Transaction Feed Component

```typescript
// components/dashboard/LiveTransactionFeed.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getRecentTransactions, Blockchain } from '@/lib/api/blockchair';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

interface Transaction {
  hash: string;
  time: string;
  value: number;
  value_usd: number;
  fee_usd: number;
}

export function LiveTransactionFeed({ blockchain }: { blockchain: Blockchain }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [minValue, setMinValue] = useState<number>(1000); // Filter for transactions > $1000

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getRecentTransactions(blockchain, 20, minValue);
        setTransactions(data.data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [blockchain, minValue]);

  if (loading) return <div className="animate-pulse">Loading transactions...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Live Transaction Feed</h3>
        <select 
          value={minValue} 
          onChange={(e) => setMinValue(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={1000}>$1,000+</option>
          <option value={10000}>$10,000+</option>
          <option value={100000}>$100,000+</option>
        </select>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.hash} className="border-b pb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-sm text-blue-600 truncate w-32">
                  {tx.hash}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(tx.time)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatCurrency(tx.value_usd)}
                </p>
                <p className="text-xs text-gray-500">
                  Fee: {formatCurrency(tx.fee_usd)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Whale Tracker Dashboard

```typescript
// components/dashboard/WhaleTracker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getTopAddresses, getAddressData, Blockchain } from '@/lib/api/blockchair';

interface WhaleAddress {
  address: string;
  balance: number;
  balance_usd: number;
  transaction_count: number;
  last_activity: string;
}

export function WhaleTracker({ blockchain }: { blockchain: Blockchain }) {
  const [whales, setWhales] = useState<WhaleAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWhale, setSelectedWhale] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhales = async () => {
      try {
        setLoading(true);
        const data = await getTopAddresses(blockchain, 50);
        // Process and format the data
        const processedWhales = data.data.slice(0, 20).map((addr: any) => ({
          address: addr.address,
          balance: addr.balance,
          balance_usd: addr.balance_usd,
          transaction_count: addr.transaction_count,
          last_activity: addr.last_seen_receiving || addr.last_seen_spending
        }));
        setWhales(processedWhales);
      } catch (error) {
        console.error('Failed to fetch whale data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWhales();
    const interval = setInterval(fetchWhales, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [blockchain]);

  const handleWhaleClick = async (address: string) => {
    setSelectedWhale(address);
    // Fetch detailed address data for modal/sidebar
    try {
      const details = await getAddressData(blockchain, address);
      // Handle detailed whale data display
    } catch (error) {
      console.error('Failed to fetch whale details:', error);
    }
  };

  if (loading) return <div className="animate-pulse">Loading whale data...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">🐋 Top Whale Addresses</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Rank</th>
              <th className="text-left p-2">Address</th>
              <th className="text-right p-2">Balance (USD)</th>
              <th className="text-right p-2">Transactions</th>
              <th className="text-right p-2">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {whales.map((whale, index) => (
              <tr 
                key={whale.address} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleWhaleClick(whale.address)}
              >
                <td className="p-2 font-bold">{index + 1}</td>
                <td className="p-2 font-mono text-xs">
                  {whale.address.slice(0, 10)}...{whale.address.slice(-6)}
                </td>
                <td className="p-2 text-right font-semibold text-green-600">
                  {formatCurrency(whale.balance_usd)}
                </td>
                <td className="p-2 text-right">{whale.transaction_count.toLocaleString()}</td>
                <td className="p-2 text-right text-xs text-gray-500">
                  {formatTimeAgo(whale.last_activity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 3. Network Health Monitor

```typescript
// components/dashboard/NetworkHealthMonitor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStats, getMempoolInfo, Blockchain } from '@/lib/api/blockchair';

interface NetworkHealth {
  congestion: 'low' | 'medium' | 'high';
  avgFee: number;
  mempoolSize: number;
  hashRate: number;
  blockTime: number;
  healthScore: number;
}

export function NetworkHealthMonitor({ blockchain }: { blockchain: Blockchain }) {
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateHealthScore = (stats: any, mempool: any): NetworkHealth => {
    const avgFee = mempool.data.suggested_transaction_fee_per_byte_sat || 0;
    const mempoolSize = mempool.data.size || 0;
    const hashRate = stats.data[blockchain]?.hash_rate || 0;
    
    // Simple health scoring algorithm
    let congestion: 'low' | 'medium' | 'high' = 'low';
    if (mempoolSize > 50000000) congestion = 'high';
    else if (mempoolSize > 20000000) congestion = 'medium';
    
    const healthScore = Math.max(0, Math.min(100, 
      100 - (avgFee * 2) - (mempoolSize / 1000000)
    ));

    return {
      congestion,
      avgFee,
      mempoolSize,
      hashRate,
      blockTime: 600, // Approximate for Bitcoin
      healthScore: Math.round(healthScore)
    };
  };

  useEffect(() => {
    const fetchNetworkHealth = async () => {
      try {
        setLoading(true);
        const [stats, mempool] = await Promise.all([
          getDashboardStats(blockchain),
          getMempoolInfo(blockchain)
        ]);
        
        const healthData = calculateHealthScore(stats, mempool);
        setHealth(healthData);
      } catch (error) {
        console.error('Failed to fetch network health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkHealth();
    const interval = setInterval(fetchNetworkHealth, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [blockchain]);

  if (loading || !health) return <div className="animate-pulse">Loading network health...</div>;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Network Health Monitor</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 ${getHealthColor(health.healthScore)}`}>
            {health.healthScore}
          </div>
          <p className="text-sm text-gray-600">Health Score</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            {health.congestion === 'low' ? '🟢' : health.congestion === 'medium' ? '🟡' : '🔴'}
          </div>
          <p className="text-sm text-gray-600">Congestion</p>
          <p className="text-xs capitalize">{health.congestion}</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold mb-2">{health.avgFee} sat/B</div>
          <p className="text-sm text-gray-600">Avg Fee</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold mb-2">
            {(health.mempoolSize / 1000000).toFixed(1)}MB
          </div>
          <p className="text-sm text-gray-600">Mempool Size</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold mb-2">
            {(health.hashRate / 1000000000000000000).toFixed(2)}EH/s
          </div>
          <p className="text-sm text-gray-600">Hash Rate</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold mb-2">{Math.round(health.blockTime / 60)}m</div>
          <p className="text-sm text-gray-600">Block Time</p>
        </div>
      </div>
    </div>
  );
}
```

## API Route Implementations

### Enhanced API Routes

```typescript
// app/api/whale-tracker/route.ts
import { NextRequest } from 'next/server';
import { getTopAddresses, Blockchain } from '@/lib/api/blockchair';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blockchain = searchParams.get('blockchain') as Blockchain || 'bitcoin';
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getTopAddresses(blockchain, limit);
    
    // Process and enrich the data
    const processedData = result.data.slice(0, limit).map((addr: any) => ({
      address: addr.address,
      balance: addr.balance,
      balance_usd: addr.balance_usd,
      transaction_count: addr.transaction_count,
      first_seen: addr.first_seen_receiving,
      last_seen: addr.last_seen_receiving || addr.last_seen_spending,
      type: addr.type
    }));

    return Response.json({ 
      data: processedData,
      blockchain,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Whale tracker API error:', error);
    return Response.json({ error: 'Failed to fetch whale data' }, { status: 500 });
  }
}
```

```typescript
// app/api/network-health/route.ts
import { NextRequest } from 'next/server';
import { getDashboardStats, getMempoolInfo, Blockchain } from '@/lib/api/blockchair';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blockchain = searchParams.get('blockchain') as Blockchain || 'bitcoin';

    const [stats, mempool] = await Promise.all([
      getDashboardStats(blockchain),
      getMempoolInfo(blockchain)
    ]);

    // Calculate health metrics
    const avgFee = mempool.data.suggested_transaction_fee_per_byte_sat || 0;
    const mempoolSize = mempool.data.size || 0;
    const transactionCount = stats.data[blockchain]?.transactions || 0;
    const hashRate = stats.data[blockchain]?.hash_rate || 0;

    const healthScore = Math.max(0, Math.min(100, 
      100 - (avgFee * 2) - (mempoolSize / 1000000)
    ));

    let congestion: 'low' | 'medium' | 'high' = 'low';
    if (mempoolSize > 50000000) congestion = 'high';
    else if (mempoolSize > 20000000) congestion = 'medium';

    return Response.json({
      blockchain,
      health: {
        score: Math.round(healthScore),
        congestion,
        metrics: {
          avgFee,
          mempoolSize,
          transactionCount,
          hashRate,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Network health API error:', error);
    return Response.json({ error: 'Failed to fetch network health' }, { status: 500 });
  }
}
```

## Database Schema Extensions

### Additional Prisma Models

```prisma
// Add to existing schema.prisma

model WhaleAddress {
  id          String   @id @default(cuid())
  address     String   @unique
  blockchain  String
  balance     Decimal
  balanceUsd  Decimal?
  txCount     Int
  firstSeen   DateTime?
  lastSeen    DateTime?
  type        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("whale_addresses")
}

model NetworkHealth {
  id            String   @id @default(cuid())
  blockchain    String
  healthScore   Int
  congestion    String
  avgFee        Decimal
  mempoolSize   BigInt
  hashRate      BigInt?
  blockTime     Int?
  timestamp     DateTime
  createdAt     DateTime @default(now())

  @@unique([blockchain, timestamp])
  @@map("network_health")
}

model TransactionAlert {
  id          String   @id @default(cuid())
  address     String
  blockchain  String
  txHash      String
  value       Decimal
  valueUsd    Decimal?
  type        String   // 'large_transaction', 'whale_movement', etc.
  processed   Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("transaction_alerts")
}
```

## Background Jobs & Caching

### Data Synchronization Jobs

```typescript
// lib/jobs/whaleTracker.ts
import Bull from 'bull';
import { PrismaClient } from '@prisma/client';
import { getTopAddresses, Blockchain } from '@/lib/api/blockchair';

const prisma = new PrismaClient();
const whaleQueue = new Bull('whale tracking', process.env.REDIS_URL!);

whaleQueue.process('update-whales', async (job) => {
  const { blockchain } = job.data;
  
  try {
    const data = await getTopAddresses(blockchain as Blockchain, 100);
    
    // Batch update whale addresses
    for (const addr of data.data.slice(0, 50)) {
      await prisma.whaleAddress.upsert({
        where: { address: addr.address },
        update: {
          balance: addr.balance,
          balanceUsd: addr.balance_usd,
          txCount: addr.transaction_count,
          lastSeen: addr.last_seen_receiving || addr.last_seen_spending,
          updatedAt: new Date()
        },
        create: {
          address: addr.address,
          blockchain,
          balance: addr.balance,
          balanceUsd: addr.balance_usd,
          txCount: addr.transaction_count,
          firstSeen: addr.first_seen_receiving,
          lastSeen: addr.last_seen_receiving || addr.last_seen_spending,
          type: addr.type
        }
      });
    }

    console.log(`Updated ${blockchain} whale data`);
  } catch (error) {
    console.error(`Failed to update ${blockchain} whales:`, error);
    throw error;
  }
});

// Schedule whale updates every 10 minutes
whaleQueue.add('update-whales', { blockchain: 'bitcoin' }, { 
  repeat: { cron: '*/10 * * * *' } 
});
whaleQueue.add('update-whales', { blockchain: 'ethereum' }, { 
  repeat: { cron: '*/10 * * * *' } 
});

export { whaleQueue };
```

## Testing Implementation

### API Route Tests

```typescript
// __tests__/api/whale-tracker.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/whale-tracker/route';

describe('/api/whale-tracker', () => {
  it('should return whale data for bitcoin', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: { blockchain: 'bitcoin', limit: '10' }
    });

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(10);
    expect(data.blockchain).toBe('bitcoin');
    expect(data.data[0]).toHaveProperty('address');
    expect(data.data[0]).toHaveProperty('balance_usd');
  });
});
```

## Deployment & Monitoring

### Environment Variables

```bash
# Add to .env
BLOCKCHAIR_API_KEY=your_blockchair_api_key
REDIS_URL=redis://localhost:6379
WHALE_ALERT_WEBHOOK_URL=https://your-app.com/api/whale-alerts
ENABLE_BACKGROUND_JOBS=true
MAX_API_REQUESTS_PER_MINUTE=60
```

### Monitoring Dashboard

```typescript
// components/admin/ApiMonitoring.tsx
export function ApiMonitoring() {
  // Monitor API usage, rate limits, error rates
  // Display real-time stats for Blockchair API consumption
  // Alert on rate limit approaching
  // Track feature usage analytics
}
```

This implementation guide provides the foundation for building robust, scalable dashboard features using the Blockchair API while integrating seamlessly with the existing CryptoView architecture.