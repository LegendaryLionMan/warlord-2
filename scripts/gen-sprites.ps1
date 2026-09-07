#requires -Version 7
<#
Phase 12 — Asset generation (single-item, robust).
Generates sprites one at a time with long backoff for resilience
to matrix API rate limits. Idempotent: skips already-generated files.

Run from the repo root:  pwsh scripts/gen-sprites.ps1
#>

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$TempDir  = Join-Path $env:TEMP "warlords2-gen-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

$StyleSuffix = ', painted fantasy illustration, transparent background, centered, single object, no text, no border'

$Assets = [ordered]@{}

# === Terrain tiles =========================================================
$Assets['terrain.plains']    = @{ Prompt = "top-down 2D fantasy game map tile of green grass plains, painted$StyleSuffix"; Out = 'public\assets\sprites\terrain\plains.png' }
$Assets['terrain.forest']    = @{ Prompt = "top-down 2D fantasy game map tile of dense dark green forest with tree canopies$StyleSuffix"; Out = 'public\assets\sprites\terrain\forest.png' }
$Assets['terrain.hills']     = @{ Prompt = "top-down 2D fantasy game map tile of rolling tan and brown hills$StyleSuffix"; Out = 'public\assets\sprites\terrain\hills.png' }
$Assets['terrain.mountains'] = @{ Prompt = "top-down 2D fantasy game map tile of jagged gray mountain peaks with snow caps$StyleSuffix"; Out = 'public\assets\sprites\terrain\mountains.png' }
$Assets['terrain.water']     = @{ Prompt = "top-down 2D fantasy game map tile of calm blue ocean water with ripples$StyleSuffix"; Out = 'public\assets\sprites\terrain\water.png' }

# === Map features ==========================================================
$Assets['feature.mine']   = @{ Prompt = "small fantasy gold mine pit with wooden entrance and mine cart$StyleSuffix"; Out = 'public\assets\sprites\features\mine.png' }
$Assets['feature.ruin']   = @{ Prompt = "crumbling ancient stone ruins with broken columns and moss$StyleSuffix"; Out = 'public\assets\sprites\features\ruin.png' }
$Assets['feature.armory'] = @{ Prompt = "small wooden fantasy armory with thatched roof, crossed sword and shield$StyleSuffix"; Out = 'public\assets\sprites\features\armory.png' }

# === City art ==============================================================
$Assets['city.humans']  = @{ Prompt = "isometric fantasy human castle with blue and gold banners, two round towers$StyleSuffix"; Out = 'public\assets\sprites\cities\humans.png' }
$Assets['city.elves']   = @{ Prompt = "isometric fantasy elven forest city with silver spires and a living tree keep$StyleSuffix"; Out = 'public\assets\sprites\cities\elves.png' }
$Assets['city.orcs']    = @{ Prompt = "isometric fantasy orcish war fortress with jagged iron walls, skull-topped palisade$StyleSuffix"; Out = 'public\assets\sprites\cities\orcs.png' }
$Assets['city.undead']  = @{ Prompt = "isometric fantasy undead necropolis keep with ghostly green flames, tattered purple banners$StyleSuffix"; Out = 'public\assets\sprites\cities\undead.png' }
$Assets['city.neutral'] = @{ Prompt = "isometric fantasy neutral city, simple square stone keep with plain tan banners$StyleSuffix"; Out = 'public\assets\sprites\cities\neutral.png' }

# === Unit sprites ==========================================================
$UnitKinds = @(
  @{ id='militia';   label='militia levy soldier in chain shirt with simple spear and round shield' }
  @{ id='spearman';  label='veteran spearman in chainmail with long pike and kite shield' }
  @{ id='archer';    label='bowman with longbow and quiver of arrows, leather armor' }
  @{ id='knight';    label='heavy mounted knight in full plate armor, warhorse, lance' }
  @{ id='cavalry';   label='light cavalry scout on a fast horse, javelin' }
  @{ id='wizard';    label='battle mage in flowing robes, staff crackling with energy' }
  @{ id='giant';     label='towering troll giant with massive club and bone armor' }
)
$Factions = @{
  humans = 'blue and gold livery, steel weapons'
  elves  = 'green and silver livery, silver weapons'
  orcs   = 'crimson red and black livery, rusted iron weapons'
  undead = 'dark purple and bone-white livery, dark steel weapons'
}
foreach ($fk in $Factions.Keys) {
  $f = $Factions[$fk]
  foreach ($u in $UnitKinds) {
    $id = "unit.$($u.id).$fk"
    $Assets[$id] = @{
      Prompt = "single fantasy $($u.label) of the $fk faction, wearing $f, facing slightly right$StyleSuffix"
      Out    = "public\assets\sprites\units\$fk\$($u.id).png"
    }
  }
}

# === Hero portraits =======================================================
$Assets['hero.humans'] = @{ Prompt = "human hero commander portrait, grizzled warrior with steel breastplate and blue cloak, golden laurel$StyleSuffix"; Out = 'public\assets\sprites\heroes\humans.png' }
$Assets['hero.elves']  = @{ Prompt = "elven hero ranger portrait, ageless sharp features, green and silver circlet, leather armor$StyleSuffix"; Out = 'public\assets\sprites\heroes\elves.png' }
$Assets['hero.orcs']   = @{ Prompt = "orcish warchief hero portrait, scarred snarling face, bone piercings, black plate armor$StyleSuffix"; Out = 'public\assets\sprites\heroes\orcs.png' }
$Assets['hero.undead'] = @{ Prompt = "lich-lord undead hero portrait, gaunt skull face with glowing violet eyes, tattered purple robes$StyleSuffix"; Out = 'public\assets\sprites\heroes\undead.png' }

