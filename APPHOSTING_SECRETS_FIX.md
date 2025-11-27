# Firebase App Hosting Secrets Configuration - Complete Fix

## ✅ Completed Steps

### 1. Secrets Configured in `apphosting.yaml` ✅
All required secrets are properly configured:
- ✅ `DATABASE_URL` - Available at BUILD and RUNTIME
- ✅ `GEMINI_API_KEY` - Available at BUILD and RUNTIME
- ✅ `NEXT_PUBLIC_BACKEND_URL` - Available at BUILD and RUNTIME
- ✅ `GOOGLE_APPLICATION_CREDENTIALS` - Available at RUNTIME

### 2. Firebase App Hosting Secret Access Granted ✅
Used Firebase CLI to grant backend access:
```bash
firebase apphosting:secrets:grantaccess <SECRET> --backend=pravartak --location=asia-southeast1
```

**Granted access to:**
- ✅ `DATABASE_URL`
- ✅ `GEMINI_API_KEY`
- ✅ `NEXT_PUBLIC_BACKEND_URL`
- ✅ `GOOGLE_APPLICATION_CREDENTIALS`

### 3. Debug Route Enabled ✅
Updated `/api/debug-env` to be accessible in production for testing.

## Next Steps

### 1. Deploy the Changes
```bash
git add .
git commit -m "Fix: Configure App Hosting secrets access"
git push origin main  # or your default branch
```

This will trigger a new Firebase App Hosting deployment.

### 2. Verify Secrets are Available

After deployment, visit:
```
https://pravartak--pravartak-15665.asia-southeast1.hosted.app/api/debug-env
```

**Expected response:**
```json
{
  "hasDatabaseUrl": true,
  "databaseUrlPrefix": "postgresql://user...",
  "databaseUrlLength": 123,
  "hasGeminiApiKey": true,
  "hasBackendUrl": true,
  "backendUrl": "https://pravartak-backend-w5mkanjiva-uc.a.run.app",
  "hasGoogleCloudProjectId": true,
  "googleCloudProjectId": "pravartak-15665",
  "nodeEnv": "production"
}
```

### 3. Check Cloud Run Logs

If `hasDatabaseUrl: false`, check the logs:

**Firebase Console:**
1. Go to Firebase Console → App Hosting
2. Select your backend (`pravartak`)
3. Click on "Logs" tab
4. Look for errors related to:
   - `DATABASE_URL is not set`
   - `Environment variable not found: DATABASE_URL`

**Common Issues:**

#### Issue: `DATABASE_URL is not set`
**Solution:** 
- Verify secret exists: `gcloud secrets describe DATABASE_URL --project=pravartak-15665`
- Verify `apphosting.yaml` has the secret configured
- Redeploy after fixing

#### Issue: Database connection refused
**Solution:**
- If using Cloud SQL with private IP → Add VPC connector to `apphosting.yaml`:
  ```yaml
  runConfig:
    vpcAccess:
      egress: PRIVATE_RANGES_ONLY
      connector: your-vpc-connector-id
  ```
- If using public database → Verify firewall allows GCP IPs

#### Issue: Permission denied for database
**Solution:**
- Verify database user/password in `DATABASE_URL` secret
- Verify database user has proper permissions

### 4. Test Your Features

After verifying secrets:

1. **CV Analyser**: Should open without redirecting to sign-in
2. **Practice Questions**: Should load assessments
3. **Interview Simulator**: Should connect to hosted backend
4. **Dashboard**: Should load stats

### 5. Disable Debug Route (After Testing)

Once everything works, update `app/api/debug-env/route.js` to restrict access:

```javascript
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug route disabled in production" },
      { status: 403 }
    );
  }
  // ... rest of code
}
```

## Summary

✅ Secrets configured in `apphosting.yaml`  
✅ Firebase App Hosting backend granted secret access  
✅ Debug route enabled for testing  
✅ Error handling improved to prevent redirects on DB errors  

**Ready to deploy!** Push your code and verify with `/api/debug-env` endpoint.


