$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "docker-common.psm1") -Force -DisableNameChecking

Set-DockerDevEnvironment
Stop-PortablePostgresIfPresent
Start-DockerDesktopIfNeeded

Write-Step "Levantando base y API con Docker Compose"
Invoke-DockerCompose @("up", "-d", "--build", "postgres", "api")
Wait-Api 120

& (Join-Path $PSScriptRoot "docker-seed.ps1")

Write-Step "Levantando frontend con Docker Compose"
Write-Host ""
Write-Host "Dejá esta terminal abierta. Para cortar: Ctrl+C" -ForegroundColor Cyan
Write-Host ""
Invoke-DockerCompose @("up", "--build", "postgres", "api", "web")
