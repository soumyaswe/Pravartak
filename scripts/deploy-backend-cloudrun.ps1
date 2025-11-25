$PROJECT_ID = "pravartak-15665"
$REGION = "us-central1"
$SERVICE_NAME = "pravartak-backend"

Write-Host "=== Deploy Backend to Cloud Run ===" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "Step 1: Build container image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Deploy to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars="GEMINI_API_KEY=$((gcloud secrets versions access latest --secret=GEMINI_API_KEY --project=$PROJECT_ID))" `
    --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" `
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID" `
    --project=$PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Get backend URL..." -ForegroundColor Yellow
$BACKEND_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)" --project=$PROJECT_ID

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Update NEXT_PUBLIC_BACKEND_URL secret..." -ForegroundColor Yellow
echo $BACKEND_URL | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --data-file=- --project=$PROJECT_ID

Set-Location ..

Write-Host ""
Write-Host "Step 5: Update apphosting.yaml..." -ForegroundColor Yellow

Write-Host ""
Write-Host "Step 6: Trigger frontend deployment..." -ForegroundColor Yellow
git add .
git commit -m "Deploy backend to Cloud Run" --allow-empty
git push origin main

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Backend URL: $BACKEND_URL"
Write-Host "Wait 10 minutes for frontend to redeploy with new backend URL"
