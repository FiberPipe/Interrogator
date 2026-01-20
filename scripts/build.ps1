# scripts/build.ps1
# Full build script for Interrogator
# Encoding: UTF-8 with BOM

param(
    [switch]$SkipClean,
    [switch]$SkipRebuild,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Interrogator Build Script v1.0        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Preparation
if (-not $SkipClean) {
    Write-Host "[1/5] Preparing build environment..." -ForegroundColor Yellow
    node scripts/prepare-build.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Preparation failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/5] Skipping clean (--SkipClean flag)" -ForegroundColor Gray
}

# Step 2: Prebuild checks
Write-Host ""
Write-Host "[2/5] Running prebuild checks..." -ForegroundColor Yellow
node scripts/prebuild.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Prebuild checks failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build Web (React)
Write-Host ""
Write-Host "[3/5] Building React application..." -ForegroundColor Yellow
pnpm build:web
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] React build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] React build successful" -ForegroundColor Green

# Step 4: Build Electron
Write-Host ""
Write-Host "[4/5] Building Electron main process..." -ForegroundColor Yellow
pnpm build:electron
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Electron build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Electron build successful" -ForegroundColor Green

# Step 5: Create distributable
if (-not $Dev) {
    Write-Host ""
    Write-Host "[5/5] Creating Windows executable..." -ForegroundColor Yellow
    
    if ($SkipRebuild) {
        npx electron-builder --win --x64 --config.npmRebuild=false
    } else {
        npx electron-builder --win --x64
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Packaging failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] Build complete!" -ForegroundColor Green
    Write-Host "Output location: dist/" -ForegroundColor Cyan
    
    if (Test-Path "dist") {
        $exeFiles = Get-ChildItem -Path dist -Filter "*.exe"
        if ($exeFiles) {
            Write-Host ""
            Write-Host "Created executables:" -ForegroundColor Green
            $exeFiles | ForEach-Object {
                $size = [math]::Round($_.Length / 1MB, 2)
                Write-Host "  - $($_.Name) ($size MB)" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "[5/5] Skipping packaging (--Dev flag)" -ForegroundColor Gray
    Write-Host "[OK] Development build complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         BUILD SUCCESSFUL!                " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
