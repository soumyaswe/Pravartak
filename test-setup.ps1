# 🧪 Test Interview Simulator Setup
# This script verifies that everything is properly configured

Write-Host "🔍 Verifying Interview Simulator Setup..." -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
$backendPath = "$rootPath\backend"
$issues = @()
$warnings = @()

# Test 1: Check backend directory
Write-Host "[1/10] Checking backend directory..." -ForegroundColor Yellow
if (Test-Path $backendPath) {
    Write-Host "  ✅ Backend directory exists" -ForegroundColor Green
} else {
    $issues += "Backend directory not found at: $backendPath"
    Write-Host "  ❌ Backend directory not found" -ForegroundColor Red
}

# Test 2: Check Python files
Write-Host "[2/10] Checking backend Python files..." -ForegroundColor Yellow
if (Test-Path "$backendPath\server_ai_interviewer.py") {
    Write-Host "  ✅ server_ai_interviewer.py exists" -ForegroundColor Green
} else {
    $issues += "server_ai_interviewer.py not found"
    Write-Host "  ❌ server_ai_interviewer.py not found" -ForegroundColor Red
}

# Test 3: Check requirements.txt
Write-Host "[3/10] Checking requirements.txt..." -ForegroundColor Yellow
if (Test-Path "$backendPath\requirements.txt") {
    Write-Host "  ✅ requirements.txt exists" -ForegroundColor Green
} else {
    $issues += "requirements.txt not found"
    Write-Host "  ❌ requirements.txt not found" -ForegroundColor Red
}

# Test 4: Check .env file
Write-Host "[4/10] Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path "$backendPath\.env") {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content "$backendPath\.env" -Raw
    if ($envContent -match "GCP_PROJECT_ID=pravartak-15665") {
        Write-Host "  ✅ GCP_PROJECT_ID configured" -ForegroundColor Green
    } else {
        $warnings += ".env file exists but GCP_PROJECT_ID may need configuration"
        Write-Host "  ⚠️  GCP_PROJECT_ID needs to be configured" -ForegroundColor Yellow
    }
} else {
    $warnings += ".env file not found - will be created from .env.example"
    Write-Host "  ⚠️  .env file not found" -ForegroundColor Yellow
}

# Test 5: Check GCP credentials
Write-Host "[5/10] Checking GCP credentials..." -ForegroundColor Yellow
if (Test-Path "$backendPath\gcp-credentials.json") {
    Write-Host "  ✅ gcp-credentials.json exists" -ForegroundColor Green
} else {
    if (Test-Path "$rootPath\flash-precept-471409-u3-0a2cc0ca3940.json") {
        Write-Host "  ⚠️  Credentials found in root, copying to backend..." -ForegroundColor Yellow
        Copy-Item "$rootPath\flash-precept-471409-u3-0a2cc0ca3940.json" "$backendPath\gcp-credentials.json"
        Write-Host "  ✅ Credentials copied" -ForegroundColor Green
    } else {
        $issues += "GCP credentials not found"
        Write-Host "  ❌ gcp-credentials.json not found" -ForegroundColor Red
    }
}

# Test 6: Check virtual environment
Write-Host "[6/10] Checking Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "$backendPath\venv") {
    Write-Host "  ✅ Virtual environment exists" -ForegroundColor Green
} else {
    $warnings += "Virtual environment not found - will be created on first run"
    Write-Host "  ⚠️  Virtual environment not found (will be created)" -ForegroundColor Yellow
}

# Test 7: Check frontend components
Write-Host "[7/10] Checking frontend components..." -ForegroundColor Yellow
$componentPath = "$rootPath\app\(main)\interview-simulator\_components"
if (Test-Path "$componentPath\InterviewSimulator.jsx") {
    Write-Host "  ✅ InterviewSimulator.jsx exists" -ForegroundColor Green
} else {
    $issues += "InterviewSimulator.jsx not found"
    Write-Host "  ❌ InterviewSimulator.jsx not found" -ForegroundColor Red
}

