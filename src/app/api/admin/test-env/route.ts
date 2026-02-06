import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
  };

  // Also check if the values look reasonable
  const details = process.env.NODE_ENV === 'development' ? {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
  } : undefined;

  return NextResponse.json({
    success: true,
    data: envVars,
    details,
    message: 'Environment check complete'
  });
}
