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

  Write-Step "Iniciando frontend Next.js"
  $webJob = Start-Job -Name "mesa-click-web" -ScriptBlock {
    param($Path, $ApiUrl, $WebUrl)
    Set-Location $Path
    $env:NEXT_PUBLIC_API_URL = $ApiUrl
    $env:NEXT_PUBLIC_APP_URL = $WebUrl
    npm.cmd run dev -- --hostname 0.0.0.0
  } -ArgumentList $webPath, $apiUrl, $webUrl

  Write-Host "" 
  Write-Host "Mesa Click local está levantando." -ForegroundColor Green
  Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Yellow
  Write-Host "Celular:   $webUrl" -ForegroundColor Yellow
  Write-Host "Dashboard: http://localhost:3000/dashboard" -ForegroundColor Yellow
  Write-Host "Login:     admin@mesaclick.local" -ForegroundColor Yellow
  Write-Host "Mesa demo: $webUrl/mesa/mesa-demo-1" -ForegroundColor Yellow
  Write-Host "" 
  Write-Host "Dejá esta terminal abierta. Para cortar, presioná Ctrl+C." -ForegroundColor Cyan
  Write-Host "" 

  while ($true) {
    if ($apiJob) {
      Receive-Job $apiJob -ErrorAction SilentlyContinue
    }
    Receive-Job $webJob -ErrorAction SilentlyContinue

    if ($apiJob -and $apiJob.State -in @("Failed", "Stopped", "Completed")) {
      throw "El backend se detuvo. Ejecutá 'Receive-Job mesa-click-api -Keep' si necesitás revisar el detalle en esta sesión."
    }
    if (-not $apiJob -and -not (Test-ApiReady)) {
      throw "La API que ya estaba corriendo dejó de responder."
    }
    if ($webJob.State -in @("Failed", "Stopped", "Completed")) {
      throw "El frontend se detuvo."
    }

    Start-Sleep -Seconds 1
  }
} finally {
  Write-Host "Deteniendo procesos locales..." -ForegroundColor Cyan
  if (Get-Variable webJob -ErrorAction SilentlyContinue) {
    Stop-Job $webJob -ErrorAction SilentlyContinue
    Remove-Job $webJob -Force -ErrorAction SilentlyContinue
  }
  if ($apiJob) {
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -Force -ErrorAction SilentlyContinue
  }
}

