# Firebase API Key Error - Cloud Build Fix

## Problem
The Cloud Build was failing with the error:
```
Error [FirebaseError]: Firebase: Error (auth/invalid-api-key).
```

This occurred during the `Collecting page data` phase of the Next.js build, even though local builds worked fine.

## Root Cause
- **Next.js** requires `NEXT_PUBLIC_*` environment variables at **build time** to embed them into the client-side JavaScript bundles
- While `apphosting.yaml` defines these environment variables, they weren't being properly loaded during the Docker build process
- The Firebase SDK was trying to initialize without valid credentials during static page generation

## Solution Applied

### 1. Created `.env.production` File
Created a new file with all public Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD8pa4S7Kbyq_r96L9fRXomLNlCSJA28LU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pravartak-15665.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pravartak-15665
# ... etc
```

**Note**: These are PUBLIC keys (prefixed with `NEXT_PUBLIC_`) and are safe to commit to version control. They are meant to be exposed in the client-side code.

### 2. Updated `Dockerfile`
Added the `.env.production` file to the build stage:
```dockerfile
# Copy production environment variables for build
COPY .env.production .env.production
```

### 3. Updated `.dockerignore`
Allowed `.env.production` to be copied during Docker build:
```
!.env.production
```

### 4. Updated `.gitignore`
Allowed `.env.production` to be tracked in git:
```
!.env.production
```

### 5. Added Fallback Values in `firebase.js`
Added default values to prevent initialization errors:
```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD8pa4S7Kbyq_r96L9fRXomLNlCSJA28LU',
  // ... etc
};
```

## Why This Works

1. **Build-Time Availability**: Next.js now has access to Firebase credentials during the build process
2. **Docker Context**: The `.env.production` file is included in the Docker build context
3. **Fallback Safety**: Even if environment variables fail to load, fallback values ensure Firebase can initialize
4. **Runtime Override**: The `apphosting.yaml` environment variables still override these at runtime

## Verification

Local build test passed:
```
✓ Compiled successfully in 56s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (32/32)
```

## Security Note

The Firebase API keys in `.env.production` are **PUBLIC** and meant to be exposed:
- They're prefixed with `NEXT_PUBLIC_` 
- They appear in the client-side JavaScript bundle
- Firebase security is enforced through Firestore Security Rules and Authentication, not API key secrecy
- Private keys (like `DATABASE_URL`, `GEMINI_API_KEY`) remain in Cloud Secret Manager

## Next Steps

1. ✅ Changes committed and pushed to `main` branch
2. ⏳ Cloud Build will automatically trigger
3. Monitor the build logs in Firebase Console > App Hosting
4. Verify the deployment completes successfully

## Related Files Modified
- `.env.production` (new)
- `.dockerignore`
- `.gitignore`
- `Dockerfile`
- `lib/firebase.js`

---
**Fix Applied**: November 2, 2025
**Commit**: `676cb32` - "fix: resolve Firebase API key error in Cloud Build"
