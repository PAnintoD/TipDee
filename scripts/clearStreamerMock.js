require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let adminDb = null;
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    adminDb = getFirestore();
  } catch (err) {
    console.error('Firebase Admin init error', err);
  }
}

async function main() {
  console.log('🔄 Cleaning streamer profile mock data...');

  // 1. Reset Prisma local DB
  try {
    await prisma.streamer.update({
      where: { id: 'streamerza' },
      data: {
        displayName: 'Streamer Name',
        bio: '',
        avatarUrl: '',
        bannerUrl: '',
        promptpayTarget: '',
        promptpayName: '',
        truemoneyPhone: '',
        socialLinks: '{}',
        goalSettings: {
          update: {
            title: 'เป้าหมายการโดเนท',
            targetAmount: 1000,
            currentAmount: 0
          }
        }
      }
    });
    console.log('✅ Prisma DB streamer profile reset to empty values.');
  } catch (err) {
    console.log('⚠️ Prisma DB streamer profile update failed:', err.message);
  }

  // 2. Clear Firebase Firestore streamer profile (if it exists)
  if (adminDb) {
    try {
      await adminDb.collection('streamers').doc('streamerza').delete();
      console.log('✅ Firebase Firestore streamer profile deleted (will fallback to Prisma clean data).');
    } catch (err) {
      console.log('⚠️ Firebase Firestore delete failed:', err.message);
    }
  }

  console.log('🎉 Profile Mock Data successfully cleaned!');
}

main().catch(console.error);
