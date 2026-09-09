$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "docker-common.psm1") -Force -DisableNameChecking

Start-DockerDesktopIfNeeded
Invoke-DockerCompose @("down")
