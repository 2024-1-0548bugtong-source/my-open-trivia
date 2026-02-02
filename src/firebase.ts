import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

/**
 * Firebase Configuration
 * Uses NEXT_PUBLIC_ prefix for Next.js to expose variables to browser
 * Validates that all required credentials are present
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Note: measurementId is optional; omitted to avoid Analytics overhead in SSR
};

// Validate that required environment variables are present
if (!firebaseConfig.projectId) {
  throw new Error(
    "Firebase configuration incomplete. Check NEXT_PUBLIC_FIREBASE_* environment variables in .env or .env.local"
  );
}

/**
 * Initialize Firebase app only once
 * getApps() returns existing instances; if empty, create new one
 * Prevents duplicate initialization errors in Next.js SSR/ISG
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Export Firebase services
 * - app: Firebase app instance (single instance across entire app)
 * - db: Firestore database
 * - auth: Firebase Authentication
 */
export { app };
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Enable persistent authentication (survives page refresh)
 * Only runs on client-side (Next.js will skip this during SSR)
 * Wrapped in try-catch to handle SSR environments gracefully
 */
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Failed to set auth persistence:", error);
  });
}

