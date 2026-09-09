$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "local-common.psm1") -Force -DisableNameChecking

Start-Postgres
Wait-Postgres
