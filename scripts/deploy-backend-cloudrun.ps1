$PROJECT_ID = "pravartak-15665"
$REGION = "us-central1"
$SERVICE_NAME = "pravartak-backend"

Write-Host "=== Deploy Backend to Cloud Run ===" -ForegroundColor Cyan
Write-Host ""

# Verify we're in the project root
if (-not (Test-Path "backend/server_ai_interviewer.py")) {
    Write-Host "Error: Must run from project root" -ForegroundColor Red
    exit 1
}

Set-Location backend

Write-Host "Step 1: Build container image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 2: Deploy to Cloud Run..." -ForegroundColor Yellow
# Note: For service account credentials in Cloud Run, use volume mounts
# The GEMINI_API_KEY will be available as an environment variable
# PORT is automatically set by Cloud Run and cannot be overridden
gcloud run deploy $SERVICE_NAME `
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
    --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,GCP_PROJECT_ID=$PROJECT_ID,PRODUCTION=1" `
    --memory 2Gi `
    --cpu 2 `
    --timeout 300 `
    --max-instances 10 `
    --min-instances 0 `
    --concurrency 80 `
    --project=$PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Step 3: Get backend URL..." -ForegroundColor Yellow
$BACKEND_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)" --project=$PROJECT_ID

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Update NEXT_PUBLIC_BACKEND_URL secret..." -ForegroundColor Yellow
echo $BACKEND_URL | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --data-file=- --project=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "Secret updated successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: Could not update secret, but backend is deployed" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "=== Backend Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend URL: $BACKEND_URL"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the backend: Invoke-WebRequest $BACKEND_URL/health"
Write-Host "2. Redeploy frontend to use new backend URL"
Write-Host "3. Or manually update .env with: NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL"
Write-Host ""
