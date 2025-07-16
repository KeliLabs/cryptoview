import { NextRequest } from 'next/server';
import { DataFetchingService } from '@/lib/database/data-fetching';
import { Blockchain } from '@/lib/api/blockchair';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blockchain = searchParams.get('blockchain');

    if (blockchain) {
      // Refresh specific blockchain
      await DataFetchingService.storeHistoricalData(blockchain as Blockchain, true);
      return Response.json({ message: `Data refreshed for ${blockchain}` });
    } else {
      // Refresh all data
      await DataFetchingService.refreshAllData();
      return Response.json({ message: 'All data refreshed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to refresh data' }, { status: 500 });
  }
}
