#requires -Version 7
<#
Phase 12 — Asset generation.
Generates all sprites for the Warlords II clone using the matrix web tools.
Run from the repo root:  pwsh scripts/gen-sprites.ps1

Prompts are kept short to avoid model confusion / 500s. The shared style
suffix is appended to every prompt.
#>

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$TempDir  = Join-Path $env:TEMP "warlords2-gen-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Concise style suffix. Single subject, transparent background, centered.
$StyleSuffix = ', painted fantasy illustration, transparent background, centered, single object, no text, no border, white background not allowed'

# Each entry: @{ id, prompt, relOut }
$Assets = [ordered]@{}

# === Terrain tiles =========================================================
$Assets['terrain.plains']    = @{ Prompt = "top-down 2D fantasy game map tile of green grassy plains, hand-painted texture, square tile" + $StyleSuffix; Out = 'public\assets\sprites\terrain\plains.png' }
$Assets['terrain.forest']    = @{ Prompt = "top-down 2D fantasy game map tile of dense dark green forest with tree canopies" + $StyleSuffix; Out = 'public\assets\sprites\terrain\forest.png' }
$Assets['terrain.hills']     = @{ Prompt = "top-down 2D fantasy game map tile of rolling tan and brown hills with grass tufts" + $StyleSuffix; Out = 'public\assets\sprites\terrain\hills.png' }
$Assets['terrain.mountains'] = @{ Prompt = "top-down 2D fantasy game map tile of jagged gray mountain peaks with snow caps" + $StyleSuffix; Out = 'public\assets\sprites\terrain\mountains.png' }
$Assets['terrain.water']     = @{ Prompt = "top-down 2D fantasy game map tile of calm blue ocean water with gentle ripples" + $StyleSuffix; Out = 'public\assets\sprites\terrain\water.png' }

# === Map features ==========================================================
$Assets['feature.mine']   = @{ Prompt = "small fantasy gold mine pit with a wooden entrance and a tiny mine cart" + $StyleSuffix; Out = 'public\assets\sprites\features\mine.png' }
$Assets['feature.ruin']   = @{ Prompt = "crumbling ancient stone ruins, broken columns and tumbled blocks, moss-covered" + $StyleSuffix; Out = 'public\assets\sprites\features\ruin.png' }
$Assets['feature.armory'] = @{ Prompt = "small wooden fantasy armory with thatched roof, crossed sword and shield above the door" + $StyleSuffix; Out = 'public\assets\sprites\features\armory.png' }

# === City art (per faction + neutral) ======================================
$Assets['city.humans']  = @{ Prompt = "isometric fantasy human castle with blue and gold banners, two round towers with conical roofs, central keep" + $StyleSuffix; Out = 'public\assets\sprites\cities\humans.png' }
$Assets['city.elves']   = @{ Prompt = "isometric fantasy elven forest city with silver spires and a living tree keep, green and silver banners" + $StyleSuffix; Out = 'public\assets\sprites\cities\elves.png' }
$Assets['city.orcs']    = @{ Prompt = "isometric fantasy orcish war fortress with jagged iron walls, skull-topped palisade, blood-red banners" + $StyleSuffix; Out = 'public\assets\sprites\cities\orcs.png' }
$Assets['city.undead']  = @{ Prompt = "isometric fantasy necropolis keep of the undead, black stone, ghostly green flames, tattered purple banners" + $StyleSuffix; Out = 'public\assets\sprites\cities\undead.png' }
$Assets['city.neutral'] = @{ Prompt = "isometric fantasy neutral city, simple square stone keep with plain tan banners, two round towers" + $StyleSuffix; Out = 'public\assets\sprites\cities\neutral.png' }

# === Unit sprites: 7 unit kinds x 4 factions = 28 ==========================
$UnitKinds = @(
  @{ id='militia';   label='militia levy soldier in chain shirt with simple spear and round shield'; }
  @{ id='spearman';  label='veteran spearman in chainmail with long pike and kite shield'; }
  @{ id='archer';    label='bowman with longbow and quiver of arrows, leather armor'; }
  @{ id='knight';    label='heavy mounted knight in full plate armor, warhorse with barding, lance'; }
  @{ id='cavalry';   label='light cavalry scout on a fast horse, javelin in hand'; }
  @{ id='wizard';    label='battle mage in flowing robes, staff crackling with arcane energy'; }
  @{ id='giant';     label='towering troll giant with massive club and crude bone armor'; }
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
      Prompt = "single fantasy $($u.label) of the $fk faction, wearing $f, facing slightly right" + $StyleSuffix
      Out    = "public\assets\sprites\units\$fk\$($u.id).png"
    }
  }
}

# === Hero portraits (4) ====================================================
$Assets['hero.humans'] = @{ Prompt = "human hero commander portrait, grizzled warrior with steel breastplate and a flowing blue cloak, golden laurel, upper body" + $StyleSuffix; Out = 'public\assets\sprites\heroes\humans.png' }
$Assets['hero.elves']  = @{ Prompt = "elven hero ranger portrait, ageless face with sharp features, green and silver circlet, leather armor, head and shoulders" + $StyleSuffix; Out = 'public\assets\sprites\heroes\elves.png' }
$Assets['hero.orcs']   = @{ Prompt = "orcish warchief hero portrait, scarred snarling face, bone piercings, black plate armor with blood-red war paint, prominent tusks" + $StyleSuffix; Out = 'public\assets\sprites\heroes\orcs.png' }
$Assets['hero.undead'] = @{ Prompt = "lich-lord undead hero portrait, gaunt skull face with glowing violet eye sockets, tattered purple robes and rusted iron crown" + $StyleSuffix; Out = 'public\assets\sprites\heroes\undead.png' }

