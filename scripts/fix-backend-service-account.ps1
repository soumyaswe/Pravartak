# Fix Backend Service Account Permissions
# This ensures the Cloud Run service account has all necessary permissions

$PROJECT_ID = "pravartak-15665"
$SERVICE_NAME = "pravartak-backend"
$SERVICE_ACCOUNT = "$PROJECT_ID@appspot.gserviceaccount.com"  # Default App Engine service account

Write-Host "=== Fixing Backend Service Account Permissions ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Service Account: $SERVICE_ACCOUNT" -ForegroundColor Yellow
Write-Host ""

# Grant Secret Manager access for GEMINI_API_KEY and other secrets
Write-Host "Step 0: Granting Secret Manager access..." -ForegroundColor Yellow
$SECRETS = @("GEMINI_API_KEY", "GOOGLE_APPLICATION_CREDENTIALS")

foreach ($SECRET in $SECRETS) {
    Write-Host "  Granting access to secret: $SECRET" -ForegroundColor White
    gcloud secrets add-iam-policy-binding $SECRET `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT_ID 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Access granted to $SECRET" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Warning: Could not grant access to $SECRET (may already be granted)" -ForegroundColor Yellow
    }
}

# Grant Text-to-Speech permissions
Write-Host "Step 1: Granting Text-to-Speech API permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/cloudtts.serviceAgent" `
    --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Granted Text-to-Speech Service Agent role" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not grant Text-to-Speech role (may already be granted)" -ForegroundColor Yellow
}

# Grant Speech-to-Text permissions
Write-Host ""
Write-Host "Step 2: Granting Speech-to-Text API permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/speech.serviceAgent" `
    --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Granted Speech-to-Text Service Agent role" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not grant Speech-to-Text role (may already be granted)" -ForegroundColor Yellow
}

# Grant Vertex AI permissions
Write-Host ""
Write-Host "Step 3: Granting Vertex AI permissions..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/aiplatform.user" `
    --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Granted Vertex AI User role" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not grant Vertex AI role (may already be granted)" -ForegroundColor Yellow
}

# Enable APIs if needed
Write-Host ""
Write-Host "Step 4: Enabling required APIs..." -ForegroundColor Yellow

$APIS = @(
    "texttospeech.googleapis.com",
    "speech.googleapis.com",
    "aiplatform.googleapis.com"
)

foreach ($API in $APIS) {
    Write-Host "  Enabling $API..." -ForegroundColor Gray
    gcloud services enable $API --project=$PROJECT_ID 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Enabled" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  May already be enabled" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "=== Service Account Permissions Updated ===" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 1-2 minutes for permissions to propagate" -ForegroundColor White
Write-Host "2. Restart the Cloud Run service:" -ForegroundColor White
Write-Host "   gcloud run services update $SERVICE_NAME --region us-central1 --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "3. Check health endpoint to verify TTS is initialized" -ForegroundColor White
Write-Host ""

