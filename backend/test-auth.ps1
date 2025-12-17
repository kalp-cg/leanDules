# Auth Test
Write-Host 'Testing Signup and Login' -ForegroundColor Cyan
$user = "test$(Get-Random)"
$email = "$user@test.com"
$pass = "Test1234"
$signupBody = @{username=$user; email=$email; password=$pass} | ConvertTo-Json
$signup = curl.exe -s -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d $signupBody | ConvertFrom-Json
if ($signup.success) { Write-Host "SIGNUP: OK - User: $($signup.data.user.username)" -ForegroundColor Green } else { Write-Host "SIGNUP: FAIL - $($signup.message)" -ForegroundColor Red; exit }
$loginBody = @{email=$email; password=$pass} | ConvertTo-Json  
$login = curl.exe -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
if ($login.success) { Write-Host "LOGIN: OK - User: $($login.data.user.username) XP: $($login.data.user.xp)" -ForegroundColor Green } else { Write-Host "LOGIN: FAIL - $($login.message)" -ForegroundColor Red }
