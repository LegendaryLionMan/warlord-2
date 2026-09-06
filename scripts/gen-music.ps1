#requires -Version 7
<#
Phase 12 — Music + SFX generation.
Generates original music in a 1990s fantasy-strategy-game style.
Run from the repo root:  pwsh scripts/gen-music.ps1
#>

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$TempDir  = Join-Path $env:TEMP "warlords2-music-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Each entry: @{ id, prompt, format, out }
$Tracks = [ordered]@{}

# === Music (background, full tracks) =======================================
$Tracks['music.menu']           = @{ Prompt = "Epic cinematic orchestral opening theme, sweeping strings, heroic brass fanfare, fantasy strategy game main menu soundtrack, grand reverent and inviting, 1990s CD-audio orchestral style, no vocals"; Out = 'public\assets\audio\music\menu.mp3' }
$Tracks['music.faction-select'] = @{ Prompt = "Mystical fantasy faction select theme, ethereal female choir singing softly, crystalline harp arpeggios, magical ceremony, ceremonial and ancient, 1990s fantasy RPG soundtrack, no percussion"; Out = 'public\assets\audio\music\faction-select.mp3' }
$Tracks['music.gameplay']       = @{ Prompt = "Calm medieval fantasy exploration music, soft wooden flute and lute duet, gentle pastoral, peaceful wandering through countryside, 1990s fantasy strategy game ambient, slow and warm"; Out = 'public\assets\audio\music\gameplay.mp3' }
$Tracks['music.combat']         = @{ Prompt = "Intense fantasy battle music, war drums and pounding timpani, charging brass, clashing cymbals, urgent heroic energy, 1990s fantasy strategy combat theme, fast and aggressive"; Out = 'public\assets\audio\music\combat.mp3' }
$Tracks['music.victory']        = @{ Prompt = "Triumphant short victory fanfare, bright brass and soaring strings, celebratory and uplifting, fantasy strategy game win theme, classic 1990s CD-audio orchestral sting"; Out = 'public\assets\audio\music\victory.mp3' }
$Tracks['music.defeat']         = @{ Prompt = "Somber defeat theme, low mournful strings, slow heavy brass, sad and resigned, fantasy strategy game lose theme, 1990s CD-audio orchestral sting"; Out = 'public\assets\audio\music\defeat.mp3' }
$Tracks['music.ambient-pad']    = @{ Prompt = "Ambient fantasy strategy game background, soft synthesizer pad, distant bells, mysterious and atmospheric, looping friendly background, 1990s fantasy RPG ambient music"; Out = 'public\assets\audio\music\ambient-pad.mp3' }

# === SFX (short stings) ====================================================
$Tracks['sfx.sword']       = @{ Prompt = "Short sword clashing metallic ring sound effect, single sword strike, fantasy combat SFX, no music no melody just a brief metallic hit"; Out = 'public\assets\audio\sfx\sword.mp3' }
$Tracks['sfx.arrow']       = @{ Prompt = "Short arrow whoosh twang sound effect, single arrow fired through air, fantasy combat SFX, no music no melody just a brief wooden twang"; Out = 'public\assets\audio\sfx\arrow.mp3' }
$Tracks['sfx.magic']       = @{ Prompt = "Short magical zap sound effect, electric crackle, arcane spell cast, fantasy SFX, no music no melody just a brief magical burst"; Out = 'public\assets\audio\sfx\magic.mp3' }
$Tracks['sfx.move']        = @{ Prompt = "Short footstep on dirt ground sound effect, single boot step, medieval soldier walking, fantasy SFX, no music no melody just a brief footfall"; Out = 'public\assets\audio\sfx\move.mp3' }
$Tracks['sfx.recruit']     = @{ Prompt = "Short blacksmith hammer on anvil sound effect, single ringing strike, fantasy SFX, no music no melody just a brief metalwork clang"; Out = 'public\assets\audio\sfx\recruit.mp3' }
$Tracks['sfx.city-capture']= @{ Prompt = "Short triumphant banner unfurl sound effect, flag flapping and a brass bell toll, fantasy SFX, no music no melody just a brief capture moment"; Out = 'public\assets\audio\sfx\city-capture.mp3' }
$Tracks['sfx.victory-sting']= @{ Prompt = "Short triumphant brass sting fanfare, two second fantasy victory chime, 1990s CD-audio sting, no vocals"; Out = 'public\assets\audio\sfx\victory-sting.mp3' }
$Tracks['sfx.defeat-sting']= @{ Prompt = "Short somber brass sting, two second fantasy defeat horn, 1990s CD-audio sting, no vocals"; Out = 'public\assets\audio\sfx\defeat-sting.mp3' }
$Tracks['sfx.click']       = @{ Prompt = "Short wooden UI click sound effect, single soft button tap, fantasy game UI SFX, no music no melody just a brief tick"; Out = 'public\assets\audio\sfx\click.mp3' }
$Tracks['sfx.error']       = @{ Prompt = "Short wooden thunk error sound effect, low dull thud, fantasy game UI negative feedback, no music no melody just a brief buzz"; Out = 'public\assets\audio\sfx\error.mp3' }

