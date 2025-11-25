# Delete and Recreate All Firebase Secrets

$PROJECT_ID = "pravartak-15665"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Secrets - Complete Reset" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# List of secrets to manage
$secrets = @(
    @{
        Name = "DATABASE_URL"
        Description = "PostgreSQL connection string"
        Required = $true
        Example = "postgresql://user:password@host:5432/database"
    },
    @{
        Name = "GEMINI_API_KEY"
        Description = "Google AI Gemini API key"
        Required = $true
        Example = "AIzaSy..."
    },
    @{
        Name = "NEXT_PUBLIC_FIREBASE_API_KEY"
        Description = "Firebase Web API Key (from Firebase Console)"
        Required = $true
        Example = "AIzaSy..."
    },
    @{
        Name = "NEXT_PUBLIC_BACKEND_URL"
        Description = "Python backend URL (optional)"
        Required = $false
        Example = "https://your-backend.run.app"
    },
    @{
        Name = "GOOGLE_APPLICATION_CREDENTIALS"
        Description = "Path to service account JSON (optional)"
        Required = $false
        Example = "/path/to/service-account.json"
    }
)

# Step 1: Delete existing secrets
Write-Host "STEP 1: Deleting existing secrets..." -ForegroundColor Cyan
Write-Host ""

foreach ($secret in $secrets) {
    Write-Host "Checking: $($secret.Name)" -ForegroundColor Yellow
    
    $exists = gcloud secrets describe $($secret.Name) --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Deleting..." -ForegroundColor Gray
        gcloud secrets delete $($secret.Name) --project=$PROJECT_ID --quiet 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  DELETED" -ForegroundColor Green
        }
        else {
            Write-Host "  FAILED to delete" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Does not exist (skipped)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 2: Create new secrets
Write-Host "STEP 2: Creating new secrets..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Please enter the values for each secret." -ForegroundColor Yellow
Write-Host "Press Enter to skip optional secrets." -ForegroundColor Gray
Write-Host ""

foreach ($secret in $secrets) {
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Secret: $($secret.Name)" -ForegroundColor Yellow
    Write-Host "Description: $($secret.Description)" -ForegroundColor Gray
    Write-Host "Example: $($secret.Example)" -ForegroundColor DarkGray
    
    if ($secret.Required) {
        Write-Host "Status: REQUIRED" -ForegroundColor Red
    }
    else {
        Write-Host "Status: Optional" -ForegroundColor Gray
    }
    
    $value = Read-Host "Enter value"
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($secret.Required) {
            Write-Host "WARNING: Required secret skipped!" -ForegroundColor Red
        }
        else {
            Write-Host "Skipped" -ForegroundColor Gray
        }
        Write-Host ""
        continue
    }
    
    Write-Host "Creating secret..." -ForegroundColor Gray
    $value | gcloud secrets create $($secret.Name) --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Secret created" -ForegroundColor Green
    }
    else {
        Write-Host "ERROR: Failed to create secret" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify all secrets
Write-Host "Verifying created secrets..." -ForegroundColor Yellow
Write-Host ""

$allGood = $true

foreach ($secret in $secrets) {
    Write-Host "Checking: $($secret.Name)" -ForegroundColor Yellow
    
    $exists = gcloud secrets describe $($secret.Name) --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK" -ForegroundColor Green
    }
    else {
        if ($secret.Required) {
            Write-Host "  MISSING (REQUIRED!)" -ForegroundColor Red
            $allGood = $false
        }
        else {
            Write-Host "  Not set (optional)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "SUCCESS: All required secrets are set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Trigger deployment at: https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
    Write-Host "2. Wait 5-10 minutes for rebuild" -ForegroundColor White
    Write-Host "3. Test your application" -ForegroundColor White
}
else {
    Write-Host "WARNING: Some required secrets are missing!" -ForegroundColor Red
    Write-Host "Run this script again to set missing secrets." -ForegroundColor Yellow
}

Write-Host ""
