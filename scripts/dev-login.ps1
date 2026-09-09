$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$email = if ($args.Count -gt 0) { $args[0] } else { "admin@mesaclick.local" }
$body = @{ email = $email } | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Method POST -Uri "http://localhost:8080/auth/magic-link" -ContentType "application/json" -Body $body
} catch {
  throw "No pude pedir el magic link. Verificá que 'npm run dev' esté corriendo y que la API responda en http://localhost:8080."
}

if ($res.magic_link_dev) {
  Write-Host "Magic link local para $email" -ForegroundColor Green
  Write-Host $res.magic_link_dev -ForegroundColor Yellow
  return
}

Write-Host "La API respondió, pero no devolvió magic_link_dev." -ForegroundColor Red
Write-Host "Esto suele pasar si el email no existe en la base o si APP_ENV está en production." -ForegroundColor Yellow
Write-Host "Probá: npm run seed" -ForegroundColor Yellow
