import { prisma } from './prisma';
import { adminDb } from './firebaseAdmin';
import { isFirebaseConfigured } from './firebase';

export interface StreamerProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  promptpayTarget: string;
  promptpayName: string;
  truemoneyPhone: string;
  minAmount: number;
  presetAmounts: number[];
  socialLinks: {
    youtube?: string;
    twitch?: string;
    facebook?: string;
    discord?: string;
    tiktok?: string;
  };
  widgetToken: string;
  enableAutoSlip: boolean;
  slipApiKey?: string;
  slipBranchId?: string;
  alertSettings: {
    template: string;
    minAmountForAlert: number;
    minAmountForTTS: number;
    duration: number;
    soundUrl: string;
    soundVolume: number;
    imageUrl: string;
    ttsEnabled: boolean;
    ttsVoice: string;
    ttsSpeed: number;
    ttsPitch: number;
    ttsVolume: number;
    textColor: string;
    highlightColor: string;
    fontFamily: string;
  };
  goalSettings: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    endDate?: string;
    barColor: string;
    backgroundColor: string;
    textColor: string;
    showPercentage: boolean;
  };
  topDonorsSettings: {
    period: 'all_time' | 'month' | 'week' | 'day';
    limit: number;
    title: string;
  };
}

export interface Donation {
  id: string;
  streamerId: string;
  donorName: string;
  amount: number;
  message: string;
  paymentMethod: 'promptpay' | 'truemoney' | 'slip' | 'test';
  paymentRef?: string;
  status: 'completed' | 'pending' | 'failed';
  enableTTS: boolean;
  isTest?: boolean;
  slipImage?: string;
  slipRef?: string;
  slipHash?: string;
  verifiedAt?: string;
  createdAt: string;
}

const DEFAULT_STREAMER: StreamerProfile = {
  id: 'streamerza',
  username: 'streamerza',
  displayName: 'StreamerZa TH 🎮',
  bio: 'ยินดีต้อนรับสู่ช่องสตรีมเกม สนับสนุนเพื่อเป็นกำลังใจและพัฒนาช่องได้ที่นี่เลยครับ! ขอบคุณทุกการโดเนทครับ ❤️',
  avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  promptpayTarget: '0812345678',
  promptpayName: 'สตรีมเมอร์ ซ่า',
  truemoneyPhone: '0812345678',
  minAmount: 5,
  presetAmounts: [20, 50, 100, 300, 500, 1000],
  socialLinks: {
    youtube: 'https://youtube.com',
    twitch: 'https://twitch.tv',
    facebook: 'https://facebook.com',
    discord: 'https://discord.gg',
    tiktok: 'https://tiktok.com',
  },
  widgetToken: 'widget_token_abc123',
  enableAutoSlip: true,
  alertSettings: {
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
    fontFamily: 'Prompt, sans-serif',
  },
  goalSettings: {
    title: '🎯 เป้าหมาย: อัปเกรดการ์ดจอ RTX 4070',
    targetAmount: 20000,
    currentAmount: 0,
    endDate: '2026-12-31',
    barColor: '#22c55e',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    textColor: '#ffffff',
    showPercentage: true,
  },
  topDonorsSettings: {
    period: 'month',
    limit: 5,
    title: '🏆 ผู้สนับสนุนสูงสุดประจำเดือน',
  },
};

