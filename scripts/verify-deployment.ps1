# Verify Firebase App Hosting Setup

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "Firebase App Hosting - Configuration Check" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking required secrets..." -ForegroundColor Gray
Write-Host ""

$requiredSecrets = @(
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY"
)

$allGood = $true

foreach ($secret in $requiredSecrets) {
    Write-Host "Checking: $secret" -ForegroundColor Yellow
    $result = gcloud secrets describe $secret --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK" -ForegroundColor Green
    }
    else {
        Write-Host "  MISSING" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "All required secrets are set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
    Write-Host "2. Check deployment status" -ForegroundColor White
    Write-Host "3. If needed, trigger a new deployment manually" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app should work once the deployment completes!" -ForegroundColor Green
}
else {
    Write-Host "Some secrets are missing. Run:" -ForegroundColor Red
    Write-Host "  .\scripts\setup-firebase-secrets.ps1" -ForegroundColor Yellow
}

Write-Host ""
