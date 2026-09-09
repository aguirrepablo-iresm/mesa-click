#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$targetUser = "juanii"
$dockerHome = "C:\Users\$targetUser\.docker"
$dockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "Reparando Docker Desktop para el usuario $targetUser..." -ForegroundColor Cyan

Write-Host "Agregando usuario al grupo docker-users..." -ForegroundColor Cyan
net localgroup docker-users $targetUser /add | Out-Host

if (Test-Path $dockerHome) {
  Write-Host "Corrigiendo permisos de $dockerHome..." -ForegroundColor Cyan
  takeown /F $dockerHome /R /D S | Out-Host
  icacls $dockerHome /grant "${targetUser}:(OI)(CI)F" /T | Out-Host
}

Write-Host "Apagando WSL..." -ForegroundColor Cyan
wsl --shutdown

Write-Host "Iniciando servicio Docker Desktop..." -ForegroundColor Cyan
Start-Service com.docker.service

if (Test-Path $dockerDesktop) {
  Write-Host "Abriendo Docker Desktop..." -ForegroundColor Cyan
  Start-Process -FilePath $dockerDesktop
}

Write-Host "Esperando Docker Desktop..." -ForegroundColor Cyan
for ($i = 0; $i -lt 120; $i++) {
  docker info *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker Desktop quedó listo." -ForegroundColor Green
    Write-Host "Cerrá sesión de Windows y volvé a entrar si acabás de entrar al grupo docker-users." -ForegroundColor Yellow
    exit 0
  }
  Start-Sleep -Seconds 2
}

Write-Host "Docker Desktop no quedó listo todavía." -ForegroundColor Red
Write-Host "Abrí Docker Desktop, esperá el mensaje de error exacto y reiniciá Windows si el grupo docker-users se aplicó recién." -ForegroundColor Yellow
exit 1
