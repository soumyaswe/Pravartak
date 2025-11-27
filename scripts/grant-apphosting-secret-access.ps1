# Grant Firebase App Hosting access to secrets using Firebase CLI
# This is the recommended way to grant secret access for App Hosting

$PROJECT_ID = "pravartak-15665"
$BACKEND_NAME = "pravartak"  # Your App Hosting backend name
$LOCATION = "asia-southeast1"  # Your backend location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase App Hosting Secret Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: $BACKEND_NAME" -ForegroundColor Yellow
Write-Host "Location: $LOCATION" -ForegroundColor Yellow
Write-Host ""

# List of secrets that need access granted
$SECRETS = @(
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_BACKEND_URL",
    "GOOGLE_APPLICATION_CREDENTIALS"
)

Write-Host "Granting Firebase App Hosting access to secrets..." -ForegroundColor Yellow
Write-Host ""

foreach ($SECRET in $SECRETS) {
    Write-Host "Processing: $SECRET" -ForegroundColor White
    
    # Use Firebase CLI to grant access (requires --backend and --location)
    $result = firebase apphosting:secrets:grantaccess $SECRET `
        --backend=$BACKEND_NAME `
        --location=$LOCATION `
        --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Access granted to $SECRET" -ForegroundColor Green
    } else {
        # Check the output for success message (exit code might be non-zero but still successful)
        if ($result -match "Successfully set IAM bindings") {
            Write-Host "  ✅ Access granted to $SECRET" -ForegroundColor Green
        } elseif ($result -match "already granted" -or $result -match "already has access") {
            Write-Host "  ✅ Access already granted to $SECRET" -ForegroundColor Green
        } elseif ($result -match "not found" -or $result -match "does not exist") {
            Write-Host "  ⚠️  Secret $SECRET not found in Secret Manager" -ForegroundColor Yellow
            Write-Host "     Create it first: gcloud secrets create $SECRET --project=$PROJECT_ID" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠️  Warning: $result" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Secret Access Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify secrets are configured in apphosting.yaml" -ForegroundColor White
Write-Host "2. Push code to GitHub to trigger a new deployment" -ForegroundColor White
Write-Host "3. Test /api/debug-env endpoint after deployment" -ForegroundColor White
Write-Host "4. Check Cloud Run logs if DATABASE_URL is still not available" -ForegroundColor White
Write-Host ""

