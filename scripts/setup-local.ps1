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
$apiJob = $null

if (Test-ApiReady) {
  Write-Host "API ya estaba corriendo en http://localhost:8080; la reutilizo." -ForegroundColor Green
} else {
  Write-Step "Levantando API temporal para ejecutar migraciones"
  $apiJob = Start-Job -Name "mesa-click-api-setup" -ScriptBlock {
    param($Path)
    Set-Location $Path
    go run .
  } -ArgumentList $apiPath
}

try {
  Wait-Api 90
  & (Join-Path $PSScriptRoot "seed-local.ps1")
} finally {
  if ($apiJob) {
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Setup local completo." -ForegroundColor Green
Write-Host "Desde ahora podés levantar todo con: npm run dev" -ForegroundColor Yellow
Write-Host "Para entrar al dashboard usá: admin@mesaclick.local" -ForegroundColor Yellow

