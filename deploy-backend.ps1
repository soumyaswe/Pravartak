# =============================================================================
# Backend Deployment Script for Pravartak Flask Server
# =============================================================================
# This script builds and deploys the Python Flask SocketIO backend to Cloud Run
# Run: powershell -ExecutionPolicy Bypass -File deploy-backend.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "pravartak-15665"
$SERVICE_NAME = "pravartak-backend"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host ">>> Deploying Pravartak Backend to Cloud Run" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Step 1: Navigate to backend directory
Write-Host "`n>> Step 1: Navigating to backend directory..." -ForegroundColor Yellow
$originalPath = Get-Location
Set-Location -Path "$PSScriptRoot\backend"

# Step 2: Build image using Cloud Build (no local Docker required)
Write-Host "`n>> Step 2: Building Docker image with Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag ${IMAGE_NAME}:latest --project=$PROJECT_ID .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Cloud Build failed!" -ForegroundColor Red
    Set-Location $originalPath
    exit 1
}

Write-Host "[OK] Image built and pushed successfully" -ForegroundColor Green

# Step 3: Deploy to Cloud Run
Write-Host "`n>> Step 3: Deploying to Cloud Run..." -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME `
    --image=${IMAGE_NAME}:latest `
    --platform=managed `
    --region=$REGION `
    --project=$PROJECT_ID `
    --allow-unauthenticated `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --port=8080 `
    --timeout=600 `
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
    --update-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Cloud Run deployment failed!" -ForegroundColor Red
    Set-Location $originalPath
    exit 1
}

Write-Host "[OK] Backend deployed successfully!" -ForegroundColor Green

# Step 4: Get the service URL
Write-Host "`n>> Step 4: Getting service URL..." -ForegroundColor Yellow
$SERVICE_URL = gcloud run services describe $SERVICE_NAME `
    --platform=managed `
    --region=$REGION `
    --project=$PROJECT_ID `
    --format="value(status.url)"

Set-Location $originalPath

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "*** DEPLOYMENT COMPLETE! ***" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "`n>> Backend URL: " -NoNewline -ForegroundColor Cyan
Write-Host $SERVICE_URL -ForegroundColor White
Write-Host "`n>> Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create the NEXT_PUBLIC_BACKEND_URL secret:" -ForegroundColor White
Write-Host "   echo `'$SERVICE_URL`' | gcloud secrets create NEXT_PUBLIC_BACKEND_URL --data-file=- --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "`n2. Or update existing secret:" -ForegroundColor White
Write-Host "   echo `'$SERVICE_URL`' | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --data-file=- --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "`n3. Grant Firebase App Hosting access:" -ForegroundColor White
Write-Host "   `$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format=`"value(projectNumber)`"" -ForegroundColor Gray
Write-Host "   gcloud secrets add-iam-policy-binding NEXT_PUBLIC_BACKEND_URL --member=`"serviceAccount:service-`${PROJECT_NUMBER}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com`" --role=`"roles/secretmanager.secretAccessor`" --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "`n4. Add to apphosting.yaml:" -ForegroundColor White
Write-Host "   - variable: NEXT_PUBLIC_BACKEND_URL" -ForegroundColor Gray
Write-Host "     secret: NEXT_PUBLIC_BACKEND_URL" -ForegroundColor Gray
Write-Host "`n5. Deploy frontend:" -ForegroundColor White
Write-Host "   firebase deploy" -ForegroundColor Gray

# Test health endpoint
Write-Host "`n>> Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$SERVICE_URL/health" -Method GET
    Write-Host "[OK] Health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Active Sessions: $($health.active_sessions)" -ForegroundColor White
} catch {
    Write-Host "[!] Could not reach health endpoint (service may still be starting)" -ForegroundColor Yellow
}

Write-Host "`n*** Backend deployment complete! ***" -ForegroundColor Cyan