if (Test-Path "$componentPath\converter.js") {
    Write-Host "  ✅ converter.js exists" -ForegroundColor Green
} else {
    $issues += "converter.js not found"
    Write-Host "  ❌ converter.js not found" -ForegroundColor Red
}

if (Test-Path "$componentPath\blendDataBlink.json") {
    Write-Host "  ✅ blendDataBlink.json exists" -ForegroundColor Green
} else {
    $issues += "blendDataBlink.json not found"
    Write-Host "  ❌ blendDataBlink.json not found" -ForegroundColor Red
}

# Test 8: Check 3D assets
Write-Host "[8/10] Checking 3D model assets..." -ForegroundColor Yellow
if (Test-Path "$rootPath\public\model.glb") {
    Write-Host "  ✅ model.glb exists" -ForegroundColor Green
} else {
    $issues += "model.glb not found in public/"
    Write-Host "  ❌ model.glb not found" -ForegroundColor Red
}

if (Test-Path "$rootPath\public\idle.fbx") {
    Write-Host "  ✅ idle.fbx exists" -ForegroundColor Green
} else {
    $issues += "idle.fbx not found in public/"
    Write-Host "  ❌ idle.fbx not found" -ForegroundColor Red
}

# Test 9: Check textures
Write-Host "[9/10] Checking texture images..." -ForegroundColor Yellow
$textureCount = 0
$requiredTextures = @(
    "body.webp", "eyes.webp", "teeth_diffuse.webp", "body_specular.webp",
    "body_roughness.webp", "body_normal.webp", "teeth_normal.webp",
    "h_color.webp", "tshirt_diffuse.webp", "tshirt_normal.webp",
    "tshirt_roughness.webp", "h_alpha.webp", "h_normal.webp", "h_roughness.webp", "bg.webp"
)

foreach ($texture in $requiredTextures) {
    if (Test-Path "$rootPath\public\images\$texture") {
        $textureCount++
    }
}

if ($textureCount -eq $requiredTextures.Count) {
    Write-Host "  ✅ All $textureCount textures found" -ForegroundColor Green
} else {
    $warnings += "Only $textureCount of $($requiredTextures.Count) textures found"
    Write-Host "  ⚠️  Only $textureCount of $($requiredTextures.Count) textures found" -ForegroundColor Yellow
}

# Test 10: Check Node.js dependencies
Write-Host "[10/10] Checking Node.js dependencies..." -ForegroundColor Yellow
if (Test-Path "$rootPath\node_modules") {
    Write-Host "  ✅ node_modules exists" -ForegroundColor Green
    
    # Check for critical packages
    if (Test-Path "$rootPath\node_modules\socket.io-client") {
        Write-Host "  ✅ socket.io-client installed" -ForegroundColor Green
    } else {
        $warnings += "socket.io-client not found in node_modules"
        Write-Host "  ⚠️  socket.io-client not found" -ForegroundColor Yellow
    }
    
    if (Test-Path "$rootPath\node_modules\three") {
        Write-Host "  ✅ three.js installed" -ForegroundColor Green
    } else {
        $warnings += "three.js not found in node_modules"
        Write-Host "  ⚠️  three.js not found" -ForegroundColor Yellow
    }
} else {
    $warnings += "node_modules not found - run 'npm install'"
    Write-Host "  ⚠️  node_modules not found (run npm install)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "         📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! You're ready to start!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the interview simulator, run:" -ForegroundColor Cyan
    Write-Host "  .\start-interview-simulator.ps1" -ForegroundColor White
} elseif ($issues.Count -eq 0) {
    Write-Host "⚠️  Setup complete with $($warnings.Count) warning(s):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "You can still proceed, but check the warnings above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start the interview simulator, run:" -ForegroundColor Cyan
    Write-Host "  .\start-interview-simulator.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Setup incomplete. $($issues.Count) issue(s) found:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  $($warnings.Count) warning(s):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Red
}

Write-Host ""