export async function getStreamer(id: string = 'streamerza'): Promise<StreamerProfile> {
  // If Firebase Firestore configured
  if (isFirebaseConfigured && adminDb) {
    try {
      const doc = await adminDb.collection('streamers').doc(id).get();
      if (doc.exists) {
        return { ...DEFAULT_STREAMER, ...(doc.data() as any) };
      }
    } catch (e) {
      console.warn('Firebase read error, falling back to local DB', e);
    }
  }

  // Local Prisma DB
  try {
    let streamer = await prisma.streamer.findUnique({
      where: { id },
      include: { widgetSettings: true, goalSettings: true },
    });

    if (!streamer) {
      try {
        streamer = await prisma.streamer.create({
        data: {
          userId: 'system',
          username: id,
          displayName: DEFAULT_STREAMER.displayName,
          bio: DEFAULT_STREAMER.bio,
          avatarUrl: DEFAULT_STREAMER.avatarUrl,
          bannerUrl: DEFAULT_STREAMER.bannerUrl,
          promptpayTarget: DEFAULT_STREAMER.promptpayTarget,
          promptpayName: DEFAULT_STREAMER.promptpayName,
          truemoneyPhone: DEFAULT_STREAMER.truemoneyPhone,
          minAmount: DEFAULT_STREAMER.minAmount,
          presetAmounts: JSON.stringify(DEFAULT_STREAMER.presetAmounts),
          socialLinks: JSON.stringify(DEFAULT_STREAMER.socialLinks),
          enableAutoSlip: true,
          widgetSettings: {
            create: {
              template: DEFAULT_STREAMER.alertSettings.template,
              minAmountForAlert: DEFAULT_STREAMER.alertSettings.minAmountForAlert,
              minAmountForTTS: DEFAULT_STREAMER.alertSettings.minAmountForTTS,
              duration: DEFAULT_STREAMER.alertSettings.duration,
              soundUrl: DEFAULT_STREAMER.alertSettings.soundUrl,
              soundVolume: DEFAULT_STREAMER.alertSettings.soundVolume,
              imageUrl: DEFAULT_STREAMER.alertSettings.imageUrl,
              ttsEnabled: DEFAULT_STREAMER.alertSettings.ttsEnabled,
              ttsVoice: DEFAULT_STREAMER.alertSettings.ttsVoice,
              ttsSpeed: DEFAULT_STREAMER.alertSettings.ttsSpeed,
              ttsPitch: DEFAULT_STREAMER.alertSettings.ttsPitch,
              ttsVolume: DEFAULT_STREAMER.alertSettings.ttsVolume,
              textColor: DEFAULT_STREAMER.alertSettings.textColor,
              highlightColor: DEFAULT_STREAMER.alertSettings.highlightColor,
            },
          },
          goalSettings: {
            create: {
              title: DEFAULT_STREAMER.goalSettings.title,
              targetAmount: DEFAULT_STREAMER.goalSettings.targetAmount,
              currentAmount: DEFAULT_STREAMER.goalSettings.currentAmount,
              endDate: DEFAULT_STREAMER.goalSettings.endDate,
              barColor: DEFAULT_STREAMER.goalSettings.barColor,
              backgroundColor: DEFAULT_STREAMER.goalSettings.backgroundColor,
              textColor: DEFAULT_STREAMER.goalSettings.textColor,
              showPercentage: DEFAULT_STREAMER.goalSettings.showPercentage,
            },
          },
        },
        include: { widgetSettings: true, goalSettings: true },
      });
      } catch (e: any) {
        // If unique constraint violated (race condition), just fetch the existing record
        if (e.code === 'P2002') {
          streamer = await prisma.streamer.findFirst({
            where: { username: id },
            include: { widgetSettings: true, goalSettings: true },
          });
        } else {
          throw e;
        }
      }
    }

    let presetAmounts = DEFAULT_STREAMER.presetAmounts;
    try {
      if (streamer?.presetAmounts) presetAmounts = JSON.parse(streamer.presetAmounts);
    } catch (e) {}

    let socialLinks = DEFAULT_STREAMER.socialLinks;
    try {
      if (streamer?.socialLinks) socialLinks = JSON.parse(streamer.socialLinks);
    } catch (e) {}

    // If streamer is still null after all attempts, return safe defaults
    if (!streamer) {
      return { ...DEFAULT_STREAMER, id };
    }

    return {
      id: streamer.id,
      username: streamer.username,
      displayName: streamer.displayName,
      bio: streamer.bio || '',
      avatarUrl: streamer.avatarUrl || DEFAULT_STREAMER.avatarUrl,
      bannerUrl: streamer.bannerUrl || DEFAULT_STREAMER.bannerUrl,
      promptpayTarget: streamer.promptpayTarget || '0812345678',
      promptpayName: streamer.promptpayName || 'สตรีมเมอร์',
      truemoneyPhone: streamer.truemoneyPhone || '',
      minAmount: streamer.minAmount,
      presetAmounts,
      socialLinks,
      widgetToken: streamer.widgetToken,
      enableAutoSlip: streamer.enableAutoSlip,
      slipApiKey: streamer.slipApiKey || '',
      slipBranchId: streamer.slipBranchId || '',
      alertSettings: streamer.widgetSettings
        ? {
            template: streamer.widgetSettings.template,
            minAmountForAlert: streamer.widgetSettings.minAmountForAlert,
            minAmountForTTS: streamer.widgetSettings.minAmountForTTS,
            duration: streamer.widgetSettings.duration,
            soundUrl: streamer.widgetSettings.soundUrl,
            soundVolume: streamer.widgetSettings.soundVolume,
            imageUrl: streamer.widgetSettings.imageUrl,
            ttsEnabled: streamer.widgetSettings.ttsEnabled,
            ttsVoice: streamer.widgetSettings.ttsVoice,
            ttsSpeed: streamer.widgetSettings.ttsSpeed,
            ttsPitch: streamer.widgetSettings.ttsPitch,
            ttsVolume: streamer.widgetSettings.ttsVolume,
            textColor: streamer.widgetSettings.textColor,
            highlightColor: streamer.widgetSettings.highlightColor,
            fontFamily: 'Prompt, sans-serif',
          }
        : DEFAULT_STREAMER.alertSettings,
      goalSettings: streamer.goalSettings
        ? {
            title: streamer.goalSettings.title,
            targetAmount: streamer.goalSettings.targetAmount,
            currentAmount: streamer.goalSettings.currentAmount,
            endDate: streamer.goalSettings.endDate || undefined,
            barColor: streamer.goalSettings.barColor,
            backgroundColor: streamer.goalSettings.backgroundColor,
            textColor: streamer.goalSettings.textColor,
            showPercentage: streamer.goalSettings.showPercentage,
          }
        : DEFAULT_STREAMER.goalSettings,
      topDonorsSettings: DEFAULT_STREAMER.topDonorsSettings,
    };
  } catch (error) {
    console.error('Error fetching streamer from Prisma', error);
    return DEFAULT_STREAMER;
  }
}

