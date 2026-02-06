import "server-only";
import { NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';

// Force Node.js runtime and dynamic execution
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log('[DEBUG] Starting debug endpoint...');
  
  try {
    // Get Firebase Admin instances using singleton
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();
    
    // Check Firebase Admin initialization
    console.log('[DEBUG] Firebase Admin apps:', admin.apps.length);
    
    // Check environment variables
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Missing',
    };
    
    // Test database connection
    let dbTest = 'Failed';
    try {
      const testDoc = await adminDb.collection('_debug').doc('test').get();
      dbTest = 'Success';
    } catch (dbError) {
      console.error('[DEBUG] DB test failed:', dbError);
    }
    
    // Test auth connection
    let authTest = 'Failed';
    try {
      const users = await adminAuth.listUsers(1);
      authTest = 'Success';
    } catch (authError) {
      console.error('[DEBUG] Auth test failed:', authError);
    }
    
    // Check collections
    let collectionsInfo = {};
    try {
      const usersCount = await adminDb.collection('users').count().get();
      const quizResultsCount = await adminDb.collection('quizResults').count().get();
      
      collectionsInfo = {
        users: usersCount.data().count,
        quizResults: quizResultsCount.data().count
      };
    } catch (countError) {
      console.error('[DEBUG] Collection count failed:', countError);
      collectionsInfo = { error: countError instanceof Error ? countError.message : 'Unknown error' };
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envVars,
      firebaseAdmin: {
        initialized: admin.apps.length > 0,
        authTest,
        dbTest
      },
      collections: collectionsInfo,
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('[DEBUG] Debug info:', debugInfo);
    
    return Response.json({
      success: true,
      data: debugInfo
    });
    
  } catch (error) {
    console.error('[DEBUG] Debug endpoint error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
