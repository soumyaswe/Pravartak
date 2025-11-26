# Grant Firebase App Hosting service account access to all required secrets

$PROJECT_ID = "pravartak-15665"
$SERVICE_ACCOUNT = "firebase-app-hosting-compute@$PROJECT_ID.iam.gserviceaccount.com"

# List of secrets that the backend needs
$SECRETS = @(
    "DATABASE_URL",
    "GOOGLE_CLOUD_PROJECT_ID",
    "GCP_PROJECT_ID",
    "GOOGLE_CLOUD_REGION",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "NEXT_PUBLIC_BACKEND_URL",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

Write-Host "ðŸ” Granting Firebase App Hosting access to secrets..." -ForegroundColor Cyan
Write-Host "Service Account: $SERVICE_ACCOUNT" -ForegroundColor Yellow
Write-Host ""

foreach ($SECRET in $SECRETS) {
    Write-Host "Processing: $SECRET" -ForegroundColor White
    
    # Grant secretAccessor role
    $result = gcloud secrets add-iam-policy-binding $SECRET `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  âœ… Access granted to $SECRET" -ForegroundColor Green
    } else {
        Write-Host "  âš ï¸  Warning: $SECRET - $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Secret access configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Your apphosting.yaml already references these secrets" -ForegroundColor White
Write-Host "2. Deploy your app: firebase apphosting:rollouts:create pravartak" -ForegroundColor White
Write-Host "3. The secrets will be automatically injected at runtime" -ForegroundColor White

