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
Write-Host "Step 2: Checking service account..." -ForegroundColor Yellow
$SERVICE_ACCOUNT_EMAIL = "$PROJECT_ID@appspot.gserviceaccount.com"
$CUSTOM_SERVICE_ACCOUNT = "$SERVICE_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Check if custom service account exists, otherwise use default
$null = gcloud iam service-accounts describe $CUSTOM_SERVICE_ACCOUNT --project=$PROJECT_ID 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Using custom service account: $CUSTOM_SERVICE_ACCOUNT" -ForegroundColor Green
    $USE_SERVICE_ACCOUNT = $CUSTOM_SERVICE_ACCOUNT
} else {
    Write-Host "  Using default App Engine service account: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor Yellow
    Write-Host "  Note: For production, consider creating a dedicated service account" -ForegroundColor Yellow
    $USE_SERVICE_ACCOUNT = $SERVICE_ACCOUNT_EMAIL
}

Write-Host ""
Write-Host "Step 3: Deploy to Cloud Run..." -ForegroundColor Yellow
# Note: Cloud Run uses Application Default Credentials from the attached service account
# No GOOGLE_APPLICATION_CREDENTIALS file path needed - ADC is automatic
# PORT is automatically set by Cloud Run and cannot be overridden
gcloud run deploy $SERVICE_NAME `
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --service-account=$USE_SERVICE_ACCOUNT `
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
    --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_REGION=$REGION,PRODUCTION=1" `
    --memory 2Gi `
    --cpu 2 `
    --timeout 600 `
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
Write-Host "Step 4: Get backend URL..." -ForegroundColor Yellow
$BACKEND_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)" --project=$PROJECT_ID

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Testing health endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 5  # Wait a moment for service to be ready
try {
    $healthResponse = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "   TTS Initialized: $($healthResponse.tts_initialized)" -ForegroundColor $(if ($healthResponse.tts_initialized) { "Green" } else { "Red" })
    Write-Host "   STT Initialized: $($healthResponse.stt_initialized)" -ForegroundColor $(if ($healthResponse.stt_initialized) { "Green" } else { "Yellow" })
    Write-Host "   Gemini Initialized: $($healthResponse.gemini_initialized)" -ForegroundColor $(if ($healthResponse.gemini_initialized) { "Green" } else { "Red" })
    
    if ($healthResponse.warnings) {
        Write-Host ""
        Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
        foreach ($warning in $healthResponse.warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
    
    if (-not $healthResponse.tts_initialized) {
        Write-Host ""
        Write-Host "❌ CRITICAL: TTS is not initialized - interviewer will not speak!" -ForegroundColor Red
        Write-Host "   The service account may not have proper permissions." -ForegroundColor Yellow
        Write-Host "   Run: .\scripts\fix-backend-service-account.ps1" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Could not reach health endpoint (service may still be starting)" -ForegroundColor Yellow
    Write-Host "   Try again in a minute: Invoke-RestMethod -Uri '$BACKEND_URL/health'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 6: Update NEXT_PUBLIC_BACKEND_URL secret..." -ForegroundColor Yellow
$BACKEND_URL | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret updated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not update secret (may already exist)" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "=== Backend Deployment Complete ===" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. View logs: gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --limit 50 --project=$PROJECT_ID" -ForegroundColor White
Write-Host "2. Check health: Invoke-RestMethod -Uri '$BACKEND_URL/health'" -ForegroundColor White
Write-Host "3. If TTS failed, fix permissions: .\scripts\fix-backend-service-account.ps1" -ForegroundColor White
Write-Host "4. Update frontend to use new backend URL" -ForegroundColor White
Write-Host ""
