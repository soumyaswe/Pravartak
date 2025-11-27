# Fix Firebase App Hosting Secrets Access
# This script grants the Firebase App Hosting service account access to all required secrets

$PROJECT_ID = "pravartak-15665"
$SERVICE_ACCOUNT = "firebase-app-hosting-compute@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase App Hosting Secrets Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Service Account: $SERVICE_ACCOUNT" -ForegroundColor Yellow
Write-Host ""

# List of all secrets required by the application
$SECRETS = @(
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_BACKEND_URL",
    "GOOGLE_APPLICATION_CREDENTIALS"
)

Write-Host "Step 1: Verifying secrets exist..." -ForegroundColor Yellow
Write-Host ""

$missingSecrets = @()
foreach ($SECRET in $SECRETS) {
    $result = gcloud secrets describe $SECRET --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $SECRET exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $SECRET NOT FOUND" -ForegroundColor Red
        $missingSecrets += $SECRET
    }
}

if ($missingSecrets.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: The following secrets are missing:" -ForegroundColor Yellow
    foreach ($secret in $missingSecrets) {
        Write-Host "   - $secret" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Please create these secrets first using:" -ForegroundColor White
    Write-Host "   gcloud secrets create $secret --project=$PROJECT_ID" -ForegroundColor Gray
    Write-Host "   echo 'your-value' | gcloud secrets versions add $secret --project=$PROJECT_ID --data-file=-" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "Step 2: Granting Firebase App Hosting service account access..." -ForegroundColor Yellow
Write-Host ""

foreach ($SECRET in $SECRETS) {
    Write-Host "Granting access to: $SECRET" -ForegroundColor White
    
    $result = gcloud secrets add-iam-policy-binding $SECRET `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Access granted" -ForegroundColor Green
    } else {
        # Check if it's already granted
        $checkResult = gcloud secrets get-iam-policy $SECRET --project=$PROJECT_ID 2>&1
        if ($checkResult -match $SERVICE_ACCOUNT) {
            Write-Host "  ✅ Access already granted" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Warning: $result" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 3: Granting Vertex AI permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/aiplatform.user" `
    --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Granted Vertex AI User role" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Vertex AI role may already be granted" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Secrets Access Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 1-2 minutes for permissions to propagate" -ForegroundColor White
Write-Host "2. Push your code to GitHub to trigger a new deployment" -ForegroundColor White
Write-Host "3. The secrets will be automatically injected at BUILD and RUNTIME" -ForegroundColor White
Write-Host ""
Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "- DATABASE_URL must exist in Secret Manager" -ForegroundColor White
Write-Host "- NEXT_PUBLIC_BACKEND_URL must exist in Secret Manager (for Interview Simulator)" -ForegroundColor White
Write-Host "- GEMINI_API_KEY must exist in Secret Manager (for CV Analyser, etc.)" -ForegroundColor White
Write-Host ""


