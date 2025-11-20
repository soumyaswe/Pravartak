#!/usr/bin/env pwsh
Write-Host "Running repository secret scan..." -ForegroundColor Cyan

$patterns = @(
  'AIza',
  'sk-[A-Za-z0-9_\-]{20,}',
  'ghp_[A-Za-z0-9_\-]{10,}',
  'AKIA[A-Z0-9]{8,}',
  'BEGIN PRIVATE KEY',
  'BEGIN RSA PRIVATE KEY',
  '"private_key"',
  'client_email',
  'client_id',
  'DATABASE_URL=',
  'NEXT_PUBLIC_FIREBASE_API_KEY=',
  'GEMINI_API_KEY='
)

$excludes = @('.git','node_modules','.next','backups','secrets_backup','.githooks')

$results = @()
Get-ChildItem -Recurse -File | ForEach-Object {
    $path = $_.FullName
    if ($excludes | ForEach-Object { $path -like "*$_*" } | Where-Object {$_}) { return }
    try {
        $content = Get-Content -Raw -LiteralPath $path -ErrorAction Stop
    } catch { return }
    foreach ($p in $patterns) {
        if ($content -match $p) { $results += "$path : matched $p"; break }
    }
}

if ($results.Count -gt 0) {
    Write-Host "Potential secrets found:" -ForegroundColor Red
    $results | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    exit 1
} else {
    Write-Host "No obvious secrets found." -ForegroundColor Green
    exit 0
}
