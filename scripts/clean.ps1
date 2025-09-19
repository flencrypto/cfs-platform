# PowerShell script to clean node_modules and package-lock.json
Write-Host "🧹 Cleaning CFS Platform..." -ForegroundColor Green

# Remove node_modules if it exists
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules not found" -ForegroundColor Blue
}

# Remove package-lock.json if it exists
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  package-lock.json not found" -ForegroundColor Blue
}

Write-Host "🎉 Cleanup complete!" -ForegroundColor Green
Write-Host "Now run: npm install" -ForegroundColor Cyan
