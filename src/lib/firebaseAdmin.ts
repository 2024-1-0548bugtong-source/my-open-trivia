import "server-only";
import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK Configuration
 * Supports both service account JSON and individual environment variables
 * Ensures single initialization with proper error handling
 */

let adminApp: admin.app.App | null = null;

/**
 * Get or initialize Firebase Admin app (singleton pattern)
 * Always returns a valid admin app or throws clear error
 */
export function getAdminApp(): admin.app.App {
  // Return existing app if already initialized
  if (adminApp) {
    return adminApp;
  }

  // Check for existing Firebase apps
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0] as admin.app.App;
    console.log('[FIREBASE-ADMIN] Using existing app for project:', adminApp.options.projectId);
    return adminApp;
  }

  // Pattern A: Service account JSON (recommended for Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log('[FIREBASE-ADMIN] Initialized with service account JSON for project:', serviceAccount.project_id);
      return adminApp;
    } catch (parseError) {
      console.error('[FIREBASE-ADMIN] Failed to parse service account JSON:', parseError);
      // Fall back to individual env vars
    }
  }

  // Pattern B: Individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const error = new Error(
      'Missing Firebase Admin configuration. Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON) OR FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY'
    );
    console.error('[FIREBASE-ADMIN] Missing environment variables:', {
      projectId: projectId ? 'Set' : 'Missing',
      clientEmail: clientEmail ? 'Set' : 'Missing',
      privateKey: privateKey ? 'Set' : 'Missing',
      serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing'
    });
    throw error;
  }

  // Normalize private key for environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
    privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
  }
  if (!privateKey.includes('\n-----END PRIVATE KEY-----')) {
    privateKey = privateKey.replace('\n-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });

    console.log('[FIREBASE-ADMIN] Initialized with individual env vars for project:', projectId);
    return adminApp;
  } catch (error) {
    console.error('[FIREBASE-ADMIN] Initialization failed:', error);
    throw new Error(`Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Firebase Admin Auth instance
 * Always uses initialized admin app
 */
export function getAdminAuth() {
  const app = getAdminApp();
  console.log('[FIREBASE-ADMIN] Admin app projectId:', app.options.projectId);
  return admin.auth(app);
}

/**
 * Get Firebase Admin Firestore instance
 * Always uses initialized admin app
 */
export function getAdminFirestore() {
  const app = getAdminApp();
  return admin.firestore(app);
}
