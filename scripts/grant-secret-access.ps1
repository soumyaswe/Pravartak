$PROJECT_ID = "pravartak-15665"
$SERVICE_ACCOUNT = "firebase-app-hosting-compute@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "=== Granting Firebase App Hosting Access to Secrets ===" -ForegroundColor Cyan

$SECRETS = @("DATABASE_URL", "GEMINI_API_KEY", "NEXT_PUBLIC_BACKEND_URL", "GOOGLE_APPLICATION_CREDENTIALS")

foreach ($SECRET in $SECRETS) {
    Write-Host "Granting access to: $SECRET" -ForegroundColor Green
    
    gcloud secrets add-iam-policy-binding $SECRET --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Success" -ForegroundColor Green
    } else {
        Write-Host "  Failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Push code to GitHub to trigger new deployment"

