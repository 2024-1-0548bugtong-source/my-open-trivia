import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const ADMIN_UID = 'cZToUpJ7PmZfL9rzWStLZOa0M2S2';
const SERVICE_ACCOUNT_PATH = join(__dirname, 'serviceAccountKey.json');

async function setupAdmin() {
  console.log('🔧 Firebase Admin Setup - Setting Custom Claims');
  console.log('===============================================\n');

  try {
    // Check if service account key exists
    try {
      readFileSync(SERVICE_ACCOUNT_PATH);
    } catch (error) {
      console.error('❌ ERROR: serviceAccountKey.json not found!');
      console.error('\n📋 SOLUTION:');
      console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.error('2. Click "Generate new private key"');
      console.error('3. Save the downloaded file as: admin-setup/serviceAccountKey.json');
      console.error('4. Run this script again\n');
      process.exit(1);
    }

    // Initialize Firebase Admin SDK
    console.log('📡 Initializing Firebase Admin SDK...');
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized successfully\n');

    // Validate UID
    if (!ADMIN_UID || ADMIN_UID.length < 20) {
      console.error('❌ ERROR: Invalid UID provided!');
      console.error(`UID: ${ADMIN_UID}`);
      console.error('Please check that the UID is correct\n');
      process.exit(1);
    }

    // Set custom claims
    console.log(`👤 Setting admin claims for user: ${ADMIN_UID}`);
    console.log('⏳ This may take a few seconds...\n');

    await admin.auth().setCustomUserClaims(ADMIN_UID, {
      role: 'admin'
    });

    console.log('✅ Custom claims set successfully!\n');

    // Verify the claims were set
    console.log('🔍 Verifying custom claims...');
    const userRecord = await admin.auth().getUser(ADMIN_UID);
    
    console.log('📋 User Information:');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email || 'No email'}`);
    console.log(`   Display Name: ${userRecord.displayName || 'No display name'}`);
    console.log(`   Custom Claims: ${JSON.stringify(userRecord.customClaims, null, 2)}`);

    // Check if admin role is set
    if (userRecord.customClaims && userRecord.customClaims.role === 'admin') {
      console.log('\n🎉 SUCCESS! Admin role has been granted!');
      console.log('\n📱 NEXT STEPS:');
      console.log('1. Log out of your web application');
      console.log('2. Log back in (claims refresh on sign-in)');
      console.log('3. Visit /admin to access the admin dashboard');
      console.log('\n🔒 SECURITY REMINDER:');
      console.log('- Delete serviceAccountKey.json after use');
      console.log('- Never commit serviceAccountKey.json to version control');
      console.log('- Consider deleting this entire admin-setup folder');
    } else {
      console.log('\n⚠️  WARNING: Admin role may not have been set correctly');
      console.log('Please check the custom claims above and try again');
    }

  } catch (error) {
    console.error('\n❌ ERROR occurred during setup:');
    
    if (error.code === 'auth/user-not-found') {
      console.error('User not found. Please check the UID is correct.');
    } else if (error.code === 'auth/insufficient-permission') {
      console.error('Insufficient permission. Check your service account has Firebase Admin privileges.');
    } else if (error.code === 'auth/invalid-credential') {
      console.error('Invalid service account credentials. Please check serviceAccountKey.json is valid.');
    } else {
      console.error('Error details:', error.message);
    }
    
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('1. Ensure serviceAccountKey.json is valid and not corrupted');
    console.error('2. Check that your Firebase project ID matches the service account');
    console.error('3. Verify the service account has "Firebase Admin" role in IAM');
    console.error('4. Make sure you have internet connection');
    
    process.exit(1);
  } finally {
    // Clean up admin app
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
  }
}

// Run the setup
setupAdmin().catch(console.error);
