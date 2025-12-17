$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000'
$ts = Get-Random
$email = "demo$ts@test.com"
$uname = "demo$ts"
$pass = 'Test1234!'

Write-Host '-- signup'
$signup = Invoke-RestMethod -Method Post -Uri "$base/api/auth/signup" `
  -ContentType 'application/json' `
  -Body (@{ username = $uname; fullName = 'Demo User'; email = $email; password = $pass } | ConvertTo-Json)
Write-Host "signup ok: $($signup.success) id: $($signup.data.user.id)"

$login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" `
  -ContentType 'application/json' `
  -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
$token = $login.data.accessToken
$refresh = $login.data.refreshToken
Write-Host "login ok: $($login.success) token: $([bool]$token)"

$me = Invoke-RestMethod -Headers @{ Authorization = "Bearer $token" } -Uri "$base/api/users/me"
Write-Host "/me ok: $($me.success) username: $($me.data.username)"

$noti = Invoke-RestMethod -Headers @{ Authorization = "Bearer $token" } -Uri "$base/api/notifications"
$cnt = if ($noti.data) { $noti.data.Count } else { 0 }
Write-Host "notifications ok: $($noti.success) count: $cnt"

$refreshRes = Invoke-RestMethod -Method Post -Uri "$base/api/auth/refresh-token" `
  -ContentType 'application/json' `
  -Body (@{ refreshToken = $refresh } | ConvertTo-Json)
Write-Host "refresh ok: $($refreshRes.success)"

$logout = Invoke-RestMethod -Method Post -Uri "$base/api/auth/logout" `
  -ContentType 'application/json' `
  -Body (@{ refreshToken = $refresh } | ConvertTo-Json) `
  -Headers @{ Authorization = "Bearer $token" }
Write-Host "logout ok: $($logout.success) revoked: $($logout.revoked)"

