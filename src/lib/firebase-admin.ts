import admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with environment variables
    const serviceAccountKey = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccountKey.projectId || !serviceAccountKey.clientEmail || !serviceAccountKey.privateKey) {
      throw new Error('Missing Firebase Admin configuration. Check environment variables.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
      projectId: serviceAccountKey.projectId,
    });

    console.log('[FIREBASE-ADMIN] Initialized successfully for project:', serviceAccountKey.projectId);
  } catch (error) {
    console.error('[FIREBASE-ADMIN] Initialization failed:', error);
    throw error;
  }
}

export default admin;
