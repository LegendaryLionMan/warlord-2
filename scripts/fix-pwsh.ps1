# ============================================================
#  fix-pwsh.ps1 - Diagnose & repair broken PowerShell 7 host
#  Run this in an ELEVATED PowerShell terminal
#  (right-click Start -> Terminal (Admin) or
#   right-click PowerShell -> Run as administrator)
# ============================================================

$ErrorActionPreference = 'Continue'
$target = "C:\Program Files\PowerShell\7\pwsh.exe"

Write-Host ""
Write-Host "=== PowerShell 7 host diagnostic ===" -ForegroundColor Cyan
Write-Host "Target: $target"
Write-Host ""

# ---- 1. File existence + size ----
if (-not (Test-Path $target)) {
    Write-Host "[FAIL] File does not exist. Reinstall required." -ForegroundColor Red
    Write-Host "       Run: winget install --id Microsoft.PowerShell --source winget --force"
    exit 1
}
$file = Get-Item $target
Write-Host "[OK]   File exists, size = $($file.Length) bytes"

# ---- 2. Current ACL ----
Write-Host ""
Write-Host "--- Current ACL on pwsh.exe ---"
icacls $target
Write-Host ""

# ---- 3. Authenticode signature ----
$signature = Get-AuthenticodeSignature $target
Write-Host "--- Signature ---"
Write-Host ("Status:    " + $signature.Status)
if ($signature.SignerCertificate) {
    Write-Host ("Signer:    " + $signature.SignerCertificate.Subject)
} else {
    Write-Host "Signer:    <none>"
}
Write-Host ""

if ($signature.Status -ne 'Valid') {
    Write-Host "[WARN] Signature is not Valid. SmartScreen / Defender may block this." -ForegroundColor Yellow
}

# ---- 4. AppLocker / WDAC event log (last hour) ----
Write-Host "--- AppLocker blocks (last 60 minutes) ---"
$appLocker = Get-WinEvent -LogName "Microsoft-Windows-AppLocker/EXE and DLL" `
                          -MaxEvents 10 -ErrorAction SilentlyContinue |
              Where-Object { $_.TimeCreated -gt (Get-Date).AddMinutes(-60) }
if ($appLocker) {
    $appLocker | ForEach-Object {
        Write-Host ("  " + $_.TimeCreated + " :: " + $_.Message.Substring(0, [Math]::Min(200, $_.Message.Length)))
    }
} else {
    Write-Host "  (none)"
}
Write-Host ""

# ---- 5. Apply targeted fixes ----
Write-Host "=== Applying fixes ===" -ForegroundColor Cyan
Write-Host ""

# Fix A: take ownership
Write-Host "[1/4] Taking ownership of C:\Program Files\PowerShell\7 ..."
$ownerOk = $false
try {
    & takeown.exe /F "C:\Program Files\PowerShell\7" /R /A 2>&1 | Out-Null
    $ownerOk = $true
    Write-Host "      OK" -ForegroundColor Green
} catch {
    Write-Host "      FAILED: $_" -ForegroundColor Red
}

# Fix B: reset inherited ACL on the directory
Write-Host "[2/4] Resetting inherited ACL on directory ..."
try {
    & icacls.exe "C:\Program Files\PowerShell\7" /reset /T /C 2>&1 | Out-Null
    Write-Host "      OK" -ForegroundColor Green
} catch {
    Write-Host "      FAILED: $_" -ForegroundColor Red
}

# Fix C: explicit grant to Everyone on the directory tree
Write-Host "[3/4] Granting Everyone:(OI)(CI)F on directory tree ..."
try {
    & icacls.exe "C:\Program Files\PowerShell\7" /grant "Everyone:(OI)(CI)F" /T 2>&1 | Out-Null
    Write-Host "      OK" -ForegroundColor Green
} catch {
    Write-Host "      FAILED: $_" -ForegroundColor Red
}

# Fix D: ensure SYSTEM and Administrators have full control too
Write-Host "[4/4] Granting SYSTEM and Administrators full control ..."
try {
    & icacls.exe "C:\Program Files\PowerShell\7" /grant "SYSTEM:(OI)(CI)F" /T 2>&1 | Out-Null
    & icacls.exe "C:\Program Files\PowerShell\7" /grant "Administrators:(OI)(CI)F" /T 2>&1 | Out-Null
    Write-Host "      OK" -ForegroundColor Green
} catch {
    Write-Host "      FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Re-checking ACL after fixes ===" -ForegroundColor Cyan
icacls $target
Write-Host ""

# ---- 6. Try the actual launch ----
Write-Host "=== Smoke test: spawn pwsh.exe ===" -ForegroundColor Cyan
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $target
$psi.Arguments = '-NoProfile -NonInteractive -Command "Write-Host SHELL_OK"'
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$p = [System.Diagnostics.Process]::Start($psi)
$p.WaitForExit(15000) | Out-Null
$out = $p.StandardOutput.ReadToEnd().Trim()
$err = $p.StandardError.ReadToEnd().Trim()
if ($p.ExitCode -eq 0 -and $out -eq 'SHELL_OK') {
    Write-Host "[SUCCESS] pwsh.exe launches and runs. The agent host should work now." -ForegroundColor Green
    Write-Host "          Go back to the agent and try the bash tool again."
    exit 0
} else {
    Write-Host "[STILL BROKEN] ExitCode=$($p.ExitCode)" -ForegroundColor Red
    if ($err) { Write-Host "stderr: $err" }
    if ($out) { Write-Host "stdout: $out" }
    Write-Host ""
    Write-Host "Most likely cause now: AppLocker / Windows Defender / SmartScreen is blocking." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option X: Reinstall PowerShell 7 (recommended)" -ForegroundColor Cyan
    Write-Host "    winget uninstall --id Microsoft.PowerShell"
    Write-Host "    winget install   --id Microsoft.PowerShell --source winget --force --accept-package-agreements --accept-source-agreements"
    Write-Host ""
    Write-Host "Option Y: Point the agent at Windows PowerShell 5.1 (built-in)" -ForegroundColor Cyan
    Write-Host "    1. Copy:  Copy-Item 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' 'C:\Program Files\PowerShell\7\pwsh.exe' -Force"
    Write-Host "    2. Test:  & 'C:\Program Files\PowerShell\7\pwsh.exe' -NoProfile -Command 'Write-Host OK'"
    Write-Host ""
    Write-Host "Option Z: Check Application event log for the real cause" -ForegroundColor Cyan
    Write-Host "    Get-WinEvent -LogName Application -MaxEvents 20 | Where-Object { `$_.LevelDisplayName -eq 'Error' } | Format-List"
    exit 1
}