# === UI chrome ============================================================
$Assets['ui.cursor']         = @{ Prompt = "glowing golden crosshair cursor icon, four-pronged targeting reticle$StyleSuffix"; Out = 'public\assets\sprites\ui\cursor.png' }
$Assets['ui.selection']      = @{ Prompt = "glowing green selection corner brackets, four L-shaped pieces$StyleSuffix"; Out = 'public\assets\sprites\ui\selection.png' }
$Assets['ui.move-highlight'] = @{ Prompt = "semi-transparent blue square tile with a soft blue arrow$StyleSuffix"; Out = 'public\assets\sprites\ui\move-highlight.png' }
$Assets['ui.attack-highlight']= @{ Prompt = "semi-transparent red square tile with crossed swords symbol$StyleSuffix"; Out = 'public\assets\sprites\ui\attack-highlight.png' }

Write-Host "=== Asset manifest: $($Assets.Count) entries ==="

# === Helpers ==============================================================
function Get-DownloadUrl {
  param([string]$NodeId)
  $attempts = 0
  while ($attempts -lt 3) {
    $attempts++
    $raw = & mcode-tools get-asset-url $NodeId 2>&1
    $rawText = ($raw | Out-String).Trim()
    if ($rawText.StartsWith('error:')) {
      Write-Warning "get-asset-url attempt ${attempts} transient error: $rawText"
      Start-Sleep -Seconds 3
      continue
    }
    $obj = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($obj.download_url) { return $obj.download_url }
    Start-Sleep -Seconds 3
  }
  return $null
}

function Save-Asset {
  param([string]$Url, [string]$TargetPath)
  $dir = Split-Path -Parent $TargetPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  try {
    Invoke-WebRequest -Uri $Url -OutFile $TargetPath -UseBasicParsing | Out-Null
  } catch {
    Write-Warning "Download failed: $_"
    return $false
  }
  return (Test-Path $TargetPath)
}

function Generate-One {
  param([string]$Id, [hashtable]$Asset, [int]$MaxAttempts = 6)

  # Skip if file already exists
  $target = Join-Path $RepoRoot $Asset.Out
  if (Test-Path $target) {
    Write-Host "  -- $Id  (cached)" -ForegroundColor DarkGray
    return $true
  }

  $reqs = @(@{
    prompt = $Asset.Prompt
    aspect_ratio = '1:1'
    output_file = ($Id -replace '\.','_') + '.png'
  })
  $body = @{ requests = $reqs } | ConvertTo-Json -Depth 5
  $argsFile = Join-Path $TempDir "req_$([guid]::NewGuid().Guid).json"
  Set-Content -Path $argsFile -Value $body -Encoding UTF8

  $attempts = 0
  $consecutiveNetErrors = 0
  while ($attempts -lt $MaxAttempts) {
    $attempts++
    $raw = & mcode-tools connector call connector__matrix__generate_image --args-file $argsFile 2>&1
    $rawText = ($raw | Out-String).Trim()
    if ($rawText.StartsWith('error:')) {
      $consecutiveNetErrors++
      Write-Warning "[$Id] attempt ${attempts} network error: $rawText"
      $sleep = [Math]::Min(30, [Math]::Pow(2, $attempts) * 3)
      Start-Sleep -Seconds $sleep
      continue
    }
    $obj = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $obj) {
      $consecutiveNetErrors++
      Write-Warning "[$Id] attempt ${attempts} parse failed"
      Start-Sleep -Seconds 5
      continue
    }
    if ($obj.code -ne 0) {
      Write-Warning "[$Id] attempt ${attempts} code=$($obj.code): $($obj.message)"
      Start-Sleep -Seconds 5
      continue
    }
    $results = $obj.results
    if (-not $results -or $results.Count -lt 1 -or $results[0].success -ne $true) {
      Write-Warning "[$Id] attempt ${attempts} 0 results"
      Start-Sleep -Seconds 5
      continue
    }
    # Success — download
    $url = Get-DownloadUrl -NodeId $results[0].node_id
    if (-not $url) {
      Write-Warning "[$Id] attempt ${attempts} download URL failed"
      continue
    }
    if (Save-Asset -Url $url -TargetPath $target) {
      Write-Host ("  OK  {0,-28}" -f $Id) -ForegroundColor Green
      return $true
    }
  }
  Write-Warning "FAILED to generate $Id after $attempts attempts — continuing"
  return $false
}

# === Main ==================================================================
$allIds = @($Assets.Keys)
Write-Host "=== Generating $($allIds.Count) assets (serial, 1 per call, 8s cooldown) ==="
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$okCount = 0
$failCount = 0
$consecutiveFailures = 0
for ($i = 0; $i -lt $allIds.Count; $i++) {
  $id = $allIds[$i]
  Write-Host ("[{0,2}/{1,2}] {2}" -f ($i+1), $allIds.Count, $id)
  $ok = Generate-One -Id $id -Asset $Assets[$id] -MaxAttempts 8
  if ($ok) {
    $okCount++
    $consecutiveFailures = 0
  } else {
    $failCount++
    $consecutiveFailures++
  }
  if ($consecutiveFailures -ge 3) {
    Write-Warning "3 consecutive failures — sleeping 120s for API cooldown"
    Start-Sleep -Seconds 120
    $consecutiveFailures = 0
  } elseif ($i -lt $allIds.Count - 1) {
    Start-Sleep -Seconds $(if ($ok) { 10 } else { 30 })
  }
}
$sw.Stop()
Write-Host "=== Done: $okCount ok, $failCount failed, $($sw.Elapsed.TotalSeconds.ToString('0.0'))s ==="
