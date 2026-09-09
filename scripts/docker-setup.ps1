$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "docker-common.psm1") -Force -DisableNameChecking

Set-DockerDevEnvironment
Stop-PortablePostgresIfPresent
Start-DockerDesktopIfNeeded

Write-Step "Construyendo y levantando stack Docker local"
Invoke-DockerCompose @("up", "-d", "--build")
Wait-Api 120

& (Join-Path $PSScriptRoot "docker-seed.ps1")

Write-Host "Setup Docker completo." -ForegroundColor Green
Write-Host "Stack local corriendo en http://localhost:3000" -ForegroundColor Yellow
