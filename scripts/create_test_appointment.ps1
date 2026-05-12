$ErrorActionPreference='Stop'

$loginBody = @{ email='test@example.com'; password='password123' } | ConvertTo-Json
Write-Host 'Logging in...'
$res = Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/customers/login/' -Body $loginBody -ContentType 'application/json'
$token = $res.access
Write-Host "Access token: $token"
$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

Write-Host 'Checking vehicles...'
try {
  $vehicles = Invoke-RestMethod -Uri 'http://localhost:8000/api/vehicles/' -Headers $headers -ErrorAction Stop
} catch {
  $vehicles = @()
}

if ($vehicles -and $vehicles.Count -gt 0) {
  $vid = $vehicles[0].vehicle_id
  Write-Host "Using existing vehicle id: $vid"
} else {
  Write-Host 'Creating vehicle...'
  $veh = @{ make='TestMake'; model='TestModel'; year=2020; license_plate='TEST123' } | ConvertTo-Json
  $newv = Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/vehicles/' -Body $veh -Headers $headers -ContentType 'application/json'
  $vid = $newv.vehicle_id
  Write-Host "Created vehicle id: $vid"
}

Write-Host 'Creating appointment...'
$appt = @{ vehicle = $vid; scheduled_at = '2026-03-10T10:00:00Z'; service_type = 'Test Service'; cost = 100 } | ConvertTo-Json
$newappt = Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/appointments/' -Body $appt -Headers $headers -ContentType 'application/json'
Write-Host 'Created appointment:'
$newappt | ConvertTo-Json