# === UI chrome (4) =========================================================
$Assets['ui.cursor']         = @{ Prompt = "glowing golden crosshair cursor icon, four-pronged targeting reticle, sharp metal tip" + $StyleSuffix; Out = 'public\assets\sprites\ui\cursor.png' }
$Assets['ui.selection']      = @{ Prompt = "glowing green selection corner brackets, four L-shaped corner pieces framing an empty box" + $StyleSuffix; Out = 'public\assets\sprites\ui\selection.png' }
$Assets['ui.move-highlight'] = @{ Prompt = "semi-transparent blue square tile with a soft blue arrow, fantasy game UI overlay" + $StyleSuffix; Out = 'public\assets\sprites\ui\move-highlight.png' }
$Assets['ui.attack-highlight']= @{ Prompt = "semi-transparent red square tile with crossed swords symbol, fantasy game UI overlay" + $StyleSuffix; Out = 'public\assets\sprites\ui\attack-highlight.png' }

Write-Host "=== Asset manifest: $($Assets.Count) entries ==="

# === Helpers ===============================================================
function Get-DownloadUrl {
  param([string]$NodeId)
  $attempts = 0
  while ($attempts -lt 3) {
    $attempts++
    $raw = & mcode-tools get-asset-url $NodeId 2>&1
    $rawText = ($raw | Out-String).Trim()
    if ($rawText.StartsWith('error:')) {
      Write-Warning "get-asset-url attempt ${attempts} transient error: $rawText"
      Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 2)
      continue
    }
    $obj = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($obj.download_url) { return $obj.download_url }
    Write-Warning "get-asset-url attempt ${attempts} parse failed: $rawText"
    Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 2)
  }
  throw "No download_url for node $NodeId after ${attempts} attempts"
}

function Save-Asset {
  param([string]$Url, [string]$TargetPath)
  $dir = Split-Path -Parent $TargetPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Invoke-WebRequest -Uri $Url -OutFile $TargetPath -UseBasicParsing | Out-Null
  if (-not (Test-Path $TargetPath)) { throw "Download failed: $TargetPath" }
}

function Invoke-GenBatch {
  param([string[]]$Ids)
  $reqs = @()
  foreach ($id in $Ids) {
    $a = $Assets[$id]
    $reqs += @{ prompt = $a.Prompt; aspect_ratio = '1:1'; output_file = ($id -replace '\.','_') + '.png' }
  }
  $body = @{ requests = $reqs } | ConvertTo-Json -Depth 5
  $argsFile = Join-Path $TempDir "batch_$([guid]::NewGuid().Guid).json"
  Set-Content -Path $argsFile -Value $body -Encoding UTF8

  $obj = $null
  $results = $null
  $attempts = 0
  while ($attempts -lt 4 -and (-not $results -or $results.Count -lt $Ids.Count)) {
    $attempts++
    $raw = & mcode-tools connector call connector__matrix__generate_image --args-file $argsFile 2>&1
    $rawText = ($raw | Out-String).Trim()
    if ($rawText.StartsWith('error:')) {
      Write-Warning "Batch attempt ${attempts} transient error: $rawText"
      Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 3)
      continue
    }
    $obj = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $obj) {
      Write-Warning "Batch attempt ${attempts} JSON parse failed: $rawText"
      Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 3)
      continue
    }
    if ($obj.code -ne 0) { throw "generate_image returned non-zero code: $($obj | ConvertTo-Json -Compress)" }
    $results = $obj.results
    if (-not $results -or $results.Count -lt $Ids.Count) {
      Write-Warning "Batch attempt ${attempts}: only got $($results.Count)/$($Ids.Count) results, retrying..."
      Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 3)
    }
  }
  if (-not $results) { throw "generate_image failed after ${attempts} attempts" }
  for ($i = 0; $i -lt $results.Count; $i++) {
    $id  = $Ids[$i]
    $item = $results[$i]
    if ($item.success -ne $true) { Write-Warning "Asset '$id' generation failed: $($item | ConvertTo-Json -Compress)"; continue }
    $a   = $Assets[$id]
    $url = Get-DownloadUrl -NodeId $item.node_id
    $target = Join-Path $RepoRoot $a.Out
    Save-Asset -Url $url -TargetPath $target
    Write-Host ("  OK  {0,-28} -> {1}" -f $id, $a.Out) -ForegroundColor Green
  }
}

# === Main ==================================================================
$allIds = @($Assets.Keys)
$batchSize = 2
$totalBatches = [Math]::Ceiling($allIds.Count / $batchSize)
Write-Host "=== Generating $($allIds.Count) assets in $totalBatches batches ==="
$sw = [System.Diagnostics.Stopwatch]::StartNew()
for ($b = 0; $b -lt $totalBatches; $b++) {
  $start = $b * $batchSize
  $count = [Math]::Min($batchSize, $allIds.Count - $start)
  $batch = $allIds[$start..($start + $count - 1)]
  Write-Host "--- Batch $($b+1)/$totalBatches : $($batch -join ', ') ---"
  try { Invoke-GenBatch -Ids $batch } catch { Write-Warning "Batch $($b+1) error: $_" }
  # Cool-down between batches to avoid rate limits
  if ($b -lt $totalBatches - 1) { Start-Sleep -Seconds 5 }
}
$sw.Stop()
Write-Host "=== Done in $($sw.Elapsed.TotalSeconds.ToString('0.0'))s ==="