export async function updateStreamer(id: string, updates: Partial<StreamerProfile>): Promise<StreamerProfile> {
  // If Firebase Firestore
  if (isFirebaseConfigured && adminDb) {
    try {
      await adminDb.collection('streamers').doc(id).set(updates, { merge: true });
      return getStreamer(id);
    } catch (e) {
      console.warn('Firebase write error', e);
    }
  }

  // Local Prisma DB
  try {
    const dataToUpdate: any = {};
    if (updates.displayName !== undefined) dataToUpdate.displayName = updates.displayName;
    if (updates.bio !== undefined) dataToUpdate.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dataToUpdate.avatarUrl = updates.avatarUrl;
    if (updates.bannerUrl !== undefined) dataToUpdate.bannerUrl = updates.bannerUrl;
    if (updates.promptpayTarget !== undefined) dataToUpdate.promptpayTarget = updates.promptpayTarget;
    if (updates.promptpayName !== undefined) dataToUpdate.promptpayName = updates.promptpayName;
    if (updates.truemoneyPhone !== undefined) dataToUpdate.truemoneyPhone = updates.truemoneyPhone;
    if (updates.minAmount !== undefined) dataToUpdate.minAmount = updates.minAmount;
    if (updates.presetAmounts !== undefined) dataToUpdate.presetAmounts = JSON.stringify(updates.presetAmounts);
    if (updates.socialLinks !== undefined) dataToUpdate.socialLinks = JSON.stringify(updates.socialLinks);
    if (updates.enableAutoSlip !== undefined) dataToUpdate.enableAutoSlip = updates.enableAutoSlip;
    if (updates.slipApiKey !== undefined) dataToUpdate.slipApiKey = updates.slipApiKey;
    if (updates.slipBranchId !== undefined) dataToUpdate.slipBranchId = updates.slipBranchId;

    if (updates.alertSettings) {
      await prisma.widgetSettings.upsert({
        where: { streamerId: id },
        create: { streamerId: id, ...updates.alertSettings },
        update: updates.alertSettings,
      });
    }

    if (updates.goalSettings) {
      await prisma.goalSettings.upsert({
        where: { streamerId: id },
        create: { streamerId: id, ...updates.goalSettings },
        update: updates.goalSettings,
      });
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.streamer.update({
        where: { id },
        data: dataToUpdate,
      });
    }

    return getStreamer(id);
  } catch (err) {
    console.error('Error updating streamer in Prisma', err);
    return getStreamer(id);
  }
}

