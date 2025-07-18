// Blockchair API client for blockchain investment dashboard
// Supports Bitcoin, Ethereum, Bitcoin Cash, Litecoin

import axios from 'axios';

export type Blockchain = 'bitcoin' | 'ethereum' | 'bitcoin-cash' | 'litecoin';

export interface BlockchairStats {
  data: {
      blocks: number;
      transactions: number;
      outputs?: number;
      volume_usd?: number;
      mempool_transactions?: number;
      mempool_size?: number;
      market_price_usd?: number;
      market_price_btc?: number;
      market_cap_usd?: number;
      hash_rate?: number;
      inflation_usd?: number;
      average_transaction_fee_usd?: number;
      hashrate_24h?: number;
      volume_24h?: number;
  };
}

export interface BlockchairAddress {
  data: {
    [address: string]: {
      address: {
        type: string;
        balance: number;
        received: number;
        sent: number;
        transaction_count: number;
        // ...other address fields
      };
      transactions: Array<{
        hash: string;
        time: string;
        value: number;
        // ...other transaction fields
      }>;
      // ...other address-related fields
    };
  };
}

const BASE_URL = 'https://api.blockchair.com';
const API_KEY = process.env.BLOCKCHAIR_API_KEY;

function getAuthParams() {
  return API_KEY ? { key: API_KEY } : {};
}

export async function getGeneralStats(blockchain: Blockchain) {
  const url = `${BASE_URL}/${blockchain}/stats`;
  const params = getAuthParams();
  const response = await axios.get<BlockchairStats>(url, { params });
  return response.data;
}

export async function getDashboardStats(blockchain: Blockchain) {
  const url = `${BASE_URL}/${blockchain}/stats`;
  const params = getAuthParams();
  const response = await axios.get<BlockchairStats>(url, { params });
  return response.data;
}

export async function getAddressData(blockchain: Blockchain, address: string) {
  const url = `${BASE_URL}/${blockchain}/dashboards/address/${address}`;
  const params = getAuthParams();
  const response = await axios.get<BlockchairAddress>(url, { params });
  return response.data;
}

// Add more endpoints as needed
