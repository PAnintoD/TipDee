import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

try {
  const apps = getApps();
  if (apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'panin-donate';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else if (projectId) {
      adminApp = initializeApp({ projectId });
    }
  } else {
    adminApp = apps[0];
  }

  if (adminApp) {
    adminDb = getFirestore(adminApp);
  }
} catch (e) {
  // Graceful fallback to client Firestore or Prisma
}

export { adminDb, adminApp };
