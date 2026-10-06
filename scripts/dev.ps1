$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "local-common.psm1") -Force -DisableNameChecking
$Root = Split-Path -Parent $PSScriptRoot

Require-Command go
Require-Command node
Require-Command npm.cmd

Start-Postgres
Wait-Postgres
Ensure-ApiEnv
Ensure-WebDeps

$apiPath = Join-Path $Root "repos\api"
$webPath = Join-Path $Root "repos\web"
$lanIP = Get-LocalLanIP
$webUrl = "http://${lanIP}:3000"
$apiUrl = "http://${lanIP}:8080"
$apiJob = $null
$webJob = $null
$webProcessId = $null
$webStartedByScript = $false

function Test-WebReady {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Get-WebProcessId {
  $listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($listener) { return $listener.OwningProcess }
  return $null
}

if (Test-ApiReady) {
  Write-Host "API ya estaba corriendo en http://localhost:8080; la reutilizo." -ForegroundColor Green
} else {
  Write-Step "Iniciando backend Go"
  $apiJob = Start-Job -Name "mesa-click-api" -ScriptBlock {
    param($Path, $WebUrl)
    Set-Location $Path
    $env:APP_URL = $WebUrl
    go run .
  } -ArgumentList $apiPath, $webUrl
}

try {
  Wait-Api 90
  & (Join-Path $PSScriptRoot "seed-local.ps1")

  if (Test-WebReady) {
    Write-Host "Frontend ya estaba corriendo en http://localhost:3000; lo reutilizo." -ForegroundColor Green
    $webProcessId = Get-WebProcessId
  } else {
    Write-Step "Iniciando frontend Next.js"
    $webStartedByScript = $true
    $webJob = Start-Job -Name "mesa-click-web" -ScriptBlock {
      param($Path, $ApiUrl, $WebUrl)
      Set-Location $Path
      $env:NEXT_PUBLIC_API_URL = $ApiUrl
      $env:NEXT_PUBLIC_APP_URL = $WebUrl
      npm.cmd run dev -- --hostname 0.0.0.0
    } -ArgumentList $webPath, $apiUrl, $webUrl

    Write-Step "Esperando frontend en http://localhost:3000"
    for ($i = 0; $i -lt 60; $i++) {
      Receive-Job $webJob -ErrorAction SilentlyContinue
      if (Test-WebReady) {
        $webProcessId = Get-WebProcessId
        Write-Host "Frontend listo." -ForegroundColor Green
        break
      }
      if ($webJob.State -eq "Failed") {
        Receive-Job $webJob -Keep -ErrorAction SilentlyContinue
        throw "El frontend no pudo iniciarse. Revisá el detalle mostrado arriba."
      }
      Start-Sleep -Seconds 1
    }

    if (-not (Test-WebReady)) {
      Receive-Job $webJob -Keep -ErrorAction SilentlyContinue
      throw "El frontend no respondió a tiempo en http://localhost:3000."
    }
  }

  Write-Host "" 
  Write-Host "Mesa Click local está levantando." -ForegroundColor Green
  Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Yellow
  Write-Host "Celular:   $webUrl" -ForegroundColor Yellow
  Write-Host "Dashboard: http://localhost:3000/dashboard" -ForegroundColor Yellow
  Write-Host "Login:     admin@mesaclick.local" -ForegroundColor Yellow
  Write-Host "Clave:     MesaClick2026" -ForegroundColor Yellow
  Write-Host "Mesa demo: $webUrl/mesa/mesa-demo-1" -ForegroundColor Yellow
  Write-Host "" 
  Write-Host "Dejá esta terminal abierta. Para cortar, presioná Ctrl+C." -ForegroundColor Cyan
  Write-Host "" 

  $webFailures = 0
  while ($true) {
    if ($apiJob) {
      Receive-Job $apiJob -ErrorAction SilentlyContinue
    }
    if ($webJob) {
      Receive-Job $webJob -ErrorAction SilentlyContinue
    }

    if ($apiJob -and $apiJob.State -in @("Failed", "Stopped", "Completed")) {
      throw "El backend se detuvo. Ejecutá 'Receive-Job mesa-click-api -Keep' si necesitás revisar el detalle en esta sesión."
    }
    if (-not $apiJob -and -not (Test-ApiReady)) {
      throw "La API que ya estaba corriendo dejó de responder."
    }
    if (Test-WebReady) {
      $webFailures = 0
    } else {
      $webFailures++
      if ($webFailures -ge 5) {
        throw "El frontend dejó de responder en http://localhost:3000."
      }
    }

    Start-Sleep -Seconds 1
  }
} finally {
  Write-Host "Deteniendo procesos locales..." -ForegroundColor Cyan
  if ($webStartedByScript -and $webProcessId) {
    Stop-Process -Id $webProcessId -Force -ErrorAction SilentlyContinue
  }
  if ($webJob) {
    Stop-Job $webJob -ErrorAction SilentlyContinue
    Remove-Job $webJob -Force -ErrorAction SilentlyContinue
  }
  if ($apiJob) {
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -Force -ErrorAction SilentlyContinue
  }
}

