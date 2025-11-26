# Backend Deployment Guide

## How Changes Reflect in Backend Hosting

The backend is deployed to **Google Cloud Run** using Docker. Here's how your changes will be reflected:

### Current Deployment Setup

1. **Backend Service**: `pravartak-backend` on Cloud Run (us-central1)
2. **Build Process**: Uses Cloud Build to create Docker image
3. **Deployment**: Automatically updates the Cloud Run service

### Steps to Deploy Your Changes

#### Option 1: Use the Deployment Script (Recommended)

From the project root, run:

```powershell
.\deploy-backend.ps1
```

Or use the alternative script:

```powershell
.\scripts\deploy-backend-cloudrun.ps1
```

#### Option 2: Manual Deployment

1. **Build the Docker image:**
   ```powershell
   cd backend
   gcloud builds submit --tag gcr.io/pravartak-15665/pravartak-backend --project=pravartak-15665
   ```

2. **Deploy to Cloud Run:**
   ```powershell
   gcloud run deploy pravartak-backend `
     --image gcr.io/pravartak-15665/pravartak-backend:latest `
     --platform managed `
     --region us-central1 `
     --project pravartak-15665 `
     --allow-unauthenticated `
     --memory 2Gi `
     --cpu 2 `
     --timeout 600 `
     --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
     --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=pravartak-15665,GCP_PROJECT_ID=pravartak-15665,PRODUCTION=1,GOOGLE_CLOUD_REGION=us-central1" `
     --service-account="pravartak-backend@pravartak-15665.iam.gserviceaccount.com"
   ```

### Important: Service Account Configuration

**For TTS/STT to work, Cloud Run needs a service account with proper permissions:**

1. **Create or use a service account:**
   ```powershell
   gcloud iam service-accounts create pravartak-backend `
     --display-name="Pravartak Backend Service Account" `
     --project=pravartak-15665
   ```

2. **Grant necessary permissions:**
   ```powershell
   # Text-to-Speech API access
   gcloud projects add-iam-policy-binding pravartak-15665 `
     --member="serviceAccount:pravartak-backend@pravartak-15665.iam.gserviceaccount.com" `
     --role="roles/cloudtts.serviceAgent" `
     --project=pravartak-15665

   # Speech-to-Text API access
   gcloud projects add-iam-policy-binding pravartak-15665 `
     --member="serviceAccount:pravartak-backend@pravartak-15665.iam.gserviceaccount.com" `
     --role="roles/speech.serviceAgent" `
     --project=pravartak-15665

   # Vertex AI access
   gcloud projects add-iam-policy-binding pravartak-15665 `
     --member="serviceAccount:pravartak-backend@pravartak-15665.iam.gserviceaccount.com" `
     --role="roles/aiplatform.user" `
     --project=pravartak-15665
   ```

3. **Update Cloud Run service to use the service account:**
   ```powershell
   gcloud run services update pravartak-backend `
     --service-account="pravartak-backend@pravartak-15665.iam.gserviceaccount.com" `
     --region us-central1 `
     --project pravartak-15665
   ```

### What Happens During Deployment

1. **Build Phase** (5-10 minutes):
   - Cloud Build creates a new Docker image with your code changes
   - Image includes all Python dependencies from `requirements.txt`
   - New image is tagged and pushed to Google Container Registry

2. **Deploy Phase** (2-5 minutes):
   - Cloud Run creates a new revision with the new image
   - Environment variables and secrets are attached
   - Service account permissions are applied
   - Health checks verify the service is running

3. **Rollout**:
   - Traffic is gradually shifted to the new revision
   - Old revision is kept for rollback if needed

### Verifying Deployment

After deployment, check:

1. **Health Endpoint:**
   ```powershell
   $BACKEND_URL = "https://pravartak-backend-w5mkanjiva-uc.a.run.app"
   Invoke-RestMethod -Uri "$BACKEND_URL/health"
   ```

   Expected response should show:
   ```json
   {
     "status": "healthy",
     "tts_initialized": true,
     "stt_initialized": true,
     "gemini_initialized": true
   }
   ```

2. **Check Logs:**
   ```powershell
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pravartak-backend" `
     --limit 50 `
     --project=pravartak-15665 `
     --format=json
   ```

   Look for the startup summary showing:
   - ✅ Text-to-Speech: Initialized
   - ✅ Speech-to-Text: Initialized
   - ✅ Gemini Model: Initialized

### Troubleshooting

If the interviewer is not speaking after deployment:

1. **Check service account permissions:**
   ```powershell
   gcloud projects get-iam-policy pravartak-15665 `
     --flatten="bindings[].members" `
     --filter="bindings.members:serviceAccount:pravartak-backend@pravartak-15665.iam.gserviceaccount.com" `
     --project=pravartak-15665
   ```

2. **Check Cloud Run logs for TTS initialization errors:**
   ```powershell
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pravartak-backend AND textPayload=~'TTS'" `
     --limit 20 `
     --project=pravartak-15665
   ```

3. **Verify service account is attached:**
   ```powershell
   gcloud run services describe pravartak-backend `
     --region us-central1 `
     --project=pravartak-15665 `
     --format="value(spec.template.spec.serviceAccountName)"
   ```

### Key Improvements in This Deployment

With the new error handling, you'll now see:

- **Clear startup messages** showing which services initialized successfully
- **Detailed error logs** if TTS/STT fails to initialize
- **Health check endpoint** that reports service status
- **Better error messages** to help diagnose issues

### Environment Variables Needed

The backend needs these environment variables/secrets in Cloud Run:

- ✅ `GEMINI_API_KEY` (Secret)
- ✅ `GOOGLE_CLOUD_PROJECT_ID` = `pravartak-15665`
- ✅ `GOOGLE_CLOUD_REGION` = `us-central1`
- ✅ `PRODUCTION` = `1`

**Note:** `GOOGLE_APPLICATION_CREDENTIALS` is NOT needed as a file path in Cloud Run. Instead, Cloud Run uses the service account attached to the service (configured via `--service-account` flag).

### Next Steps After Deployment

1. **Test the health endpoint** to verify all services initialized
2. **Check Cloud Run logs** for the startup summary
3. **Test the interview simulator** to verify TTS is working
4. **Monitor logs** for any error messages

The changes will be live immediately after deployment completes (~5-15 minutes total).

