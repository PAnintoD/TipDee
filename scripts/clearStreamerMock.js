const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning streamer profile mock data...');

  try {
    const updated = await prisma.streamer.updateMany({
      data: {
        avatarUrl: null,
        bannerUrl: null,
      },
    });
    console.log(`✅ Cleared avatarUrl and bannerUrl on ${updated.count} streamers in Prisma DB.`);
  } catch (err) {
    console.error('❌ Prisma error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
