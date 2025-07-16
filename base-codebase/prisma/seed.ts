import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create initial cryptocurrencies
  const cryptocurrencies = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      blockchain: 'bitcoin',
      blockchairId: 'bitcoin',
      coingeckoId: 'bitcoin',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      blockchain: 'ethereum',
      blockchairId: 'ethereum',
      coingeckoId: 'ethereum',
    },
    {
      symbol: 'BCH',
      name: 'Bitcoin Cash',
      blockchain: 'bitcoin-cash',
      blockchairId: 'bitcoin-cash',
      coingeckoId: 'bitcoin-cash',
    },
    {
      symbol: 'LTC',
      name: 'Litecoin',
      blockchain: 'litecoin',
      blockchairId: 'litecoin',
      coingeckoId: 'litecoin',
    },
  ];

  for (const crypto of cryptocurrencies) {
    const existing = await prisma.cryptocurrency.findFirst({
      where: { symbol: crypto.symbol },
    });

    if (!existing) {
      await prisma.cryptocurrency.create({
        data: crypto,
      });
      console.log(`✅ Created ${crypto.name} (${crypto.symbol})`);
    } else {
      console.log(`⚠️  ${crypto.name} (${crypto.symbol}) already exists`);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
