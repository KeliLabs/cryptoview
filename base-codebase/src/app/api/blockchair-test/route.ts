import { NextRequest } from 'next/server';
import { getGeneralStats, getAddressData, Blockchain } from '@/lib/api/blockchair';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blockchain = searchParams.get('blockchain') as Blockchain || 'bitcoin';
    const address = searchParams.get('address');
    let result;

    if (address) {
      result = await getAddressData(blockchain, address);
    } else {
      result = {
        general: await getGeneralStats(blockchain),
      };
    }

    return Response.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
