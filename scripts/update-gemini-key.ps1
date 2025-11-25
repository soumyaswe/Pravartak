$PROJECT_ID = "pravartak-15665"

Write-Host "=== Update Leaked GEMINI_API_KEY ===" -ForegroundColor Red
Write-Host ""
Write-Host "Your Gemini API key was compromised and disabled by Google." -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Get a NEW API key" -ForegroundColor Cyan
Write-Host "  1. Open: https://aistudio.google.com/apikey"
Write-Host "  2. Delete the old key (AIzaSyAryUfaPspW7Lm0fwFLAnd1Ghb5zOfUHmA)"
Write-Host "  3. Click 'Create API Key'"
Write-Host "  4. Select project: pravartak-15665"
Write-Host "  5. Copy the new key"
Write-Host ""

$newKey = Read-Host "Paste your NEW Gemini API key here"

if ([string]::IsNullOrWhiteSpace($newKey)) {
    Write-Host "No key provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Updating Secret Manager..." -ForegroundColor Cyan

echo $newKey | gcloud secrets versions add GEMINI_API_KEY --data-file=- --project=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Success! Secret updated" -ForegroundColor Green
} else {
    Write-Host "  Failed to update secret" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Update your local .env file" -ForegroundColor Cyan
$envPath = ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'GEMINI_API_KEY="[^"]*"', "GEMINI_API_KEY=`"$newKey`""
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "  Updated .env file" -ForegroundColor Green
} else {
    Write-Host "  .env file not found - please update manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Trigger deployment" -ForegroundColor Cyan
Write-Host "  Adding commit to trigger rebuild..."

git add .
git commit -m "Fix: Update Gemini API key after leak" --allow-empty
git push origin main

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Wait 10 minutes for deployment to complete"
Write-Host "Check: https://console.firebase.google.com/project/pravartak-15665/apphosting"
