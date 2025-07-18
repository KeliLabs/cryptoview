import { getGeneralStats, Blockchain, BlockchairStats } from '../api/blockchair';
import { CryptocurrencyService, HistoricalDataService } from '../database/services';
import { CacheService } from '../database/cache';
import { Cryptocurrency, HistoricalData } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CryptocurrencyWithLatestData extends Cryptocurrency {
  latestData?: HistoricalData | null;
  blockchainStats?: BlockchairStats | null;
}

export class DataFetchingService {
  // Fetch cryptocurrency data with caching
  static async getCryptocurrencyData(
    symbol: string,
    forceRefresh: boolean = false
  ): Promise<CryptocurrencyWithLatestData | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = await CacheService.getCachedCryptocurrency<CryptocurrencyWithLatestData>(symbol);
      if (cached) {
        return cached;
      }
    }

    // Get from database
    const cryptocurrency = await CryptocurrencyService.getBySymbol(symbol);
    if (!cryptocurrency) {
      return null;
    }

    // Get latest historical data
    const latestData = await HistoricalDataService.getLatest(cryptocurrency.id);
    
    // Get blockchain stats from API
    let blockchainStats: BlockchairStats | null = null;
    if (cryptocurrency.blockchairId) {
      blockchainStats = await this.getBlockchainStats(
        cryptocurrency.blockchairId as Blockchain,
        forceRefresh
      );
    }

    const result: CryptocurrencyWithLatestData = {
      ...cryptocurrency,
      latestData,
      blockchainStats,
    };

    // Cache the result
    await CacheService.cacheCryptocurrency(symbol, result, 300); // 5 minutes

    return result;
  }

  // Fetch blockchain stats with caching
  static async getBlockchainStats(
    blockchain: Blockchain,
    forceRefresh: boolean = false
  ): Promise<BlockchairStats | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = await CacheService.getCachedBlockchainStats<BlockchairStats>(blockchain);
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    try {
      const stats = await getGeneralStats(blockchain);
      // Cache the result TODO: Uncomment this line to enable caching
      await CacheService.cacheBlockchainStats(blockchain, stats, 300); // 5 minutes
      
      return stats;
    } catch (error) {
      console.error(`Error fetching blockchain stats for ${blockchain}:`, error);
      return null;
    }
  }

  // Store blockchain stats as historical data
  static async storeHistoricalData(
    blockchain: Blockchain,
    forceRefresh: boolean = false
  ): Promise<void> {
    const cryptocurrency = await CryptocurrencyService.getByBlockchain(blockchain);
    if (!cryptocurrency) {
      console.error(`Cryptocurrency not found for blockchain: ${blockchain}`);
      return;
    }

    const stats = await this.getBlockchainStats(blockchain, forceRefresh);
    if (!stats) {
      console.error(`No stats data for blockchain: ${blockchain}`);
      return;
    }

    // Access the blockchain-specific data
    const blockchainData = stats?.data;
    if (!blockchainData) {
      console.error(`No blockchain data for: ${blockchain}`);
      return;
    }

    const timestamp = new Date();
    const price =  blockchainData.market_price_usd ? new Decimal(blockchainData.market_price_usd.toString()) : null;
    const marketCap = blockchainData.market_cap_usd ? Math.floor(blockchainData.market_cap_usd) : null;
    const volume24h = blockchainData.volume_24h ? Math.floor(blockchainData.volume_24h) : null;
    const blockCount = blockchainData.blocks || null;
    const transactionCount = blockchainData.transactions || null;
    const hashRate = blockchainData.hashrate_24h ? Math.floor(blockchainData.hashrate_24h) : null;

    // Prepare historical data - convert BigInt values to appropriate types
    // const historicalData: Omit<HistoricalData, 'id' | 'createdAt'> = 
    
    // TODO: Fix the bigint parsing issues in the historical data

    // Store in database
    await HistoricalDataService.store({
      cryptoId: cryptocurrency.id,
      price: price,
      marketCap: marketCap,
      volume24h: volume24h,
      blockCount: blockCount,
      transactionCount: transactionCount,
      hashRate: hashRate,
      timestamp,
      dataSource: 'blockchair',
    });
  }
/*
static sanitizeHistoricalData(input: any): any {
  return {
    ...input,
    marketCap: input.marketCap?.toString(),
    volume24h: input.volume24h?.toString(),
    blockCount: input.blockCount?.toString(),
    transactionCount: input.transactionCount?.toString(),
    // hashRate: input.hashRate?.toString(),
    timestamp: new Date(input.timestamp), // Ensure Date
  };
}
*/
  // Get all cryptocurrencies with latest data
  static async getAllCryptocurrencies(
    forceRefresh: boolean = false
  ): Promise<CryptocurrencyWithLatestData[]> {
    const cryptocurrencies = await CryptocurrencyService.getAll();
    
    const results = await Promise.all(
      cryptocurrencies.map(async (crypto) => {
        const data = await this.getCryptocurrencyData(crypto.symbol, forceRefresh);
        return data || crypto;
      })
    );

    return results;
  }

  // Refresh all cryptocurrency data
  static async refreshAllData(): Promise<void> {
    const cryptocurrencies = await CryptocurrencyService.getAll();
    
    await Promise.all(
      cryptocurrencies.map(async (crypto) => {
        if (crypto.blockchairId) {
          await this.storeHistoricalData(crypto.blockchairId as Blockchain, true);
        }
      })
    );
  }

  // Get historical data for a cryptocurrency
  static async getHistoricalData(
    symbol: string,
    timeRange: string = '24h'
  ): Promise<HistoricalData[]> {
    const cacheKey = CacheService.historicalDataKey(symbol, timeRange);
    
    // Check cache first
    const cached = await CacheService.get<HistoricalData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const cryptocurrency = await CryptocurrencyService.getBySymbol(symbol);
    if (!cryptocurrency) {
      return [];
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }

    const historicalData = await HistoricalDataService.getRange(
      cryptocurrency.id,
      startDate,
      endDate
    );

    // Cache the result
    await CacheService.set(cacheKey, historicalData, 600); // 10 minutes

    return historicalData;
  }
}
