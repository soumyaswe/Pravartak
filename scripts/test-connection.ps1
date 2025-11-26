# Test Firebase CLI and Backend Connection
# This script verifies Firebase CLI installation and backend connectivity

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  Firebase & Backend Connection Test" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$errors = @()

# Test 1: Check Firebase CLI
Write-Host "1. Testing Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Firebase CLI not found or error occurred" -ForegroundColor Red
        $errors += "Firebase CLI not working properly"
    }
} catch {
    Write-Host "   ❌ Firebase CLI not installed: $_" -ForegroundColor Red
    $errors += "Firebase CLI not installed"
}

# Test 2: Check Firebase login
Write-Host "`n2. Checking Firebase authentication..." -ForegroundColor Yellow
try {
    $firebaseProjects = firebase projects:list 2>&1
    if ($LASTEXITCODE -eq 0 -or $firebaseProjects -match "pravartak") {
        Write-Host "   ✅ Firebase authenticated" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Firebase authentication may be required" -ForegroundColor Yellow
        Write-Host "      Run: firebase login" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Could not verify Firebase auth: $_" -ForegroundColor Yellow
}

# Test 3: Check backend URL environment variable
Write-Host "`n3. Checking backend URL configuration..." -ForegroundColor Yellow
$backendUrl = $env:NEXT_PUBLIC_BACKEND_URL
if (-not $backendUrl) {
    # Try reading from apphosting.yaml
    if (Test-Path "apphosting.yaml") {
        $apphostingLines = Get-Content "apphosting.yaml"
        foreach ($line in $apphostingLines) {
            if ($line -like '*NEXT_PUBLIC_BACKEND_URL*' -and $line -like '*value:*') {
                $parts = $line -split 'value:'
                if ($parts.Length -gt 1) {
                    $backendUrl = $parts[1].Trim()
                    Write-Host "   Found in apphosting.yaml: $backendUrl" -ForegroundColor Cyan
                    break
                }
            }
        }
    }
    
    if (-not $backendUrl) {
        $backendUrl = "https://pravartak-backend-w5mkanjiva-uc.a.run.app"
        Write-Host "   ⚠️  Using default backend URL: $backendUrl" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ Backend URL from environment: $backendUrl" -ForegroundColor Green
}

# Test 4: Test backend health endpoint
Write-Host "`n4. Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $healthUrl = "$backendUrl/health"
    Write-Host "   Testing: $healthUrl" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 30 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
        Write-Host "      Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "      Active sessions: $($healthData.active_sessions)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Backend returned status: $($response.StatusCode)" -ForegroundColor Red
        $errors += "Backend health check failed"
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "   ❌ Cannot reach backend: $errorMessage" -ForegroundColor Red
    Write-Host "      URL: $backendUrl" -ForegroundColor Gray
    
    # Provide helpful suggestions based on error type
    if ($errorMessage -like "*timeout*" -or $errorMessage -like "*timed out*") {
        Write-Host "   💡 Tip: Backend may be sleeping (Cold Start)." -ForegroundColor Yellow
        Write-Host "      Cloud Run services may take 10-30 seconds to wake up." -ForegroundColor Yellow
        Write-Host "      Try again in a moment or check Cloud Run logs." -ForegroundColor Yellow
        $errors += "Backend timeout (may be sleeping)"
    } elseif ($errorMessage -like "*404*" -or $errorMessage -like "*not found*") {
        Write-Host "   💡 Tip: Backend URL may be incorrect or service not deployed." -ForegroundColor Yellow
        $errors += "Backend not found"
    } else {
        $errors += "Backend not reachable: $errorMessage"
    }
}

# Test 5: Test backend Socket.IO endpoint (basic check)
Write-Host "`n5. Testing Socket.IO endpoint..." -ForegroundColor Yellow
try {
    $socketUrl = "$backendUrl/socket.io/"
    Write-Host "   Testing: $socketUrl" -ForegroundColor Gray
    
    $queryParams = '?EIO=4&transport=polling'
    $socketTestUrl = $socketUrl + $queryParams
    $response = Invoke-WebRequest -Uri $socketTestUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Socket.IO endpoint is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Socket.IO endpoint returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $socketError = $_.Exception.Message
    Write-Host "   ⚠️  Socket.IO endpoint check failed: $socketError" -ForegroundColor Yellow
    if ($socketError -like "*timeout*" -or $socketError -like "*timed out*") {
        Write-Host "      Backend may be sleeping. Try accessing it first to wake it up." -ForegroundColor Yellow
    } else {
        Write-Host "      This is expected if Socket.IO requires WebSocket connection" -ForegroundColor Gray
    }
}

# Test 6: Check if backend URL is configured in apphosting.yaml
Write-Host "`n6. Checking apphosting.yaml configuration..." -ForegroundColor Yellow
if (Test-Path "apphosting.yaml") {
    $apphostingContent = Get-Content "apphosting.yaml" -Raw
    if ($apphostingContent -match "NEXT_PUBLIC_BACKEND_URL") {
        Write-Host "   ✅ NEXT_PUBLIC_BACKEND_URL is configured in apphosting.yaml" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  NEXT_PUBLIC_BACKEND_URL not found in apphosting.yaml" -ForegroundColor Yellow
        $errors += "NEXT_PUBLIC_BACKEND_URL missing from apphosting.yaml"
    }
} else {
    Write-Host "   ❌ apphosting.yaml not found" -ForegroundColor Red
    $errors += "apphosting.yaml missing"
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host "`nYour setup looks good. The backend should be connectable." -ForegroundColor Green
} else {
    Write-Host "❌ Found $($errors.Count) issue(s):" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "   - $err" -ForegroundColor Red
    }
    Write-Host "`nPlease fix these issues before proceeding." -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("Backend URL: " + $backendUrl) -ForegroundColor Cyan
Write-Host 'To test the connection manually, open: test-backend-connection.html' -ForegroundColor Cyan
Write-Host ""

