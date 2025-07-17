import { NextRequest } from 'next/server';
import { DataFetchingService } from '@/lib/database/data-fetching';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const forceRefresh = searchParams.get('refresh') === 'true';
    // const forceRefresh = true;
    
    // console.log(`forceRefresh: ${forceRefresh}`);
    
    if (symbol) {
      const data = await DataFetchingService.getCryptocurrencyData(symbol, forceRefresh);
      if (!data) {
        return Response.json({ error: 'Cryptocurrency not found' }, { status: 404 });
      }
      return Response.json(data);
    } else {
      const data = await DataFetchingService.getAllCryptocurrencies(forceRefresh);
      return Response.json(convertBigInts(data));
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
function convertBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigInts);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertBigInts(obj[key]);
    }
    return newObj;
  }
  return obj;
}
