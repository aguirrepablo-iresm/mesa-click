$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Import-Module (Join-Path $PSScriptRoot "local-common.psm1") -Force -DisableNameChecking

Stop-LocalPostgres
