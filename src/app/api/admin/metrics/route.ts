import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';

// Force Node.js runtime and dynamic execution
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log('[ADMIN-METRICS] Request received');
  
  try {
    // Initialize Firebase Admin first
    const adminAuth = getAdminAuth();
    console.log('[ADMIN-METRICS] Firebase Admin initialized successfully');
    
    // Validate Authorization header safely
    const authHeader = request.headers.get('authorization');
    console.log('[ADMIN-METRICS] Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('[ADMIN-METRICS] Missing authorization header');
      return NextResponse.json({
        success: false,
        error: 'Missing authorization header'
      }, { status: 401 });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('[ADMIN-METRICS] Invalid authorization header format');
      return NextResponse.json({
        success: false,
        error: 'Invalid authorization header format'
      }, { status: 401 });
    }

    // Extract token safely
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token || token.length < 10) {
      console.log('[ADMIN-METRICS] Invalid token length');
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    console.log('[ADMIN-METRICS] Token extracted, length:', token.length);

    // Verify Firebase ID token
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('[ADMIN-METRICS] Token verified for UID:', decodedToken.uid);
      console.log('[ADMIN-METRICS] Token aud:', decodedToken.aud);
      console.log('[ADMIN-METRICS] Token iss:', decodedToken.iss);
    } catch (tokenError) {
      console.error('[ADMIN-METRICS] Token verification failed:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    // Check admin claim - use admin:true consistently
    if (decodedToken.admin !== true) {
      console.log('[ADMIN-METRICS] User not admin, admin claim:', decodedToken.admin);
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    console.log('[ADMIN-METRICS] Admin access confirmed for UID:', decodedToken.uid);

    // Fetch REAL metrics from Firebase with fallback
    let metrics;
    try {
      metrics = await fetchRealMetrics();
      console.log('[ADMIN-METRICS] Real metrics fetched successfully');
    } catch (metricsError) {
      console.error('[ADMIN-METRICS] Failed to fetch real metrics, using fallback:', metricsError);
      // Fallback metrics to prevent 500 errors
      metrics = {
        totalUsers: 0,
        totalGames: 0,
        avgScore: 0,
        avgAccuracy: 0,
        todayGames: 0,
        recentActivity: [],
        warning: 'Unable to fetch real metrics - using fallback values'
      };
    }
    
    console.log('[ADMIN-METRICS] Returning metrics:', metrics);
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ADMIN-METRICS] Unexpected error:', error);
    
    // Always return JSON, never let errors bubble up
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}

// Helper function to fetch real metrics
async function fetchRealMetrics() {
  console.log('[ADMIN-METRICS] Starting fetchRealMetrics...');
  
  // Initialize all metrics with defaults
  let totalUsers = 0;
  let totalGames = 0;
  let avgScore = 0;
  let avgAccuracy = 0;
  let todayGames = 0;
  let recentActivity: any[] = [];
  let metricsError: string | null = null;

  try {
    const db = getAdminFirestore();
    console.log('[ADMIN-METRICS] Firestore instance obtained');
    
    // Get total users count
    try {
      console.log('[ADMIN-METRICS] Fetching users count...');
      const usersSnapshot = await db.collection('users').count().get();
      totalUsers = usersSnapshot.data().count || 0;
      console.log('[ADMIN-METRICS] Users count fetched:', totalUsers);
    } catch (usersError) {
      console.error('[ADMIN-METRICS] Failed to fetch users:', usersError);
      metricsError = 'Failed to fetch users';
    }

    // Get total games count
    try {
      console.log('[ADMIN-METRICS] Fetching games count...');
      const gamesSnapshot = await db.collection('quizResults').count().get();
      totalGames = gamesSnapshot.data().count || 0;
      console.log('[ADMIN-METRICS] Games count fetched:', totalGames);
    } catch (gamesError) {
      console.error('[ADMIN-METRICS] Failed to fetch games:', gamesError);
      metricsError = metricsError ? 'Multiple fetch failures' : 'Failed to fetch games';
    }

    // Get today's games
    try {
      console.log('[ADMIN-METRICS] Fetching today games...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayGamesSnapshot = await db.collection('quizResults')
        .where('createdAt', '>=', today)
        .count()
        .get();
      todayGames = todayGamesSnapshot.data().count || 0;
      console.log('[ADMIN-METRICS] Today games fetched:', todayGames);
    } catch (todayGamesError) {
      console.error('[ADMIN-METRICS] Failed to fetch today games:', todayGamesError);
      metricsError = metricsError ? 'Multiple fetch failures' : 'Failed to fetch today games';
    }

    // Calculate averages
    try {
      console.log('[ADMIN-METRICS] Calculating averages...');
      const allGamesSnapshot = await db.collection('quizResults')
        .limit(1000)
        .get();
      
      let totalScore = 0;
      let totalAccuracy = 0;
      let gameCount = 0;

      allGamesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.score && data.accuracy) {
          totalScore += data.score;
          totalAccuracy += data.accuracy;
          gameCount++;
        }
      });

      avgScore = gameCount > 0 ? Math.round(totalScore / gameCount) : 0;
      avgAccuracy = gameCount > 0 ? parseFloat((totalAccuracy / gameCount).toFixed(1)) : 0;
      console.log('[ADMIN-METRICS] Averages calculated:', { avgScore, avgAccuracy, gameCount });
    } catch (averagesError) {
      console.error('[ADMIN-METRICS] Failed to calculate averages:', averagesError);
      metricsError = metricsError ? 'Multiple fetch failures' : 'Failed to calculate averages';
    }

    console.log('[ADMIN-METRICS] Metrics calculated:', {
      totalUsers,
      totalGames,
      avgScore,
      avgAccuracy,
      todayGames,
      hasError: !!metricsError
    });

  } catch (error) {
    console.error('[ADMIN-METRICS] Critical error in fetchRealMetrics:', error);
    metricsError = error instanceof Error ? error.message : 'Unknown error';
  }

  return {
    totalUsers,
    totalGames,
    avgScore,
    avgAccuracy,
    todayGames,
    recentActivity,
    warning: metricsError // Include warning field for UI
  };
}
