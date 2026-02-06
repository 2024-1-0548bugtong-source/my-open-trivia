# Admin Dashboard Deployment Guide

## 🚀 Overview

Minimal, secure Admin Dashboard for Open Trivia app with:
- **Read-only Leaderboard** (`/admin/leaderboard`)
- **Aggregated Daily Stats** (`/admin/stats`) 
- **Nickname Moderation** (`/admin/moderation`)

## 📁 File Structure

```
src/
├── hooks/
│   └── useAdminGuard.ts          # Admin authentication guard
├── components/
│   └── AdminNav.tsx               # Admin navigation
└── app/admin/
    ├── layout.tsx                 # Admin layout + protection
    ├── leaderboard/page.tsx       # Read-only leaderboard
    ├── stats/page.tsx             # Daily aggregated stats
    └── moderation/page.tsx        # Nickname moderation

functions/
├── src/
│   └── index.ts                   # Cloud Functions
├── package.json                   # Functions dependencies
└── tsconfig.json                  # Functions TypeScript config

firestore.rules                    # Security rules
```

## 🔐 Authentication & Authorization

### Firebase Custom Claims Setup

1. **Set Admin Custom Claim:**
```javascript
// In Firebase Console or via Admin SDK
await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

2. **Verify Admin Role:**
```javascript
// Client-side verification
const tokenResult = await user.getIdTokenResult(true);
const isAdmin = tokenResult.claims.role === "admin";
```

## 📊 Firestore Composite Indexes

### Required for Leaderboard Query

Create these indexes in Firebase Console → Firestore → Indexes:

1. **Leaderboard Query (All Categories):**
   - Collection: `quizResults`
   - Fields: `hidden` (Ascending), `score` (Descending), `accuracy` (Descending), `createdAt` (Descending)

2. **Leaderboard Query (Filtered by Category):**
   - Collection: `quizResults`
   - Fields: `hidden` (Ascending), `categoryId` (Ascending), `score` (Descending), `accuracy` (Descending), `createdAt` (Descending)

## 🔥 Cloud Functions Deployment

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Deploy Functions
```bash
firebase deploy --only functions
```

### Available Functions:
- `moderateNickname` - Nickname moderation with Admin SDK
- `updateDailyStats` - Daily stats aggregation (trigger)
- `testAdminAccess` - Admin role testing (development)

## 🛡️ Security Rules

### Key Security Features:

1. **Leaderboard Collection (`quizResults`):**
   - Public read: Only `hidden != true` entries
   - Create: Authenticated users, own entries only
   - Update: Only `hidden` field, own entries only
   - Delete: No client deletions

2. **Daily Stats (`statsDaily`):**
   - Admin read-only
   - Server writes only (via Cloud Functions)

3. **Users Collection (`users`):**
   - Self read/write only
   - No admin writes from client

4. **Admin Audit (`adminAudit`):**
   - Admin read-only
   - Server writes only

## 🚀 Deployment Steps

### 1. Update Firebase Configuration
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions

# Deploy hosting (if needed)
firebase deploy --only hosting
```

### 2. Test Admin Access
1. Set admin custom claim on a user
2. Navigate to `/admin/leaderboard`
3. Verify access and functionality

### 3. Test Moderation
1. Get a test user UID
2. Navigate to `/admin/moderation`
3. Test nickname moderation
4. Verify audit log creation

## 📱 Data Models

### Leaderboard Entry
```typescript
{
  uid: string,
  nicknameSnapshot: string,
  categoryId: string | number,
  categoryName: string,
  score: number,
  totalQuestions: number,
  accuracy: number,
  createdAt: Timestamp,
  hidden: boolean,
  moderated?: boolean,      // Added by moderation
  moderatedAt?: Timestamp,   // Added by moderation
  moderatedBy?: string       // Added by moderation
}
```

### Daily Stats
```typescript
{
  quizCount: number,
  totalScore: number,
  totalQuestions: number,
  categoryCounts: Record<string, number>,
  updatedAt: Timestamp
}
```

### User Document
```typescript
{
  nickname: string,
  needsNicknameReset: boolean,
  updatedAt: Timestamp
}
```

### Admin Audit Entry
```typescript
{
  actorUid: string,
  actionType: "MODERATE_NICKNAME",
  targetUid: string,
  reason: string,
  createdAt: Timestamp,
  before: { nickname: string, needsNicknameReset: boolean },
  after: { nickname: string, needsNicknameReset: boolean },
  metadata: { leaderboardEntriesMasked: number, forcedNickname: string }
}
```

## 🔄 Moderation Flow

### Nickname Moderation Process:
1. **Admin enters UID and reason**
2. **Cloud Function validates admin role**
3. **Generates forced nickname: `Player####`**
4. **Updates user document with new nickname + reset flag**
5. **Masks all leaderboard entries for that UID**
6. **Writes audit log entry**
7. **Returns success/failure result**

### User Experience After Moderation:
- User sees new nickname: `Player1234`
- User gets prompt to choose new nickname
- Old leaderboard entries show as "Moderated"
- All changes are auditable

## 🛠️ Development Notes

### Testing Admin Access:
```javascript
// Test function available
const testAdminAccess = httpsCallable(functions, 'testAdminAccess');
const result = await testAdminAccess();
console.log(result); // { ok: true, role: "admin", uid: "..." }
```

### Local Development:
```bash
# Start Firebase emulators
firebase emulators:start

# Deploy functions to emulator
cd functions && npm run build
```

### Error Handling:
- All admin actions require authentication
- Invalid admin claims are rejected
- Comprehensive error messages
- Audit trail for all actions

## 🔍 Monitoring & Auditing

### Admin Audit Log:
- All moderation actions are logged
- Includes before/after states
- Actor UID and timestamps
- Searchable by action type and date

### Security Monitoring:
- Failed admin access attempts
- Invalid custom claim usage
- Unusual moderation patterns

## 📋 Checklist Before Production

- [ ] Set admin custom claims on appropriate users
- [ ] Deploy updated Firestore security rules
- [ ] Deploy Cloud Functions
- [ ] Create required composite indexes
- [ ] Test admin access with non-admin user (should redirect)
- [ ] Test admin access with admin user (should work)
- [ ] Test nickname moderation flow
- [ ] Verify audit log creation
- [ ] Test daily stats aggregation
- [ ] Verify leaderboard filtering works

## 🚨 Important Security Notes

1. **Never expose admin custom claims to client-side code**
2. **Always verify admin role in Cloud Functions**
3. **Use server-side operations for sensitive data**
4. **Log all admin actions for audit trail**
5. **Never allow client-side user data modification**
6. **Keep Cloud Functions updated and secure**

## 🆘 Troubleshooting

### Common Issues:
1. **Admin access denied**: Check custom claims setup
2. **Functions not found**: Deploy functions to Firebase
3. **Index errors**: Create required composite indexes
4. **Permission denied**: Check Firestore security rules
5. **Moderation fails**: Verify admin role and function deployment

### Debug Commands:
```bash
# Check functions logs
firebase functions:log

# Check Firestore rules
firebase deploy --only firestore:rules --dry-run

# Test custom claims
firebase auth:get-custom-tokens USER_UID
```
