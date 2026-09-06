# ============================================================
#  elevate-agent.ps1
#  Set MiniMax Code to always launch as Administrator.
#  Persistent via AppCompatFlags\Layers (per-user, no admin needed).
# ============================================================

$ErrorActionPreference = 'Continue'
$exe = "C:\Users\lion_\AppData\Local\Programs\MiniMax Code\MiniMax Code.exe"
$key = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"

if (-not (Test-Path $exe)) {
    Write-Host "[FAIL] MiniMax Code.exe not found at:" -ForegroundColor Red
    Write-Host "       $exe"
    exit 1
}

if (-not (Test-Path $key)) {
    New-Item -Path $key -Force | Out-Null
}

$current = (Get-ItemProperty -Path $key -Name $exe -ErrorAction SilentlyContinue).$exe
if ($current -eq 'RUNASADMIN') {
    Write-Host "[OK] Already set to RUNASADMIN. No change needed." -ForegroundColor Green
} else {
    Set-ItemProperty -Path $key -Name $exe -Value "RUNASADMIN"
    Write-Host "[OK] Set MiniMax Code.exe to always run as Administrator." -ForegroundColor Green
    if ($current) {
        Write-Host "    (was: $current)"
    }
}

# Verify
Write-Host ""
Write-Host "--- Verification ---"
Write-Host "Key:    $key"
Write-Host "Value:  $((Get-ItemProperty -Path $key -Name $exe).$exe)"
Write-Host "Target: $exe"
Write-Host ""
Write-Host "=== Next step: restart MiniMax Code ===" -ForegroundColor Cyan
Write-Host "    1. Close MiniMax Code completely (right-click tray icon -> Quit, or close all windows)."
Write-Host "    2. Reopen it. Windows will show a UAC prompt -- click Yes."
Write-Host "    3. Once it's back up, tell the agent to retry its shell test."
Write-Host ""
Write-Host "After the restart, ALL child processes spawned by the agent -- including"
Write-Host "the bash tool's pwsh.exe -- will inherit the elevated token and work normally."
