# PowerShell script to fix dependency issues
Write-Host "🔧 Fixing CFS Platform dependencies..." -ForegroundColor Green

# Remove problematic files
Write-Host "Cleaning up..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies with legacy peer deps
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🎉 Dependencies fixed!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
