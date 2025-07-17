import { Cryptocurrency, HistoricalData, AiPrediction, NewsSentiment } from '@prisma/client';
import { prisma } from './prisma';

export type CryptocurrencyWithRelations = Cryptocurrency & {
  historicalData: HistoricalData[];
  aiPredictions: AiPrediction[];
  newsSentiment: NewsSentiment[];
};

export class CryptocurrencyService {
  // Get all cryptocurrencies
  static async getAll(): Promise<Cryptocurrency[]> {
    return prisma.cryptocurrency.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' },
    });
  }

  // Get cryptocurrency by symbol
  static async getBySymbol(symbol: string): Promise<Cryptocurrency | null> {
    return prisma.cryptocurrency.findFirst({
      where: { symbol: symbol.toUpperCase() },
    });
  }

  // Get cryptocurrency by blockchain
  static async getByBlockchain(blockchain: string): Promise<Cryptocurrency | null> {
    return prisma.cryptocurrency.findFirst({
      where: { blockchain },
    });
  }

  // Get cryptocurrency with all relations
  static async getWithRelations(id: string): Promise<CryptocurrencyWithRelations | null> {
    return prisma.cryptocurrency.findUnique({
      where: { id },
      include: {
        historicalData: {
          orderBy: { timestamp: 'desc' },
          take: 100, // Last 100 data points
        },
        aiPredictions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        newsSentiment: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  // Create or update cryptocurrency
  static async upsert(data: Omit<Cryptocurrency, 'id' | 'createdAt'>): Promise<Cryptocurrency> {
    return prisma.cryptocurrency.upsert({
      where: { symbol: data.symbol },
      update: data,
      create: data,
    });
  }
}

export class HistoricalDataService {
  // Store historical data
  static async store(data: Omit<HistoricalData, 'id' | 'createdAt'>): Promise<HistoricalData> {
    console.log(`Storing historical data for ${data.cryptoId} at ${data.timestamp.toISOString()}`, data);
    return prisma.historicalData.create({
      data,
    });
  }

  // Get latest data for a cryptocurrency
  static async getLatest(cryptoId: string): Promise<HistoricalData | null> {
    return prisma.historicalData.findFirst({
      where: { cryptoId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Get historical data for a time range
  static async getRange(
    cryptoId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalData[]> {
    return prisma.historicalData.findMany({
      where: {
        cryptoId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Store bulk historical data
  static async storeBulk(data: Omit<HistoricalData, 'id' | 'createdAt'>[]): Promise<void> {
    await prisma.historicalData.createMany({
      data,
      skipDuplicates: true,
    });
  }
}

export class AiPredictionService {
  // Store AI prediction
  static async store(data: Omit<AiPrediction, 'id' | 'createdAt'>): Promise<AiPrediction> {
    return prisma.aiPrediction.create({
      data,
    });
  }

  // Get latest predictions for a cryptocurrency
  static async getLatest(cryptoId: string, limit: number = 5): Promise<AiPrediction[]> {
    return prisma.aiPrediction.findMany({
      where: { cryptoId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get predictions by type
  static async getByType(
    cryptoId: string,
    predictionType: string
  ): Promise<AiPrediction[]> {
    return prisma.aiPrediction.findMany({
      where: { cryptoId, predictionType },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class NewsSentimentService {
  // Store news sentiment
  static async store(data: Omit<NewsSentiment, 'id' | 'createdAt'>): Promise<NewsSentiment> {
    return prisma.newsSentiment.create({
      data,
    });
  }

  // Get latest news sentiment
  static async getLatest(cryptoId: string, limit: number = 10): Promise<NewsSentiment[]> {
    return prisma.newsSentiment.findMany({
      where: { cryptoId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get sentiment by time range
  static async getByDateRange(
    cryptoId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NewsSentiment[]> {
    return prisma.newsSentiment.findMany({
      where: {
        cryptoId,
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }
}