export async function getDonations(streamerId: string = 'streamerza'): Promise<Donation[]> {
  // If Firebase Firestore
  if (isFirebaseConfigured && adminDb) {
    try {
      const snapshot = await adminDb
        .collection('donations')
        .where('streamerId', '==', streamerId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Donation[];
    } catch (e) {
      console.warn('Firebase getDonations error', e);
    }
  }

  // Local Prisma DB
  try {
    const list = await prisma.donation.findMany({
      where: { streamerId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((d) => ({
      id: d.id,
      streamerId: d.streamerId,
      donorName: d.donorName,
      amount: d.amount,
      message: d.message || '',
      paymentMethod: d.paymentMethod as any,
      paymentRef: d.paymentRef || undefined,
      status: d.status as any,
      enableTTS: d.enableTTS,
      isTest: d.isTest,
      slipImage: d.slipImage || undefined,
      slipRef: d.slipRef || undefined,
      slipHash: d.slipHash || undefined,
      verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : undefined,
      createdAt: d.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching donations from Prisma', error);
    return [];
  }
}

export async function addDonation(donation: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> {
  const newId = `don_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const now = new Date().toISOString();

  // If Firebase Firestore
  if (isFirebaseConfigured && adminDb) {
    try {
      const docData: any = {
        ...donation,
        id: newId,
        createdAt: now,
      };
      await adminDb.collection('donations').doc(newId).set(docData);
      return docData;
    } catch (e) {
      console.warn('Firebase addDonation error', e);
    }
  }

  // Local Prisma DB
  const created = await prisma.donation.create({
    data: {
      id: newId,
      streamerId: donation.streamerId,
      donorName: donation.donorName,
      amount: donation.amount,
      message: donation.message || '',
      paymentMethod: donation.paymentMethod,
      paymentRef: donation.paymentRef,
      status: donation.status,
      enableTTS: donation.enableTTS,
      isTest: donation.isTest || false,
      slipImage: donation.slipImage,
      slipRef: donation.slipRef,
      slipHash: donation.slipHash,
      verifiedAt: donation.status === 'completed' ? new Date() : undefined,
    },
  });

  // If completed, update goal current amount
  if (donation.status === 'completed') {
    try {
      await prisma.goalSettings.updateMany({
        where: { streamerId: donation.streamerId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });
    } catch (e) {}
  }

  return {
    id: created.id,
    streamerId: created.streamerId,
    donorName: created.donorName,
    amount: created.amount,
    message: created.message || '',
    paymentMethod: created.paymentMethod as any,
    paymentRef: created.paymentRef || undefined,
    status: created.status as any,
    enableTTS: created.enableTTS,
    isTest: created.isTest,
    slipImage: created.slipImage || undefined,
    slipRef: created.slipRef || undefined,
    slipHash: created.slipHash || undefined,
    verifiedAt: created.verifiedAt ? created.verifiedAt.toISOString() : undefined,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function getDonationStats(streamerId: string = 'streamerza') {
  const donations = await getDonations(streamerId);
  const completed = donations.filter((d) => d.status === 'completed');
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  let allTimeTotal = 0;

  completed.forEach((d) => {
    const t = new Date(d.createdAt).getTime();
    allTimeTotal += d.amount;
    if (t >= startOfMonth) monthTotal += d.amount;
    if (t >= startOfWeek) weekTotal += d.amount;
    if (t >= startOfDay) todayTotal += d.amount;
  });

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    allTimeTotal,
    totalDonationsCount: completed.length,
    recentDonations: completed.slice(0, 10),
  };
}

export async function getTopDonors(streamerId: string = 'streamerza', limit = 5, period: 'all_time' | 'month' | 'week' | 'day' = 'month') {
  const donations = await getDonations(streamerId);
  const completed = donations.filter((d) => d.status === 'completed');
  const now = new Date();

  let cutoffTime = 0;
  if (period === 'day') {
    cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  } else if (period === 'week') {
    const temp = new Date(now);
    cutoffTime = new Date(temp.setDate(temp.getDate() - temp.getDay())).getTime();
  } else if (period === 'month') {
    cutoffTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  const filtered = completed.filter((d) => new Date(d.createdAt).getTime() >= cutoffTime);
  const aggregates: Record<string, { name: string; totalAmount: number; count: number; lastDate: string }> = {};

  filtered.forEach((d) => {
    const key = d.donorName.trim() || 'ผู้ไม่ประสงค์ออกนาม';
    if (!aggregates[key]) {
      aggregates[key] = { name: key, totalAmount: 0, count: 0, lastDate: d.createdAt };
    }
    aggregates[key].totalAmount += d.amount;
    aggregates[key].count += 1;
  });

  return Object.values(aggregates)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}
