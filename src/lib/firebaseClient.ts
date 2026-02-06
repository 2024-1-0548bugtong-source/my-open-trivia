/**
 * Firebase Client Configuration
 * Compatible with Firebase Web SDK v12 modular imports
 * Provides centralized Firebase initialization for client-side usage
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

/**
 * Firebase Configuration
 * Uses NEXT_PUBLIC_ prefix for Next.js to expose variables to browser
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that required environment variables are present
if (!firebaseConfig.projectId) {
  throw new Error(
    "Firebase configuration incomplete. Check NEXT_PUBLIC_FIREBASE_* environment variables"
  );
}

/**
 * Initialize Firebase app only once
 * Prevents duplicate initialization errors in Next.js SSR/SSG
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Export Firebase services
 * - app: Firebase app instance
 * - db: Firestore database
 * - auth: Firebase Authentication
 * - functions: Firebase Cloud Functions
 */
export { app };
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

/**
 * Enable persistent authentication (survives page refresh)
 * Only runs on client-side to handle SSR environments gracefully
 */
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Failed to set auth persistence:", error);
  });
}

/**
 * Connect to Functions emulator in development
 * Uncomment for local development with Firebase emulators
 */
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Uncomment to use local functions emulator
  // connectFunctionsEmulator(functions, "localhost", 5001);
}
