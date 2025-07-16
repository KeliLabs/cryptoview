import { NextRequest } from 'next/server';
import { DataFetchingService } from '@/lib/database/data-fetching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const timeRange = searchParams.get('range') || '24h';

    if (!symbol) {
      return Response.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const data = await DataFetchingService.getHistoricalData(symbol, timeRange);
    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
