# Grant Firebase App Hosting secrets access using Firebase CLI
# This is the proper way to grant access for Firebase App Hosting (not just gcloud)

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase App Hosting Secrets Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Using Firebase CLI to grant secrets access..." -ForegroundColor Yellow
Write-Host ""

# List of secrets that need App Hosting access
$SECRETS = @(
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_BACKEND_URL",
    "GOOGLE_APPLICATION_CREDENTIALS"
)

foreach ($SECRET in $SECRETS) {
    Write-Host "Granting Firebase App Hosting access to: $SECRET" -ForegroundColor White
    
    # Use Firebase CLI command for App Hosting secrets access
    $result = firebase apphosting:secrets:grantaccess $SECRET --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Access granted" -ForegroundColor Green
    } else {
        # Check if it's already granted or if there's another issue
        $errorOutput = $result -join "`n"
        if ($errorOutput -match "already granted" -or $errorOutput -match "already has access") {
            Write-Host "  ✅ Access already granted" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Warning: $errorOutput" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Firebase App Hosting Secrets Access Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify secrets are configured in apphosting.yaml" -ForegroundColor White
Write-Host "2. Push code to GitHub to trigger a new deployment" -ForegroundColor White
Write-Host "3. Check /api/debug-env after deployment to verify env vars are available" -ForegroundColor White
Write-Host ""

