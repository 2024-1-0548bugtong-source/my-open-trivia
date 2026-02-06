// File: scripts/setAdmin.ts
// Purpose: Assign admin role to a single user in Firebase
// Usage in Windsurf: Run this script via Node in the terminal

import admin from "firebase-admin";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// 1️⃣ Initialize Firebase Admin SDK
// Replace with your downloaded service account JSON path
initializeApp({
  credential: cert("./serviceAccountKey.json"),
});

async function assignAdmin(uid: string) {
  try {
    // 2️⃣ Set custom claim for admin - use admin:true to match our application
    await getAuth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin role assigned to UID: ${uid}`);

    console.log("\n⚠️ REMINDER: The admin user must refresh their ID token in the client once after login:");
    console.log("await user.getIdToken(true);");

    console.log("\n✅ Behavior after this:");
    console.log("Admin → can access /admin and see all metrics");
    console.log("Non-admin → redirected from /admin");
    console.log("All users → plays and metrics are recorded correctly");
  } catch (err) {
    console.error("❌ Error assigning admin role:", err);
  }
}

// 3️⃣ Replace with your admin's Firebase UID
const ADMIN_UID = "cZToUpJ7PmZfL9rzWStLZOa0M2S2";

assignAdmin(ADMIN_UID);
