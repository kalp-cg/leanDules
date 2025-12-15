$rand = Get-Random
$signupBody = "{`"username`":`"authuser$rand`",`"email`":`"authuser$rand@test.com`",`"password`":`"Auth1234`"}"
$loginBody = "{`"email`":`"authuser$rand@test.com`",`"password`":`"Auth1234`"}"

Write-Host "`n========== AUTHENTICATION TEST ==========`n" -ForegroundColor Cyan

Write-Host "TESTING SIGNUP..." -ForegroundColor Yellow
$signup = curl.exe -s -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d $signupBody | ConvertFrom-Json

if ($signup.success) {
    Write-Host "[SUCCESS] User created: $($signup.data.user.username)" -ForegroundColor Green
    Write-Host "          Email: $($signup.data.user.email)" -ForegroundColor White
    Write-Host "          Level: $($signup.data.user.level) | XP: $($signup.data.user.xp)`n" -ForegroundColor White
    
    Write-Host "TESTING LOGIN..." -ForegroundColor Yellow
    $login = curl.exe -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d $loginBody | ConvertFrom-Json
    
    if ($login.success) {
        Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
        Write-Host "          User: $($login.data.user.username)" -ForegroundColor White
        Write-Host "          Level: $($login.data.user.level) | XP: $($login.data.user.xp)" -ForegroundColor White
        Write-Host "          Token: Received`n" -ForegroundColor White
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host " ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "=========================================`n" -ForegroundColor Cyan
    } else {
        Write-Host "[FAILED] Login failed: $($login.message)" -ForegroundColor Red
    }
} else {
    Write-Host "[FAILED] Signup failed: $($signup.message)" -ForegroundColor Red
}
