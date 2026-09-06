# ============================================================
#  fix-pwsh-elevation.ps1
#  Remove "run as administrator" shim / compatibility flag
#  that is forcing every pwsh.exe spawn to require elevation.
# ============================================================

$ErrorActionPreference = 'Continue'
$target = "C:\Program Files\PowerShell\7\pwsh.exe"

Write-Host "=== Clearing AppCompat 'run as admin' flag on pwsh.exe ===" -ForegroundColor Cyan

# 1. User-level AppCompat database
$paths = @(
    "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
    "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
    "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Compatibility Assistant\Store",
    "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Compatibility Assistant\Store"
)

$cleared = $false
foreach ($p in $paths) {
    if (Test-Path $p) {
        $val = Get-ItemProperty -Path $p -Name $target -ErrorAction SilentlyContinue
        if ($val) {
            Write-Host "  Found flag at: $p"
            Write-Host "  Value: $($val.$target)"
            Remove-ItemProperty -Path $p -Name $target -ErrorAction SilentlyContinue
            Write-Host "  Cleared." -ForegroundColor Green
            $cleared = $true
        }
    }
}
if (-not $cleared) {
    Write-Host "  No AppCompat flag found for pwsh.exe (may be manifest instead)." -ForegroundColor Yellow
}

# 2. Unblock MotW if present
Write-Host ""
Write-Host "=== Removing Mark-of-the-Web ===" -ForegroundColor Cyan
try {
    Unblock-File -Path $target -ErrorAction Stop
    Write-Host "  Unblocked." -ForegroundColor Green
} catch {
    Write-Host "  Was not blocked (or not present): $($_.Exception.Message)"
}

# 3. Test the spawn from THIS context (NOT elevated) — the agent's exact context
Write-Host ""
Write-Host "=== Spawn test (no elevation) ===" -ForegroundColor Cyan
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $target
$psi.Arguments = '-NoProfile -NonInteractive -Command "Write-Host SHELL_OK; exit 0"'
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
try {
    $p = [System.Diagnostics.Process]::Start($psi)
    $p.WaitForExit(10000) | Out-Null
    $out = $p.StandardOutput.ReadToEnd().Trim()
    $err = $p.StandardError.ReadToEnd().Trim()
    if ($p.ExitCode -eq 0 -and $out -eq 'SHELL_OK') {
        Write-Host "[SUCCESS] pwsh.exe spawned without elevation. The agent should work now." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[STILL BROKEN] exit=$($p.ExitCode) out='$out' err='$err'" -ForegroundColor Red
    }
} catch {
    Write-Host "[STILL BROKEN] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.NativeErrorCode) {
        Write-Host "Win32 error code: $($_.Exception.NativeErrorCode)"
    }
}

# 4. Fallback: just replace pwsh.exe with the built-in Windows PowerShell 5.1
Write-Host ""
Write-Host "=== Fallback: replace pwsh.exe with Windows PowerShell 5.1 ===" -ForegroundColor Cyan
$ps51 = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
if (Test-Path $ps51) {
    try {
        # Back up the real pwsh.exe first
        $backup = "$target.broken"
        if (-not (Test-Path $backup)) {
            Move-Item $target $backup -Force
            Write-Host "  Backed up broken pwsh.exe to: $backup"
        }
        Copy-Item $ps51 $target -Force
        Write-Host "  Replaced pwsh.exe with Windows PowerShell 5.1." -ForegroundColor Green

        # Re-test
        $psi2 = New-Object System.Diagnostics.ProcessStartInfo
        $psi2.FileName = $target
        $psi2.Arguments = '-NoProfile -NonInteractive -Command "Write-Host SHELL_OK"'
        $psi2.UseShellExecute = $false
        $psi2.CreateNoWindow = $true
        $psi2.RedirectStandardOutput = $true
        $psi2.RedirectStandardError  = $true
        $p = [System.Diagnostics.Process]::Start($psi2)
        $p.WaitForExit(10000) | Out-Null
        if ($p.ExitCode -eq 0) {
            Write-Host "[SUCCESS] Replacement works. The agent should work now." -ForegroundColor Green
            Write-Host "  Note: this is PowerShell 5.1, not 7. If anything assumes PS7-only syntax it may break." -ForegroundColor Yellow
            exit 0
        }
    } catch {
        Write-Host "  Fallback failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  Windows PowerShell 5.1 not found at $ps51"
}

# 5. Last resort: reinstall
Write-Host ""
Write-Host "=== If both above failed, reinstall PowerShell 7 ===" -ForegroundColor Cyan
Write-Host "    winget uninstall --id Microsoft.PowerShell"
Write-Host "    winget install   --id Microsoft.PowerShell --source winget --force --accept-package-agreements --accept-source-agreements"

exit 1
