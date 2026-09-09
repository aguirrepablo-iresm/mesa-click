$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "docker-common.psm1") -Force -DisableNameChecking

$seedPath = Join-Path $PSScriptRoot "seed-local.sql"
$seedSql = Get-Content -Raw -LiteralPath $seedPath

Write-Step "Sembrando datos demo en PostgreSQL Docker"
Invoke-DockerComposeWithInput -InputText $seedSql -Arguments @(
  "exec",
  "-T",
  "postgres",
  "psql",
  "-U",
  "postgres",
  "-d",
  "mesa_click",
  "-v",
  "ON_ERROR_STOP=1"
)

Write-Host "Seed Docker aplicado." -ForegroundColor Green
Write-Host "Usuario local: admin@mesaclick.local" -ForegroundColor Yellow
