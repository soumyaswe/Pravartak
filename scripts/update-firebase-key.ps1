# Update Firebase API Key

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "Update Firebase API Key" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "Get your Firebase Web API Key from:" -ForegroundColor Gray
Write-Host "https://console.firebase.google.com/project/$PROJECT_ID/settings/general/" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Paste your Firebase Web API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "ERROR: No API key provided" -ForegroundColor Red
    exit 1
}

Write-Host "Updating secret..." -ForegroundColor Yellow
$apiKey | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_API_KEY --project=$PROJECT_ID --data-file=-

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Secret updated" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: firebase deploy --only hosting" -ForegroundColor White
}
else {
    Write-Host "ERROR: Failed to update secret" -ForegroundColor Red
    $url = "https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
    Write-Host "Use console: $url" -ForegroundColor Yellow
}

Write-Host ""
