# Fix Vertex AI Permissions for Localhost Development
# This script grants the necessary Vertex AI permissions to your service account

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "=== Fix Vertex AI Permissions ===" -ForegroundColor Cyan
Write-Host ""

# Get the current user's email or service account
Write-Host "Checking current authentication..." -ForegroundColor Yellow
$currentAccount = gcloud config get-value account 2>&1
Write-Host "Current account: $currentAccount" -ForegroundColor Gray

Write-Host ""
Write-Host "Step 1: Enabling Vertex AI API..." -ForegroundColor Yellow
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Vertex AI API enabled" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to enable Vertex AI API" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Granting Vertex AI User role..." -ForegroundColor Yellow
Write-Host "  This role includes the 'aiplatform.endpoints.predict' permission" -ForegroundColor Gray

# Grant role to current user
if ($currentAccount -and $currentAccount -notlike "*ERROR*") {
    Write-Host "  Granting role to: $currentAccount" -ForegroundColor Gray
    Write-Host "  Note: If prompted, select option [2] 'None' for permanent access" -ForegroundColor Yellow
    
    # Grant without condition (permanent binding)
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="user:$currentAccount" `
        --role="roles/aiplatform.user" `
        --project=$PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Granted Vertex AI User role to: $currentAccount" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Interactive prompt detected or permission denied" -ForegroundColor Yellow
        Write-Host "  When prompted, type '2' and press Enter to select 'None'" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 3: Checking for service account credentials..." -ForegroundColor Yellow

# Check if service account is being used
$serviceAccountPath = ".env"
if (Test-Path $serviceAccountPath) {
    $envContent = Get-Content $serviceAccountPath -Raw
    if ($envContent -match 'GOOGLE_APPLICATION_CREDENTIALS\s*=\s*(.+)') {
        $credPath = $matches[1].Trim().Trim('"').Trim("'")
        Write-Host "  Found service account path: $credPath" -ForegroundColor Gray
        
        if (Test-Path $credPath) {
            try {
                $credContent = Get-Content $credPath -Raw | ConvertFrom-Json
                $serviceAccountEmail = $credContent.client_email
                Write-Host "  Service account: $serviceAccountEmail" -ForegroundColor Gray
                
                Write-Host ""
                Write-Host "  Granting Vertex AI User role to service account..." -ForegroundColor Yellow
                gcloud projects add-iam-policy-binding $PROJECT_ID `
                    --member="serviceAccount:$serviceAccountEmail" `
                    --role="roles/aiplatform.user" `
                    --project=$PROJECT_ID
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ Granted Vertex AI User role to service account" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠️  Failed to grant role" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "  ⚠️  Could not parse service account file" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠️  Service account file not found at: $credPath" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 4: Setting up Application Default Credentials..." -ForegroundColor Yellow
Write-Host "  Run this command manually:" -ForegroundColor Gray
Write-Host "  gcloud auth application-default login" -ForegroundColor White

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use Vertex AI on localhost, you need:" -ForegroundColor Yellow
Write-Host "1. Vertex AI API enabled ✅" -ForegroundColor White
Write-Host "2. Vertex AI User role granted to your account" -ForegroundColor White
Write-Host "3. Application Default Credentials configured:" -ForegroundColor White
Write-Host "   Run: gcloud auth application-default login" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR use a service account with Vertex AI User role" -ForegroundColor White
Write-Host ""
Write-Host "For more info: https://cloud.google.com/vertex-ai/docs/authentication" -ForegroundColor Gray
Write-Host ""

