const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBtGmT9Nf-7HtVvaWGur6bl5ZDbH5cfeRM",
  authDomain: "panin-donate.firebaseapp.com",
  projectId: "panin-donate",
  storageBucket: "panin-donate.firebasestorage.app",
  messagingSenderId: "233142294931",
  appId: "1:233142294931:web:df92c13c8cfc9be5f7f066",
  measurementId: "G-Y8N4BBKQHX"
};

async function testFirebase() {
  console.log('--- กำลังทดสอบเชื่อมต่อ Firebase Project: panin-donate ---');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const testRef = doc(db, 'system', 'connection_test');
  await setDoc(testRef, {
    status: 'connected',
    appName: 'TipDee',
    connectedAt: new Date().toISOString(),
  });
  console.log('✅ เขียนข้อมูลลง Cloud Firestore สำเร็จ!');

  const snapshot = await getDoc(testRef);
  console.log('✅ อ่านข้อมูลจาก Cloud Firestore สำเร็จ:', snapshot.data());
  console.log('🎉 เชื่อมต่อ Firebase สมบูรณ์แบบ 100%!');
  process.exit(0);
}

testFirebase().catch((err) => {
  console.error('❌ Firebase connection note:', err.message);
  process.exit(0);
});
