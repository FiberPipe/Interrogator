# scripts/build.ps1
param(
    [switch]$SkipClean,
    [switch]$SkipRebuild,
    [switch]$Dev,
    [ValidateSet('alpha', 'beta')]
    [string]$Channel = 'alpha'
)

$ErrorActionPreference = "Stop"
$env:BUILD_CHANNEL = $Channel

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Interrogator Build Script v1.0        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Version info
Write-Host ""
Write-Host "📦 Building for channel: $($Channel.ToUpper())" -ForegroundColor Magenta
node scripts/version-manager.js sync

$buildArgs = @()
if ($SkipClean) { $buildArgs += '--skip-clean' }
if ($SkipRebuild) { $buildArgs += '--skip-rebuild' }
if ($Dev) { $buildArgs += '--dev' }
$buildArgs += "--channel=$Channel"

node scripts/build.js @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
