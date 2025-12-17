$ErrorActionPreference = 'Stop'
$resp = Invoke-WebRequest -Uri 'http://localhost:4000/socket.io/?EIO=4&transport=polling'
Write-Host "socket handshake status: $($resp.StatusCode)"
Write-Host "body: $($resp.Content)"

