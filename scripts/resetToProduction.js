const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetToProduction() {
  console.log('--- เตรียมระบบเข้าสู่โหมดใช้งานจริง (Production Reset) ---');

  // Delete all test donations
  const deleted = await prisma.donation.deleteMany({});
  console.log(`ลบรายการโดเนททดสอบทั้งหมด: ${deleted.count} รายการ`);

  // Reset Goal current amount to 0
  await prisma.goalSettings.updateMany({
    data: {
      currentAmount: 0,
    }
  });
  console.log('รีเซ็ตยอดเป้าหมายสะสมเริ่มต้นที่ 0 บาท');

  console.log('--- ฐานข้อมูลสะอาด 100% พร้อมรับเงินจริงแล้ว ---');
}

resetToProduction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
