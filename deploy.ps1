# Publish the site: commit everything, push to GitHub (Vercel deploys main
# on push), wait until the live page changes, then open it without cache.
#   Right-click > Run with PowerShell, or:  powershell -ExecutionPolicy Bypass -File deploy.ps1 "message"
param([string]$Message = "Update site $(Get-Date -Format 'yyyy-MM-dd HH:mm')")

$ErrorActionPreference = "Stop"
$site = "https://jdiaz.vercel.app/"
Set-Location $PSScriptRoot

function Get-LiveStamp {
    try {
        $r = Invoke-WebRequest -Uri "$site`?v=$(Get-Random)" -Method Head -UseBasicParsing -TimeoutSec 15
        return $r.Headers["Last-Modified"]
    } catch { return $null }
}

$before = Get-LiveStamp

git add -A
if (git status --porcelain) {
    git commit -m $Message | Out-Null
    Write-Host "Committed: $Message"
} else {
    Write-Host "Nothing new to commit - pushing what is already committed."
}
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Push failed." -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }

Write-Host "Waiting for Vercel to publish" -NoNewline
$deadline = (Get-Date).AddMinutes(4)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 5
    Write-Host "." -NoNewline
    $now = Get-LiveStamp
    if ($now -and $now -ne $before) { break }
}
Write-Host ""
if ($now -and $now -ne $before) { Write-Host "Live: $now" -ForegroundColor Green }
else { Write-Host "No change seen yet (nothing new, or Vercel still building). Opening anyway." -ForegroundColor Yellow }

Start-Process "$site`?v=$(Get-Random)"
