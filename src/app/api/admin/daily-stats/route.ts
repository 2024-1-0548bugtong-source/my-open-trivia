import "server-only";
import { NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAdmin, createAdminSuccessResponse, createAdminErrorResponse } from '@/lib/adminAuth';

// Force Node.js runtime and dynamic execution
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin(request);

    // Get date from query params or use today
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return createAdminErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
      }
    } else {
      targetDate = new Date();
    }

    // Get stats for the specified date
    const stats = await fetchDailyStats(targetDate);
    
    return createAdminSuccessResponse({
      ...stats,
      date: targetDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('[ADMIN-DAILY-STATS] Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Missing authorization')) {
        return createAdminErrorResponse(error, 401);
      }
      if (error.message.includes('Admin access required') || error.message.includes('Invalid or expired token')) {
        return createAdminErrorResponse(error, 403);
      }
    }
    
    return createAdminErrorResponse(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin(request);

    // Get date from request body
    const { date } = await request.json();
    const targetDate = date ? new Date(date) : new Date();

    // Compute and store stats for the specified date
    const stats = await computeAndStoreDailyStats(targetDate);
    
    return createAdminSuccessResponse({
      ...stats,
      date: targetDate.toISOString().split('T')[0],
      message: `Daily stats computed for ${targetDate.toISOString().split('T')[0]}`
    });

  } catch (error) {
    console.error('[ADMIN-DAILY-STATS] Computation error:', error);
    return createAdminErrorResponse(error, 500);
  }
}

async function fetchDailyStats(date: Date) {
  try {
    const adminDb = getAdminFirestore();
    
    // Set date range for the entire day (UTC)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const dateKey = date.toISOString().split('T')[0];
    
    // Try to get pre-computed stats first
    const statsDoc = await adminDb.collection('statsDaily').doc(dateKey).get();
    
    if (statsDoc.exists) {
      console.log('[ADMIN-DAILY-STATS] Found pre-computed stats for:', dateKey);
      return statsDoc.data();
    }

    // If no pre-computed stats, compute on the fly
    console.log('[ADMIN-DAILY-STATS] Computing stats on-the-fly for:', dateKey);
    return await computeStatsForDateRange(startOfDay, endOfDay);

  } catch (error) {
    console.error('[ADMIN-DAILY-STATS] Database error:', error);
    throw error;
  }
}

async function computeAndStoreDailyStats(date: Date) {
  try {
    const adminDb = getAdminFirestore();
    
    // Set date range for the entire day (UTC)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const dateKey = date.toISOString().split('T')[0];
    
    // Compute stats
    const stats = await computeStatsForDateRange(startOfDay, endOfDay);
    
    // Store in statsDaily collection
    await adminDb.collection('statsDaily').doc(dateKey).set({
      ...stats,
      computedAt: admin.firestore.Timestamp.now(),
      date: dateKey
    });

    console.log('[ADMIN-DAILY-STATS] Computed and stored stats for:', dateKey);
    return stats;

  } catch (error) {
    console.error('[ADMIN-DAILY-STATS] Computation error:', error);
    throw error;
  }
}

async function computeStatsForDateRange(startDate: Date, endDate: Date) {
  try {
    const adminDb = getAdminFirestore();
    
    // Query quizResults for the date range
    const quizResultsQuery = adminDb
      .collection('quizResults')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(endDate));

    const querySnapshot = await quizResultsQuery.get();
    const results = querySnapshot.docs;

    let totalScore = 0;
    let totalQuestions = 0;
    let totalAccuracy = 0;
    const categoryCounts: Record<string, number> = {};
    const categoryScores: Record<string, number[]> = {};

    results.forEach((doc: any) => {
      const data = doc.data();
      totalScore += data.score || 0;
      totalQuestions += data.totalQuestions || 0;
      totalAccuracy += data.accuracy || 0;
      
      const categoryId = data.categoryId?.toString() || 'unknown';
      const categoryName = data.categoryName || data.category || 'Unknown';
      
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      
      if (!categoryScores[categoryId]) {
        categoryScores[categoryId] = [];
      }
      categoryScores[categoryId].push(data.score || 0);
    });

    const quizCount = results.length;
    const avgScore = quizCount > 0 ? Math.round((totalScore / quizCount) * 10) / 10 : 0;
    const avgAccuracy = quizCount > 0 ? Math.round((totalAccuracy / quizCount) * 10) / 10 : 0;

    // Find most played category
    let mostPlayedCategory = { categoryId: 'unknown', count: 0, name: 'Unknown' };
    for (const [categoryId, count] of Object.entries(categoryCounts)) {
      if (count > mostPlayedCategory.count) {
        mostPlayedCategory = {
          categoryId,
          count,
          name: results.find((doc: any) => doc.data().categoryId?.toString() === categoryId)?.data().categoryName || 'Unknown'
        };
      }
    }

    // Calculate category breakdown with averages
    const categoryBreakdown: Record<string, { count: number; avgScore: number; name: string }> = {};
    for (const [categoryId, scores] of Object.entries(categoryScores)) {
      const categoryAvgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
      const categoryName = results.find((doc: any) => doc.data().categoryId?.toString() === categoryId)?.data().categoryName || 'Unknown';
      
      categoryBreakdown[categoryId] = {
        count: scores.length,
        avgScore: categoryAvgScore,
        name: categoryName
      };
    }

    console.log('[ADMIN-DAILY-STATS] Computed stats for date range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      quizCount,
      avgScore,
      avgAccuracy,
      mostPlayedCategory,
      categoryCount: Object.keys(categoryBreakdown).length
    });

    return {
      quizCount,
      totalScore,
      totalQuestions,
      avgScore,
      avgAccuracy,
      mostPlayedCategory,
      categoryBreakdown,
      categoryCounts,
      updatedAt: admin.firestore.Timestamp.now()
    };

  } catch (error) {
    console.error('[ADMIN-DAILY-STATS] Stats computation error:', error);
    throw error;
  }
}
