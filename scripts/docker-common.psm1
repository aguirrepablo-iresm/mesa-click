$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $PSScriptRoot
$ComposeFiles = @(
  "-f", (Join-Path $Root "docker-compose.yml"),
  "-f", (Join-Path $Root "docker-compose.dev.yml")
)

function Write-Step([string]$Message) {
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Get-LocalLanIP {
  $blocks = (ipconfig) -join "`n" -split "(?m)(?=^Adaptador|^Ethernet adapter|^Wireless LAN adapter)"
  $candidates = @()

  foreach ($block in $blocks) {
    if ($block -match "(?i)vEthernet|WSL|Docker|Loopback") { continue }
    if ($block -notmatch "(?i)IPv4.*?:\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3})") { continue }

    $ip = $Matches[1]
    if ($ip -like "127.*" -or $ip -like "169.254.*") { continue }

    $hasGateway = $block -match "(?i)(Puerta de enlace predeterminada|Default Gateway).*?:\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3})"
    $candidates += [pscustomobject]@{ IP = $ip; HasGateway = $hasGateway }
  }

  $preferred = $candidates | Where-Object { $_.HasGateway } | Select-Object -First 1
  if ($preferred) { return $preferred.IP }

  $fallback = $candidates | Select-Object -First 1
  if ($fallback) { return $fallback.IP }

  return "localhost"
}

function Use-RepoDockerConfig {
  $primary = Join-Path $Root ".local\docker-config"
  try {
    New-Item -ItemType Directory -Force -Path $primary | Out-Null
    $env:DOCKER_CONFIG = $primary
  } catch {
    $fallback = Join-Path $env:TEMP "mesa-click-docker-config"
    New-Item -ItemType Directory -Force -Path $fallback | Out-Null
    $env:DOCKER_CONFIG = $fallback
  }
}

function Test-DockerReady {
  Use-RepoDockerConfig
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    docker info *> $null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Start-DockerDesktopIfNeeded {
  Use-RepoDockerConfig

  if (Test-DockerReady) {
    Write-Host "Docker Desktop listo." -ForegroundColor Green
    return
  }

  $dockerDesktop = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:LocalAppData\Programs\Docker\Docker\Docker Desktop.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1

  if (-not $dockerDesktop) {
    throw "Docker Desktop no está instalado o no se encontró en la ruta esperada."
  }

  Write-Step "Abriendo Docker Desktop"
  Start-Process -FilePath $dockerDesktop

  Write-Step "Esperando Docker Desktop"
  for ($i = 0; $i -lt 120; $i++) {
    if (Test-DockerReady) {
      Write-Host "Docker Desktop listo." -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 2
  }

  throw "Docker Desktop no quedó disponible. Ejecutá npm.cmd run docker:repair en PowerShell como Administrador y volvé a intentar."
}

function Set-DockerDevEnvironment {
  $lanIP = Get-LocalLanIP
  $env:APP_ENV = "development"
  $env:APP_URL = "http://${lanIP}:3000"
  $env:NEXT_PUBLIC_APP_URL = "http://${lanIP}:3000"
  $env:NEXT_PUBLIC_API_URL = "http://${lanIP}:8080"
  $env:JWT_SECRET = "dev_secret_mesa_click_local"

  Write-Host "Frontend PC:      http://localhost:3000" -ForegroundColor Yellow
  Write-Host "Frontend celular: $env:NEXT_PUBLIC_APP_URL" -ForegroundColor Yellow
  Write-Host "API PC:           http://localhost:8080" -ForegroundColor Yellow
  Write-Host "API celular:      $env:NEXT_PUBLIC_API_URL" -ForegroundColor Yellow
  Write-Host "Login local:      admin@mesaclick.local" -ForegroundColor Yellow
}

function Invoke-DockerCompose([string[]]$Arguments) {
  Use-RepoDockerConfig
  Push-Location $Root
  try {
    docker compose @ComposeFiles @Arguments
  } finally {
    Pop-Location
  }
}

function Invoke-DockerComposeWithInput([string]$InputText, [string[]]$Arguments) {
  Use-RepoDockerConfig
  Push-Location $Root
  try {
    $InputText | docker compose @ComposeFiles @Arguments
  } finally {
    Pop-Location
  }
}

function Test-DockerPostgresRunning {
  Use-RepoDockerConfig
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    $containerId = docker ps -q --filter "name=^/mesa_click_db$" --filter "status=running" 2>$null
    return -not [string]::IsNullOrWhiteSpace(($containerId -join "").Trim())
  } catch {
    return $false
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Wait-Api([int]$Seconds = 90) {
  Write-Step "Esperando API en http://localhost:8080/health"
  for ($i = 0; $i -lt $Seconds; $i++) {
    try {
      $res = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 2
      if ($res.estado -eq "ok") {
        Write-Host "API lista." -ForegroundColor Green
        return
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  throw "La API no respondió a tiempo en http://localhost:8080/health."
}

function Stop-PortablePostgresIfPresent {
  $pgCtl = Join-Path $Root ".local\postgres\pgsql\bin\pg_ctl.exe"
  $pgData = Join-Path $Root ".local\postgres-data"
  $pidFile = Join-Path $pgData "postmaster.pid"

  if ((Test-Path $pgCtl) -and (Test-Path (Join-Path $pgData "PG_VERSION"))) {
    if (Test-DockerPostgresRunning) {
      Write-Host "PostgreSQL Docker ya está corriendo en el puerto 5432; no se detiene el portable." -ForegroundColor Green
      return
    }

    Write-Step "Deteniendo PostgreSQL portable para liberar el puerto 5432"

    # pg_ctl puede encontrar un PID obsoleto y devolver error aunque el servidor ya esté detenido.
    $previousErrorActionPreference = $ErrorActionPreference
    $stopExitCode = 0
    try {
      $ErrorActionPreference = "Continue"
      & $pgCtl stop -D $pgData -m fast *> $null
      $stopExitCode = $LASTEXITCODE
    } catch {
      $stopExitCode = 1
    } finally {
      $ErrorActionPreference = $previousErrorActionPreference
    }

    Start-Sleep -Milliseconds 500
    $listening = @(Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue)

    if ($listening.Count -gt 0) {
      throw "No se pudo liberar el puerto 5432. Hay un proceso escuchando en ese puerto; detenelo antes de iniciar Docker."
    }

    if (($stopExitCode -ne 0) -and (Test-Path $pidFile)) {
      $pidText = Get-Content -LiteralPath $pidFile -TotalCount 1 -ErrorAction SilentlyContinue
      $pidValue = 0
      $pidParsed = [int]::TryParse($pidText, [ref]$pidValue)
      $runningProcess = if ($pidParsed) { Get-Process -Id $pidValue -ErrorAction SilentlyContinue } else { $null }

      if (-not $runningProcess) {
        try {
          Remove-Item -LiteralPath $pidFile -Force -ErrorAction Stop
          Write-Host "PID obsoleto de PostgreSQL eliminado; continuando con Docker." -ForegroundColor Yellow
        } catch {
          Write-Warning "El PID de PostgreSQL es obsoleto, pero no se pudo eliminar postmaster.pid por permisos. Docker puede continuar porque el puerto 5432 está libre."
        }
      } else {
        throw "PostgreSQL portable no pudo detenerse (PID $pidValue sigue existiendo)."
      }
    }
  }
}

Export-ModuleMember -Function Write-Step,Get-LocalLanIP,Use-RepoDockerConfig,Test-DockerReady,Start-DockerDesktopIfNeeded,Set-DockerDevEnvironment,Invoke-DockerCompose,Invoke-DockerComposeWithInput,Wait-Api,Stop-PortablePostgresIfPresent
