import "server-only";
import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    success: true,
    data: envVars,
    message: 'Environment check complete'
  });
}
