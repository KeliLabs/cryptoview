import { NextRequest } from 'next/server';
import { DataFetchingService } from '@/lib/database/data-fetching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (symbol) {
      const data = await DataFetchingService.getCryptocurrencyData(symbol, forceRefresh);
      if (!data) {
        return Response.json({ error: 'Cryptocurrency not found' }, { status: 404 });
      }
      return Response.json(data);
    } else {
      const data = await DataFetchingService.getAllCryptocurrencies(forceRefresh);
      return Response.json(data);
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