Write-Host "=== Track manifest: $($Tracks.Count) entries ==="

# === Helpers ===============================================================
function Get-DownloadUrl { param([string]$NodeId)
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
function Save-Asset { param([string]$Url, [string]$TargetPath)
  $dir = Split-Path -Parent $TargetPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Invoke-WebRequest -Uri $Url -OutFile $TargetPath -UseBasicParsing | Out-Null
  if (-not (Test-Path $TargetPath)) { throw "Download failed: $TargetPath" }
}
function Invoke-GenBatch { param([string[]]$Ids)
  $reqs = @()
  foreach ($id in $Ids) {
    $t = $Tracks[$id]
    $reqs += @{
      prompt = $t.Prompt
      format = 'mp3'
      bitrate = 128000
      sample_rate = 44100
      output_file = ($id -replace '\.','_') + '.mp3'
    }
  }
  $body = @{ requests = $reqs } | ConvertTo-Json -Depth 5
  $argsFile = Join-Path $TempDir "mbatch_$([guid]::NewGuid().Guid).json"
  Set-Content -Path $argsFile -Value $body -Encoding UTF8

  $obj = $null
  $results = $null
  $attempts = 0
  while ($attempts -lt 4 -and (-not $results -or $results.Count -lt $Ids.Count)) {
    $attempts++
    $raw = & mcode-tools connector call connector__matrix__batch_text_to_music --args-file $argsFile 2>&1
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
    if ($obj.code -ne 0) { throw "batch_text_to_music returned non-zero code: $($obj | ConvertTo-Json -Compress)" }
    $results = $obj.results
    if (-not $results -or $results.Count -lt $Ids.Count) {
      Write-Warning "Batch attempt ${attempts}: only got $($results.Count)/$($Ids.Count) results, retrying..."
      Start-Sleep -Seconds ([Math]::Pow(2, $attempts) * 3)
    }
  }
  if (-not $results) { throw "batch_text_to_music failed after ${attempts} attempts" }
  for ($i = 0; $i -lt $results.Count; $i++) {
    $id = $Ids[$i]
    $item = $results[$i]
    if ($item.success -ne $true) { Write-Warning "Track '$id' generation failed: $($item | ConvertTo-Json -Compress)"; continue }
    $t = $Tracks[$id]
    $url = Get-DownloadUrl -NodeId $item.node_id
    $target = Join-Path $RepoRoot $t.Out
    Save-Asset -Url $url -TargetPath $target
    Write-Host ("  OK  {0,-28} -> {1}" -f $id, $t.Out) -ForegroundColor Green
  }
}

# === Main ==================================================================
$allIds = @($Tracks.Keys)
$batchSize = 5
$totalBatches = [Math]::Ceiling($allIds.Count / $batchSize)
Write-Host "=== Generating $($allIds.Count) tracks in $totalBatches batches ==="
$sw = [System.Diagnostics.Stopwatch]::StartNew()
for ($b = 0; $b -lt $totalBatches; $b++) {
  $start = $b * $batchSize
  $count = [Math]::Min($batchSize, $allIds.Count - $start)
  $batch = $allIds[$start..($start + $count - 1)]
  Write-Host "--- Batch $($b+1)/$totalBatches : $($batch -join ', ') ---"
  try { Invoke-GenBatch -Ids $batch } catch { Write-Warning "Batch $($b+1) error: $_" }
}
$sw.Stop()
Write-Host "=== Done in $($sw.Elapsed.TotalSeconds.ToString('0.0'))s ==="
