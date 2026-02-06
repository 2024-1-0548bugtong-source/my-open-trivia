# 🔧 **TROUBLESHOOTING GUIDE**

## **Current Issue: "Failed to fetch metrics"**

The error indicates the admin dashboard cannot connect to the metrics API. Let's debug this step by step.

---

## **🚀 IMMEDIATE DEBUGGING STEPS**

### **Step 1: Check Console Logs**
1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Visit `/admin` page**
4. **Look for these log messages:**
   ```
   [ADMIN-DASHBOARD] Starting metrics fetch, isRefresh: false
   [ADMIN-DASHBOARD] Getting ID token...
   [ADMIN-DASHBOARD] Token obtained: Yes/No
   [ADMIN-DASHBOARD] Fetching from /api/admin/metrics...
   [ADMIN-DASHBOARD] Response status: 401/403/500
   ```

### **Step 2: Test Debug Endpoint**
Visit this URL in your browser:
```
http://localhost:3000/api/admin/debug
```

This will show:
- ✅ Environment variables status
- ✅ Firebase Admin initialization
- ✅ Database connection test
- ✅ Collection counts

### **Step 3: Check Environment Variables**

#### **For Development (.env.local)**
Create/Update `.env.local` in your project root:
```bash
# Get these from Firebase Console → Project Settings → Service Accounts
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### **For Production (Vercel)**
1. Go to **Vercel → Settings → Environment Variables**
2. Add the same three variables
3. Redeploy

---

## **🔍 COMMON ISSUES & SOLUTIONS**

### **Issue 1: Missing Admin Custom Claim**
**Symptoms:**
- Console shows: `[ADMIN-AUTH] User is not admin. Role: undefined`
- Response status: 403

**Solution:**
1. **Firebase Console → Authentication → Users**
2. **Find your user** → Click menu (⋮)
3. **"Add custom claim"**
   - Claim: `role`
   - Value: `admin`
4. **Log out and log back in** to refresh token

### **Issue 2: Missing Environment Variables**
**Symptoms:**
- Debug endpoint shows: `FIREBASE_PROJECT_ID: Missing`
- Firebase Admin initialization fails

**Solution:**
1. **Download service account key** from Firebase Console
2. **Extract values** from the JSON file
3. **Add to .env.local** (development) or Vercel (production)

### **Issue 3: Invalid Private Key Format**
**Symptoms:**
- `[FIREBASE-ADMIN] Initialization failed`
- Private key format errors

**Solution:**
```bash
# WRONG (single line):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----abc123-----END PRIVATE KEY-----"

# RIGHT (with \n for newlines):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nabc123\n-----END PRIVATE KEY-----\n"
```

### **Issue 4: No Users in Firestore**
**Symptoms:**
- Admin dashboard shows 0 users
- Debug endpoint shows `users: 0`

**Solution:**
1. **Create a new user** via signup
2. **Check console** for `[USER-PROFILE] Upserted profile`
3. **Verify** `/users/{uid}` document exists in Firestore

---

## **🧪 TESTING CHECKLIST**

### **Basic Connectivity**
- [ ] Debug endpoint works: `/api/admin/debug`
- [ ] Environment variables are set
- [ ] Firebase Admin initializes successfully

### **Authentication**
- [ ] User is logged in
- [ ] User has `role: "admin"` custom claim
- [ ] ID token is generated successfully

### **API Endpoints**
- [ ] `/api/admin/metrics` returns data
- [ ] `/api/admin/daily-stats` works
- [ ] Admin dashboard shows real metrics

---

## **📊 EXPECTED DEBUG OUTPUT**

### **Healthy System:**
```json
{
  "success": true,
  "data": {
    "environment": {
      "FIREBASE_PROJECT_ID": "Set",
      "FIREBASE_CLIENT_EMAIL": "Set", 
      "FIREBASE_PRIVATE_KEY": "Set"
    },
    "firebaseAdmin": {
      "initialized": true,
      "authTest": "Success",
      "dbTest": "Success"
    },
    "collections": {
      "users": 2,
      "quizResults": 15
    }
  }
}
```

### **Common Problems:**
```json
{
  "environment": {
    "FIREBASE_PRIVATE_KEY": "Missing"  // ❌ Fix this
  },
  "firebaseAdmin": {
    "initialized": false,             // ❌ Fix environment vars
    "authTest": "Failed"               // ❌ Fix credentials
  }
}
```

---

## **🚀 QUICK FIXES**

### **If Nothing Works:**
1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Clear browser cache:**
   - Open dev tools
   - Right-click refresh → "Empty Cache and Hard Reload"

3. **Re-authenticate:**
   - Log out
   - Log back in
   - Refresh admin page

---

## **📞 NEXT STEPS**

1. **Run the debug endpoint** and share the output
2. **Check console logs** when visiting `/admin`
3. **Verify admin custom claim** is set
4. **Confirm environment variables** are correct

**Once you run the debug endpoint, I can help you fix the specific issue!** 🎯
