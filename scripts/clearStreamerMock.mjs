import fs from 'fs';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PrismaClient } from '@prisma/client';

const env = fs.readFileSync('.env.local', 'utf8');
const envMap = {};
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) envMap[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const prisma = new PrismaClient();
let adminDb = null;
if (envMap.FIREBASE_PROJECT_ID) {
  try {
    const serviceAccount = {
      projectId: envMap.FIREBASE_PROJECT_ID,
      clientEmail: envMap.FIREBASE_CLIENT_EMAIL,
      privateKey: envMap.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    adminDb = getFirestore();
  } catch (err) {}
}

async function main() {
  await prisma.streamer.update({
    where: { id: 'streamerza' },
    data: {
      displayName: 'ช่องของฉัน',
      bio: '',
      avatarUrl: '',
      bannerUrl: '',
      promptpayTarget: '',
      promptpayName: '',
      truemoneyPhone: '',
      socialLinks: '{}',
      goalSettings: { update: { title: 'เป้าหมายการโดเนท', targetAmount: 0, currentAmount: 0 } }
    }
  });
  console.log('✅ Prisma Updated');

  if (adminDb) {
    await adminDb.collection('streamers').doc('streamerza').delete().catch(() => {});
    console.log('✅ Firebase Updated');
  }
}
main().catch(console.error);
