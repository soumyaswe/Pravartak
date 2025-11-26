# Complete Firebase App Hosting Fix
# SECURITY: This script now prompts for credentials instead of hardcoding them

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "Firebase App Hosting - Complete Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  SECURITY: This script will prompt for sensitive credentials." -ForegroundColor Yellow
Write-Host "   Credentials will NOT be stored in the script file." -ForegroundColor Yellow
Write-Host ""

# Update only the required secrets
Write-Host "Step 1: Updating required secrets..." -ForegroundColor Yellow
Write-Host ""

# DATABASE_URL - Prompt for it
Write-Host "DATABASE_URL:" -ForegroundColor Cyan
Write-Host "  Format: postgresql://user:password@host:port/database" -ForegroundColor Gray
$dbUrl = Read-Host "  Enter DATABASE_URL (or press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Host "Setting DATABASE_URL..." -ForegroundColor Gray
    $dbUrl | gcloud secrets versions add DATABASE_URL --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }
} else {
    Write-Host "  Skipped" -ForegroundColor Yellow
}

# GEMINI_API_KEY - Prompt for it
Write-Host ""
Write-Host "GEMINI_API_KEY:" -ForegroundColor Cyan
Write-Host "  Get a new key from: https://aistudio.google.com/apikey" -ForegroundColor Gray
$geminiKey = Read-Host "  Enter GEMINI_API_KEY (or press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($geminiKey)) {
    Write-Host "Setting GEMINI_API_KEY..." -ForegroundColor Gray
    $geminiKey | gcloud secrets versions add GEMINI_API_KEY --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }
} else {
    Write-Host "  Skipped" -ForegroundColor Yellow
}

# NEXT_PUBLIC_BACKEND_URL - Prompt for it
Write-Host ""
Write-Host "NEXT_PUBLIC_BACKEND_URL:" -ForegroundColor Cyan
Write-Host "  Format: https://your-backend-url.run.app or http://localhost:5000 for local" -ForegroundColor Gray
$backendUrl = Read-Host "  Enter NEXT_PUBLIC_BACKEND_URL (or press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "Setting NEXT_PUBLIC_BACKEND_URL..." -ForegroundColor Gray
    $backendUrl | gcloud secrets versions add NEXT_PUBLIC_BACKEND_URL --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red }
} else {
    Write-Host "  Skipped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Verifying secrets..." -ForegroundColor Yellow
Write-Host ""

$required = @("DATABASE_URL", "GEMINI_API_KEY")

Write-Host "Verifying secrets exist in Secret Manager..." -ForegroundColor Gray
foreach ($secret in $required) {
    Write-Host "Checking: $secret" -ForegroundColor Gray
    gcloud secrets describe $secret --project=$PROJECT_ID 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK" -ForegroundColor Green
    } else {
        Write-Host "  MISSING" -ForegroundColor Red
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
