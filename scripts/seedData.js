const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial realistic data for TipDee Streamer platform...');

  // 1. Create or Update Default Streamer (streamerza)
  const streamer = await prisma.streamer.upsert({
    where: { id: 'streamerza' },
    update: {
      displayName: 'StreamerZa TH 🎮',
      bio: 'ยินดีต้อนรับสู่ช่องสตรีมเกม! สนับสนุนเพื่อเป็นกำลังใจและอัปเกรดคอมพิวเตอร์สตรีมได้ที่นี่ครับ ขอบคุณทุกการโดเนทมากๆ ครับ ❤️',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      promptpayTarget: '0812345678',
      promptpayName: 'นายสตรีมเมอร์ ซ่า',
      truemoneyPhone: '0812345678',
      minAmount: 5,
      presetAmounts: JSON.stringify([20, 50, 100, 300, 500, 1000]),
      socialLinks: JSON.stringify({
        youtube: 'https://youtube.com',
        twitch: 'https://twitch.tv',
        facebook: 'https://facebook.com',
        discord: 'https://discord.gg',
      }),
      enableAutoSlip: true,
    },
    create: {
      id: 'streamerza',
      username: 'streamerza',
      displayName: 'StreamerZa TH 🎮',
      bio: 'ยินดีต้อนรับสู่ช่องสตรีมเกม! สนับสนุนเพื่อเป็นกำลังใจและอัปเกรดคอมพิวเตอร์สตรีมได้ที่นี่ครับ ขอบคุณทุกการโดเนทมากๆ ครับ ❤️',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      promptpayTarget: '0812345678',
      promptpayName: 'นายสตรีมเมอร์ ซ่า',
      truemoneyPhone: '0812345678',
      minAmount: 5,
      presetAmounts: JSON.stringify([20, 50, 100, 300, 500, 1000]),
      socialLinks: JSON.stringify({
        youtube: 'https://youtube.com',
        twitch: 'https://twitch.tv',
        facebook: 'https://facebook.com',
        discord: 'https://discord.gg',
      }),
      enableAutoSlip: true,
    },
  });

  // 2. Goal Settings
  await prisma.goalSettings.upsert({
    where: { streamerId: 'streamerza' },
    update: {
      title: '🎯 เป้าหมาย: อัปเกรดการ์ดจอ RTX 4070',
      targetAmount: 20000,
      currentAmount: 12450,
      barColor: '#22c55e',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      textColor: '#ffffff',
      showPercentage: true,
    },
    create: {
      streamerId: 'streamerza',
      title: '🎯 เป้าหมาย: อัปเกรดการ์ดจอ RTX 4070',
      targetAmount: 20000,
      currentAmount: 12450,
      barColor: '#22c55e',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      textColor: '#ffffff',
      showPercentage: true,
    },
  });

  // 3. Widget Settings
  await prisma.widgetSettings.upsert({
    where: { streamerId: 'streamerza' },
    update: {
      template: '{name} โดเนท {amount} บาท: {message}',
      minAmountForAlert: 5,
      minAmountForTTS: 10,
      duration: 7,
      soundUrl: 'levelup',
      soundVolume: 80,
      imageUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z1anE4d2dmaHk4NXVycG43dnEycW10M2d4YWR0NmsyMzB5enFqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif',
      ttsEnabled: true,
      ttsVoice: 'th-TH',
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 90,
      textColor: '#ffffff',
      highlightColor: '#22c55e',
    },
    create: {
      streamerId: 'streamerza',
      template: '{name} โดเนท {amount} บาท: {message}',
      minAmountForAlert: 5,
      minAmountForTTS: 10,
      duration: 7,
      soundUrl: 'levelup',
      soundVolume: 80,
      imageUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z1anE4d2dmaHk4NXVycG43dnEycW10M2d4YWR0NmsyMzB5enFqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif',
      ttsEnabled: true,
      ttsVoice: 'th-TH',
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 90,
      textColor: '#ffffff',
      highlightColor: '#22c55e',
    },
  });

  // 4. Sample Realistic Donations
  const now = Date.now();
  const sampleDonations = [
    {
      id: `don_${now - 1000}_1`,
      streamerId: 'streamerza',
      donorName: 'คุณสิรภพ สายเปย์ 🎮',
      amount: 500,
      message: 'สแกนสลิปออโต้โอนเงินแล้วครับ สตรีมเล่นเกมสนุกมาก ขอเพลงสากลชิลๆ ครับ!',
      paymentMethod: 'slip',
      status: 'completed',
      enableTTS: true,
      isTest: false,
      slipRef: '0046000600000101030140225123456789',
      slipHash: 'hash_sample_slip_1',
      createdAt: new Date(now - 1000 * 60 * 15), // 15 mins ago
    },
    {
      id: `don_${now - 2000}_2`,
      streamerId: 'streamerza',
      donorName: 'น้องมิว FC 💖',
      amount: 300,
      message: 'สนับสนุนค่าน้ำชาให้พี่สตรีมเมอร์ สู้ๆ นะคะ สตรีมต่อไปเรื่อยๆ เลย!',
      paymentMethod: 'promptpay',
      status: 'completed',
      enableTTS: true,
      isTest: false,
      createdAt: new Date(now - 1000 * 60 * 45), // 45 mins ago
    },
    {
      id: `don_${now - 3000}_3`,
      streamerId: 'streamerza',
      donorName: 'พี่บอล แฟนคลับ #1',
      amount: 1000,
      message: 'ช่วยสมทบทุนซื้อการ์ดจอใหม่ RTX 4070 ภาพสวยลื่นๆ ครับพี่!',
      paymentMethod: 'slip',
      status: 'completed',
      enableTTS: true,
      isTest: false,
      slipRef: '0046000600000101030140225987654321',
      slipHash: 'hash_sample_slip_2',
      createdAt: new Date(now - 1000 * 60 * 120), // 2 hours ago
    },
    {
      id: `don_${now - 4000}_4`,
      streamerId: 'streamerza',
      donorName: 'หมอเจมส์ สายฮา',
      amount: 150,
      message: 'ดูสตรีมย้อนหลังแล้วขำมาก โดเนททรูมันนี่ส่งกำลังใจครับ',
      paymentMethod: 'truemoney',
      status: 'completed',
      enableTTS: true,
      isTest: false,
      createdAt: new Date(now - 1000 * 60 * 300), // 5 hours ago
    },
    {
      id: `don_${now - 5000}_5`,
      streamerId: 'streamerza',
      donorName: 'ผู้ไม่ประสงค์ออกนาม',
      amount: 50,
      message: 'แวะมาสแกนจ่ายกำลังใจครับผม',
      paymentMethod: 'promptpay',
      status: 'completed',
      enableTTS: true,
      isTest: false,
      createdAt: new Date(now - 1000 * 60 * 600), // 10 hours ago
    },
  ];

  for (const d of sampleDonations) {
    await prisma.donation.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }

  console.log('✅ Realistic seed data inserted successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
