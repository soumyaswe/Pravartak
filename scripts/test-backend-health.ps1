# Test Backend Health and TTS Status
# This helps diagnose why the interviewer might not be speaking

$BACKEND_URL = $env:NEXT_PUBLIC_BACKEND_URL
if (-not $BACKEND_URL) {
    $BACKEND_URL = Read-Host "Enter backend URL (e.g., http://localhost:5000 or https://pravartak-backend-xxx.run.app)"
}

if (-not $BACKEND_URL) {
    Write-Host "Error: Backend URL is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Testing Backend Health ===" -ForegroundColor Cyan
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Yellow
Write-Host ""

# Test health endpoint
Write-Host "Step 1: Testing /health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Cyan
    Write-Host "  Status: $($health.status)" -ForegroundColor $(if ($health.status -eq 'healthy') { "Green" } else { "Yellow" })
    Write-Host "  TTS Initialized: $($health.tts_initialized)" -ForegroundColor $(if ($health.tts_initialized) { "Green" } else { "Red" })
    Write-Host "  STT Initialized: $($health.stt_initialized)" -ForegroundColor $(if ($health.stt_initialized) { "Green" } else { "Yellow" })
    Write-Host "  Gemini Initialized: $($health.gemini_initialized)" -ForegroundColor $(if ($health.gemini_initialized) { "Green" } else { "Red" })
    Write-Host "  Active Sessions: $($health.active_sessions)" -ForegroundColor White
    
    if ($health.warnings) {
        Write-Host ""
        Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
        foreach ($warning in $health.warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    
    if (-not $health.tts_initialized) {
        Write-Host ""
        Write-Host "❌ CRITICAL: TTS is not initialized!" -ForegroundColor Red
        Write-Host "   The interviewer will NOT be able to speak." -ForegroundColor Red
        Write-Host "   Check:" -ForegroundColor Yellow
        Write-Host "   1. Service account permissions" -ForegroundColor White
        Write-Host "   2. Text-to-Speech API is enabled" -ForegroundColor White
        Write-Host "   3. Backend logs for initialization errors" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "   The backend might not be running or accessible." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Checking backend logs..." -ForegroundColor Yellow
Write-Host "   If running locally, check the terminal where you ran the backend" -ForegroundColor Gray
Write-Host "   Look for:" -ForegroundColor Gray
Write-Host "   - '✅ Text-to-Speech client initialized successfully'" -ForegroundColor Gray
Write-Host "   - '❌ ERROR: Failed to initialize Text-to-Speech client'" -ForegroundColor Gray
Write-Host ""
Write-Host "   If running on Cloud Run, use:" -ForegroundColor Gray
Write-Host "   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=pravartak-backend' --limit 50 --project=pravartak-15665" -ForegroundColor Gray
Write-Host ""

