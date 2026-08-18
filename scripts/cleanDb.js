const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete corrupted entries containing ?????
  const deleted = await prisma.donation.deleteMany({
    where: {
      OR: [
        { donorName: { contains: '?' } },
        { message: { contains: '??' } }
      ]
    }
  });
  console.log('Deleted corrupted donations:', deleted.count);

  // Add realistic Thai test donations if needed
  const count = await prisma.donation.count();
  if (count <= 3) {
    await prisma.donation.create({
      data: {
        id: `don_slip_${Date.now()}`,
        streamerId: 'streamerza',
        donorName: 'คุณสิรภพ สายเปย์ 🎮',
        amount: 250,
        message: 'สแกนสลิปออโต้โอนเงินแล้วครับ สตรีมสนุกมาก!',
        paymentMethod: 'slip',
        status: 'completed',
        enableTTS: true,
        isTest: false,
        slipRef: '0046000600000101030140225123456789',
        slipHash: 'hash_sample_slip_success',
        verifiedAt: new Date(),
        createdAt: new Date(),
      }
    });
    console.log('Added clean verified slip donation');
  }

  const all = await prisma.donation.findMany();
  console.log('Total clean donations in DB:', all.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
