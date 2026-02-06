import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

interface ModerateNicknameData {
  targetUid: string;
  reason: string;
}

interface ModerateNicknameResult {
  ok: boolean;
  message?: string;
  error?: string;
}

/**
 * Cloud Function: moderateNickname
 * 
 * Allows admins to moderate offensive nicknames by:
 * A) Force renaming users/{uid}.nickname to "Player####"
 * B) Setting users/{uid}.needsNicknameReset = true
 * C) Masking old leaderboard snapshots for that uid
 * D) Writing an audit log entry
 */
export const moderateNickname = functions.https.onCall(
  async (data: ModerateNicknameData, context): Promise<ModerateNicknameResult> => {
    // Security: Verify authentication
    if (!context.auth) {
      return {
        ok: false,
        error: "Authentication required"
      };
    }

    // Security: Verify admin role
    if (context.auth.token.role !== "admin") {
      return {
        ok: false,
        error: "Admin role required"
      };
    }

    // Validation: Check required fields
    const { targetUid, reason } = data;
    
    if (!targetUid || typeof targetUid !== "string" || targetUid.trim().length === 0) {
      return {
        ok: false,
        error: "Valid targetUid is required"
      };
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return {
        ok: false,
        error: "Valid reason is required"
      };
    }

    const actorUid = context.auth.uid;
    const trimmedTargetUid = targetUid.trim();
    const trimmedReason = reason.trim();

    try {
      // Generate forced nickname: Player#### (4 digits)
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const forcedNickname = `Player${randomDigits}`;

      // Get current user data for audit log
      const userDoc = await db.collection("users").doc(trimmedTargetUid).get();
      const beforeData = userDoc.exists ? userDoc.data() : null;

      // A) Update user nickname and set reset flag
      await db.collection("users").doc(trimmedTargetUid).set({
        nickname: forcedNickname,
        needsNicknameReset: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // B) Mask leaderboard entries for this user
      const leaderboardQuery = await db.collection("quizResults")
        .where("uid", "==", trimmedTargetUid)
        .get();

      const batch = db.batch();
      let maskedCount = 0;

      leaderboardQuery.docs.forEach((doc) => {
        batch.update(doc.ref, {
          nicknameSnapshot: "Moderated",
          moderated: true,
          moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
          moderatedBy: actorUid
        });
        maskedCount++;
      });

      if (maskedCount > 0) {
        await batch.commit();
      }

      // C) Write audit log entry
      const auditData = {
        actorUid,
        actionType: "MODERATE_NICKNAME",
        targetUid: trimmedTargetUid,
        reason: trimmedReason,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        before: {
          nickname: beforeData?.nickname || null,
          needsNicknameReset: beforeData?.needsNicknameReset || false
        },
        after: {
          nickname: forcedNickname,
          needsNicknameReset: true
        },
        metadata: {
          leaderboardEntriesMasked: maskedCount,
          forcedNickname
        }
      };

      await db.collection("adminAudit").add(auditData);

      // Return success result
      return {
        ok: true,
        message: `Successfully moderated user nickname. Forced rename to "${forcedNickname}". Masked ${maskedCount} leaderboard entries.`
      };

    } catch (error) {
      console.error("Error in moderateNickname function:", error);
      
      return {
        ok: false,
        error: "Internal server error during moderation"
      };
    }
  }
);

/**
 * Cloud Function: updateDailyStats
 * 
 * Firestore trigger that updates daily statistics when a new quiz result is created
 * This ensures statsDaily collection is always up-to-date without client-side PII
 */
export const updateDailyStats = functions.firestore
  .document("quizResults/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    if (!data) {
      console.log("No data in quiz result document");
      return;
    }

    // Get date in Asia/Manila timezone (UTC+8)
    const now = new Date();
    const manilaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const dateKey = manilaTime.toISOString().split('T')[0]; // YYYY-MM-DD

    const statsRef = db.collection("statsDaily").doc(dateKey);
    
    try {
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        
        let currentStats: any = {
          quizCount: 0,
          totalScore: 0,
          totalQuestions: 0,
          categoryCounts: {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (statsDoc.exists) {
          currentStats = statsDoc.data()!;
        }

        // Update counters
        currentStats.quizCount = (currentStats.quizCount || 0) + 1;
        currentStats.totalScore = (currentStats.totalScore || 0) + (data.score || 0);
        currentStats.totalQuestions = (currentStats.totalQuestions || 0) + (data.totalQuestions || 0);
        
        // Update category counts
        const categoryId = data.categoryId?.toString() || "unknown";
        currentStats.categoryCounts = currentStats.categoryCounts || {};
        currentStats.categoryCounts[categoryId] = (currentStats.categoryCounts[categoryId] || 0) + 1;
        
        currentStats.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        transaction.set(statsRef, currentStats, { merge: true });
      });

      console.log(`Updated daily stats for ${dateKey}: quizCount incremented`);
    } catch (error) {
      console.error("Error updating daily stats:", error);
    }
  });

/**
 * Cloud Function: testAdminAccess (for development/testing)
 * 
 * Simple function to test if user has admin role
 */
export const testAdminAccess = functions.https.onCall(
  async (data, context): Promise<{ ok: boolean; role?: string; uid?: string }> => {
    if (!context.auth) {
      return { ok: false };
    }

    return {
      ok: true,
      role: context.auth.token.role as string,
      uid: context.auth.uid
    };
  }
);
