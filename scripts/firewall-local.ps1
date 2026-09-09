#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$rules = @(
  @{
    DisplayName = "Mesa Click Local Frontend"
    LocalPort = 3000
  },
  @{
    DisplayName = "Mesa Click Local API"
    LocalPort = 8080
  }
)

$profiles = @(Get-NetConnectionProfile -ErrorAction Stop)
$activeProfile = $profiles |
  Where-Object { $_.IPv4Connectivity -in @("Internet", "LocalNetwork") } |
  Select-Object -First 1
if (-not $activeProfile) {
  $activeProfile = $profiles | Select-Object -First 1
}
if (-not $activeProfile) {
  throw "No se encontró una conexión de red activa para configurar el firewall."
}

$networkProfile = $activeProfile.NetworkCategory
$firewallProfile = switch ($networkProfile) {
  "DomainAuthenticated" { "Domain" }
  "Private" { "Private" }
  default { "Public" }
}

Write-Host "Perfil de red detectado: $networkProfile" -ForegroundColor Yellow
Write-Host "Creando reglas limitadas a la subred local para el perfil $firewallProfile" -ForegroundColor Yellow

foreach ($rule in $rules) {
  $displayName = "$($rule.DisplayName) - $firewallProfile"
  $existing = Get-NetFirewallRule -DisplayName $displayName -ErrorAction SilentlyContinue
  if ($existing) {
    Set-NetFirewallRule `
      -DisplayName $displayName `
      -Enabled True `
      -Action Allow `
      -Profile $firewallProfile | Out-Null

    Write-Host "Regla actualizada: $displayName" -ForegroundColor Green
    continue
  }

  New-NetFirewallRule `
    -DisplayName $displayName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $rule.LocalPort `
    -Profile $firewallProfile `
    -RemoteAddress LocalSubnet | Out-Null

  Write-Host "Regla creada: $displayName puerto $($rule.LocalPort)" -ForegroundColor Green
}

Write-Host "Firewall local preparado para Mesa Click en la red $networkProfile." -ForegroundColor Yellow
