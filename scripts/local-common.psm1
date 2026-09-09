$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $PSScriptRoot
$ContainerName = "mesa_click_db"
$PgRoot = Join-Path $Root ".local\postgres\pgsql"
$PgBin = Join-Path $PgRoot "bin"
$PgData = Join-Path $Root ".local\postgres-data"
$PgLog = Join-Path $Root ".local\postgres.log"
$PgPasswordFile = Join-Path $Root ".local\postgres-password.txt"
$PgDatabase = "mesa_click"
$PgUser = "postgres"
$PgPassword = "postgres_password"
$PgPort = "5432"

function Write-Step([string]$Message) {
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "No encontré '$Name' en PATH. Instalalo y volvé a ejecutar el comando."
  }
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
    $candidates += [pscustomobject]@{
      IP = $ip
      HasGateway = $hasGateway
    }
  }

  $preferred = $candidates | Where-Object { $_.HasGateway } | Select-Object -First 1
  if ($preferred) { return $preferred.IP }

  $fallback = $candidates | Select-Object -First 1
  if ($fallback) { return $fallback.IP }

  $dnsFallback = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork } |
    ForEach-Object { $_.IPAddressToString } |
    Where-Object { $_ -notlike "127.*" -and $_ -notlike "169.254.*" } |
    Select-Object -First 1

  if ($dnsFallback) { return $dnsFallback }
  return "localhost"
}

function Test-DockerReady {
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

function Test-LocalPostgresInstalled {
  return Test-Path (Join-Path $PgBin "postgres.exe")
}

function Invoke-LocalPostgresCommand([string]$Executable, [string[]]$Arguments) {
  $env:PGPASSWORD = $PgPassword
  & (Join-Path $PgBin $Executable) @Arguments
}

function Initialize-LocalPostgres {
  if (Test-Path (Join-Path $PgData "PG_VERSION")) { return }

  Write-Step "Inicializando PostgreSQL local portable"
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $PgPasswordFile) | Out-Null
  if (-not (Test-Path $PgPasswordFile)) {
    $PgPassword | Set-Content -Encoding ASCII $PgPasswordFile
  }

  Invoke-LocalPostgresCommand "initdb.exe" @(
    "-D", $PgData,
    "-U", $PgUser,
    "--pwfile=$PgPasswordFile",
    "--encoding=UTF8",
    "--locale=C"
  )
}

function Test-LocalPostgresReady {
  if (-not (Test-LocalPostgresInstalled)) { return $false }
  Invoke-LocalPostgresCommand "pg_isready.exe" @(
    "-h", "localhost",
    "-p", $PgPort,
    "-U", $PgUser,
    "-d", "postgres"
  ) *> $null
  return $LASTEXITCODE -eq 0
}

function Ensure-LocalDatabase {
  $env:PGPASSWORD = $PgPassword
  $exists = & (Join-Path $PgBin "psql.exe") -h localhost -p $PgPort -U $PgUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$PgDatabase'"
  if ($exists -eq "1") { return }

  Write-Step "Creando base local $PgDatabase"
  Invoke-LocalPostgresCommand "createdb.exe" @(
    "-h", "localhost",
    "-p", $PgPort,
    "-U", $PgUser,
    $PgDatabase
  )
}

