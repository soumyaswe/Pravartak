# Complete Firebase App Hosting Fix

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "Firebase App Hosting - Complete Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Update only the required secrets
Write-Host "Step 1: Updating required secrets..." -ForegroundColor Yellow
Write-Host ""

# DATABASE_URL
$dbUrl = "postgresql://postgres:74a1bb88-5e41-49dc-bcb6-a20405ce14f0@34.59.165.125:5432/pravartak_db"
Write-Host "Setting DATABASE_URL..." -ForegroundColor Gray
echo $dbUrl | gcloud secrets versions add DATABASE_URL --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }

# GEMINI_API_KEY
$geminiKey = "AIzaSyAryUfaPspW7Lm0fwFLAnd1Ghb5zOfUHmA"
Write-Host "Setting GEMINI_API_KEY..." -ForegroundColor Gray
echo $geminiKey | gcloud secrets versions add GEMINI_API_KEY --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }

# NEXT_PUBLIC_BACKEND_URL (optional but set anyway)
$backendUrl = "http://127.0.0.1:5000"
Write-Host "Setting NEXT_PUBLIC_BACKEND_URL..." -ForegroundColor Gray
echo $backendUrl | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }

Write-Host ""
Write-Host "Step 2: Verifying secrets..." -ForegroundColor Yellow
Write-Host ""

$required = @("DATABASE_URL", "GEMINI_API_KEY")
$allGood = $true

foreach ($secret in $required) {
    Write-Host "Checking: $secret" -ForegroundColor Gray
    gcloud secrets describe $secret --project=$PROJECT_ID 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK" -ForegroundColor Green
    } else {
        Write-Host "  MISSING" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "Step 3: Triggering deployment..." -ForegroundColor Yellow
Write-Host ""

# Make a small change to trigger deployment
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$readme = Get-Content "README.md" -Raw
if ($readme -notmatch "Last updated:") {
    Add-Content "README.md" "`n<!-- Last updated: $timestamp -->"
}

git add README.md
git commit -m "Trigger deployment - secrets updated at $timestamp"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Deployment triggered" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Wait 5-10 minutes for deployment" -ForegroundColor White
    Write-Host "2. Check: https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
    Write-Host "3. View logs to verify Firebase initialization" -ForegroundColor White
} else {
    Write-Host "FAILED to push" -ForegroundColor Red
}

Write-Host ""
