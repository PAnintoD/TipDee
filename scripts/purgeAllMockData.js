const { PrismaClient } = require('@prisma/client');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, setDoc } = require('firebase/firestore');

const prisma = new PrismaClient();

const firebaseConfig = {
  apiKey: "AIzaSyBtGmT9Nf-7HtVvaWGur6bl5ZDbH5cfeRM",
  authDomain: "panin-donate.firebaseapp.com",
  projectId: "panin-donate",
  storageBucket: "panin-donate.firebasestorage.app",
  messagingSenderId: "233142294931",
  appId: "1:233142294931:web:df92c13c8cfc9be5f7f066",
  measurementId: "G-Y8N4BBKQHX"
};

async function purgeAll() {
  console.log('====================================================');
  console.log('   กำลังลบข้อมูลจำลองทั้งหมด (Purge All Mock Data)   ');
  console.log('====================================================');

  // 1. ล้างข้อมูลใน Local Prisma SQLite DB
  try {
    const deletedDonations = await prisma.donation.deleteMany({});
    console.log(`✅ [Prisma DB] ลบรายการโดเนททั้งหมด: ${deletedDonations.count} รายการ`);

    await prisma.goalSettings.updateMany({
      data: {
        currentAmount: 0,
      },
    });
    console.log('✅ [Prisma DB] รีเซ็ตยอดเป้าหมายสะสม (Goal) เป็น 0 บาท');
  } catch (err) {
    console.error('❌ Prisma purge error:', err.message);
  }

  // 2. ล้างข้อมูลใน Firebase Cloud Firestore (panin-donate)
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const donationsCol = collection(db, 'donations');
    const snapshot = await getDocs(donationsCol);
    
    let fbDeletedCount = 0;
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      fbDeletedCount++;
    }
    console.log(`✅ [Firebase Firestore] ลบข้อมูลในคอลเลกชัน donations: ${fbDeletedCount} รายการ`);

    // รีเซ็ตข้อมูล Goal บน Firestore
    try {
      const streamerDoc = doc(db, 'streamers', 'streamerza');
      await setDoc(streamerDoc, {
        goalSettings: {
          currentAmount: 0,
        }
      }, { merge: true });
      console.log('✅ [Firebase Firestore] รีเซ็ตยอดเป้าหมายสะสม (Goal) เป็น 0 บาท');
    } catch (e) {
      console.warn('Firebase goal update note:', e.message);
    }
  } catch (err) {
    console.error('❌ Firebase purge error:', err.message);
  }

  console.log('====================================================');
  console.log('🎉 ข้อมูลจำลองถูกลบออกหมดเกลี้ยงแล้ว 100%!');
  console.log('   ยอดเงินเริ่มต้น: 0 ฿ | จำนวนรายการ: 0 รายการ');
  console.log('====================================================');
}

purgeAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
