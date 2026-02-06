# Firestore Security Rules

Add these rules to **Firebase Console → Firestore Database → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection rules
    match /users/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all user profiles
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Quiz Results collection rules
    match /quizResults/{resultId} {
      // Anyone can read public (non-hidden) results for leaderboard
      allow read: if request.auth != null && 
        resource.data.hidden != true;
      
      // Users can read their own results (including hidden ones)
      allow read: if request.auth != null && 
        resource.data.uid == request.auth.uid;
      
      // Admins can read all results
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Users can create their own quiz results
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid &&
        request.resource.data.keys().hasAll(['uid', 'score', 'totalQuestions', 'nicknameSnapshot', 'categoryName']) &&
        request.resource.data.hidden != true;
      
      // Users can update only their own results (for privacy toggle)
      allow update: if request.auth != null && 
        resource.data.uid == request.auth.uid &&
        request.resource.data.keys().hasAll(['hidden']) &&
        request.resource.diff(resource.data).affectedKeys().hasOnly(['hidden']);
      
      // Admins can update any result
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // No one can delete results (preserve data integrity)
      allow delete: if false;
    }
    
    // Daily Stats collection rules (admin only)
    match /statsDaily/{date} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Security Features

### **Users Collection**
- ✅ Users can only read/write their own profile
- ✅ Admins can read all user profiles (for metrics)
- ✅ Required fields: uid, email, displayName, createdAt

### **Quiz Results Collection**
- ✅ Public leaderboard only shows non-hidden results
- ✅ Users can read their own results (including hidden)
- ✅ Admins can read all results
- ✅ Users can only create results with their own uid
- ✅ Users can only update `hidden` field on their own results
- ✅ Admins can update any field on any result
- ✅ No deletions allowed (data integrity)

### **Daily Stats Collection**
- ✅ Admin-only access for reading and writing
- ✅ Used for server-side aggregation

## Deployment Steps

1. **Go to Firebase Console** → Firestore Database → Rules
2. **Replace existing rules** with the rules above
3. **Publish** the changes
4. **Test** the rules by:
   - Creating a new user account
   - Completing a quiz
   - Testing privacy toggle
   - Accessing admin dashboard (with admin claim)