function Start-LocalPostgres {
  Initialize-LocalPostgres

  if (Test-LocalPostgresReady) {
    Write-Host "PostgreSQL local portable listo." -ForegroundColor Green
    return
  }

  Write-Step "Levantando PostgreSQL local portable"
  Invoke-LocalPostgresCommand "pg_ctl.exe" @(
    "start",
    "-D", $PgData,
    "-l", $PgLog,
    "-o", "-p $PgPort"
  )

  for ($i = 0; $i -lt 60; $i++) {
    $env:PGPASSWORD = $PgPassword
    & (Join-Path $PgBin "pg_isready.exe") -h localhost -p $PgPort -U $PgUser *> $null
    if ($LASTEXITCODE -eq 0) {
      Ensure-LocalDatabase
      Write-Host "PostgreSQL local portable listo." -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "PostgreSQL local portable no quedó listo. Revisá $PgLog."
}

function Stop-LocalPostgres {
  if (-not (Test-LocalPostgresInstalled)) { return }
  Invoke-LocalPostgresCommand "pg_ctl.exe" @(
    "stop",
    "-D", $PgData,
    "-m", "fast"
  )
}

function Start-DockerDesktopIfNeeded {
  if (Test-DockerReady) {
    Write-Host "Docker Desktop listo." -ForegroundColor Green
    return
  }

  $dockerDesktop = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:LocalAppData\Programs\Docker\Docker\Docker Desktop.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1

  if ($dockerDesktop) {
    Write-Step "Abriendo Docker Desktop"
    Start-Process -FilePath $dockerDesktop
  } else {
    throw "Docker Desktop no está instalado o no se encontró en la ruta esperada."
  }

  Write-Step "Esperando a que Docker Desktop habilite el engine"
  for ($i = 0; $i -lt 120; $i++) {
    if (Test-DockerReady) {
      Write-Host "Docker Desktop listo." -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 2
  }

  throw @"
Docker Desktop no quedó disponible.
Abrí Docker Desktop manualmente y aceptá cualquier permiso pendiente de Windows.
Si sigue igual, ejecutá Docker Desktop una vez como Administrador para que pueda iniciar el servicio 'com.docker.service'.
Después volvé a correr: npm run setup
"@
}

function Start-Postgres {
  if (Test-LocalPostgresInstalled) {
    Start-LocalPostgres
    return
  }

  Start-DockerDesktopIfNeeded
  Write-Step "Levantando PostgreSQL con Docker"
  Push-Location $Root
  try {
    docker compose up -d postgres | Write-Host
  } finally {
    Pop-Location
  }
}

function Wait-Postgres {
  if (Test-LocalPostgresInstalled) {
    for ($i = 0; $i -lt 60; $i++) {
      if (Test-LocalPostgresReady) {
        Ensure-LocalDatabase
        Write-Host "PostgreSQL local portable listo." -ForegroundColor Green
        return
      }
      Start-Sleep -Seconds 1
    }
    throw "PostgreSQL local portable no respondió a tiempo. Revisá $PgLog."
  }

  Write-Step "Esperando a que PostgreSQL esté saludable"
  for ($i = 0; $i -lt 60; $i++) {
    $status = docker inspect -f "{{.State.Health.Status}}" $ContainerName 2>$null
    if ($LASTEXITCODE -eq 0 -and $status -eq "healthy") {
      Write-Host "PostgreSQL listo." -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 1
  }
  throw "PostgreSQL no quedó saludable a tiempo. Revisá Docker Desktop y volvé a intentar."
}

function Ensure-ApiEnv {
  $envPath = Join-Path $Root "repos\api\.env"
  if (Test-Path $envPath) { return }

  Write-Step "Creando repos/api/.env local"
  @"
DATABASE_URL=postgres://postgres:postgres_password@localhost:5432/mesa_click?sslmode=disable
PORT=8080
APP_URL=http://localhost:3000
JWT_SECRET=dev_secret_mesa_click_local
APP_ENV=development

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
"@ | Set-Content -Encoding UTF8 $envPath
}

function Ensure-WebDeps {
  $webPath = Join-Path $Root "repos\web"
  $nodeModules = Join-Path $webPath "node_modules"
  if (Test-Path $nodeModules) {
    Write-Host "Dependencias web ya instaladas." -ForegroundColor Green
    return
  }

  Write-Step "Instalando dependencias web"
  Push-Location $webPath
  try {
    npm install
  } finally {
    Pop-Location
  }
}

function Wait-Api([int]$Seconds = 60) {
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

function Test-ApiReady {
  try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 2
    return $res.estado -eq "ok"
  } catch {
    return $false
  }
}

Export-ModuleMember -Function Require-Command,Get-LocalLanIP,Start-Postgres,Wait-Postgres,Ensure-ApiEnv,Ensure-WebDeps,Wait-Api,Test-ApiReady,Write-Step,Start-DockerDesktopIfNeeded,Stop-LocalPostgres
