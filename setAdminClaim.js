import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔥 Replace this with the UID of the user you want to promote to admin
const uid = "cZToUpJ7PmZfL9rzWStLZOa0M2S2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim added to user: ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting admin claim:", err);
    process.exit(1);
  });