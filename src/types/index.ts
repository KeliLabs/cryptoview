// TypeScript type definitions for the Blockchain Investment Dashboard

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  blockchain: string;
  blockchairId?: string;
  coingeckoId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface HistoricalData {
  id: string;
  cryptoId: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  blockCount?: number;
  transactionCount?: number;
  hashRate?: number;
  timestamp: Date;
  dataSource: string;
  createdAt: Date;
}

export interface AiPrediction {
  id: string;
  cryptoId: string;
  predictionType: string;
  predictedValue?: number;
  confidenceScore?: number;
  reasoning?: string;
  validUntil?: Date;
  createdAt: Date;
}

export interface NewsSentiment {
  id: string;
  cryptoId: string;
  headline: string;
  url?: string;
  sentimentScore?: number;
  source?: string;
  publishedAt?: Date;
  createdAt: Date;
}

export interface DashboardData {
  cryptocurrency: Cryptocurrency;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  historicalData: HistoricalData[];
  aiPredictions: AiPrediction[];
  newsSentiment: NewsSentiment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface BlockchairStats {
  blocks: number;
  transactions: number;
  outputs: number;
  circulation: number;
  market_price_usd: number;
  market_cap_usd: number;
  hashrate_24h: number;
  difficulty: number;
}

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  description?: string;
  sentiment?: number;
}

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface DashboardConfig {
  refreshInterval: number;
  autoRefresh: boolean;
  theme: 'light' | 'dark';
  selectedCryptocurrencies: string[];
  chartTimeframe: '1h' | '24h' | '7d' | '30d' | '1y';
}
