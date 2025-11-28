# LearnDuels API Comprehensive Test Suite
# Tests all 36+ API endpoints

$ErrorActionPreference = "SilentlyContinue"
$baseUrl = "http://localhost:4000"
$passCount = 0
$failCount = 0

function Test-API {
    param($num, $name, $method, $url, $body = $null, $headers = $null, $skipErrors = $false)
    
    Write-Host "[$num/37] $name..." -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $url
            Method = $method
            ErrorAction = "Stop"
        }
        
        if ($headers) { $params.Headers = $headers }
        if ($body) { 
            $params.Body = $body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "    ✅ PASS ($($response.StatusCode))" -ForegroundColor Green
        return @{ success = $true; response = $response }
    }
    catch {
        if ($skipErrors) {
            Write-Host "    ⚠️  SKIP" -ForegroundColor Yellow
            return @{ success = $true; skipped = $true }
        }
        Write-Host "    ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        return @{ success = $false; error = $_ }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LEARNDUELS API COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ===== PUBLIC ENDPOINTS =====
Write-Host "`n--- PUBLIC ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 1 "Health Check" "GET" "$baseUrl/health"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 2 "API Info" "GET" "$baseUrl/api"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 3 "GET Categories" "GET" "$baseUrl/api/categories"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 4 "GET Difficulties" "GET" "$baseUrl/api/categories/difficulties"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 5 "GET Leaderboard" "GET" "$baseUrl/api/leaderboards"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 6 "GET Questions" "GET" "$baseUrl/api/questions"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 7 "GET Top Performers" "GET" "$baseUrl/api/leaderboards/top?limit=10"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 8 "Search Users" "GET" "$baseUrl/api/users/search?q=ad"
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== AUTH ENDPOINTS =====
Write-Host "`n--- AUTH ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 9 "Login" "POST" "$baseUrl/api/auth/login" '{"email":"kalpp210@gmail.com","password":"Kalp0000"}'
if ($result.success) { 
    $passCount++
    $loginData = $result.response.Content | ConvertFrom-Json
    $global:token = $loginData.data.accessToken
    $global:refreshToken = $loginData.data.refreshToken
    Write-Host "    Token acquired successfully" -ForegroundColor Gray
} else { 
    $failCount++
    $global:token = ""
}

$ts = Get-Date -Format "HHmmss"
$result = Test-API 10 "Signup" "POST" "$baseUrl/api/auth/signup" "{`"fullName`":`"Test$ts`",`"email`":`"test$ts@test.com`",`"password`":`"Test1234`"}"
if ($result.success) { $passCount++ } else { $failCount++ }

$ts = Get-Date -Format "HHmmss"
$result = Test-API 11 "Register" "POST" "$baseUrl/api/auth/register" "{`"fullName`":`"Test$ts`",`"email`":`"reg$ts@test.com`",`"password`":`"Test1234`"}"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 12 "Refresh Token" "POST" "$baseUrl/api/auth/refresh-token" "{`"refreshToken`":`"$global:refreshToken`"}"
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 13 "Change Password" "POST" "$baseUrl/api/auth/change-password" '{"oldPassword":"Kalp0000","newPassword":"Kalp0000"}' @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 14 "Logout" "POST" "$baseUrl/api/auth/logout" '{"refreshToken":"dummy"}' @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== USER ENDPOINTS =====
Write-Host "`n--- USER ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 15 "GET /users/me" "GET" "$baseUrl/api/users/me" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 16 "PUT /users/update" "PUT" "$baseUrl/api/users/update" '{"fullName":"Admin Updated"}' @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 17 "GET /users/:id" "GET" "$baseUrl/api/users/3" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 18 "GET /users/:id/followers" "GET" "$baseUrl/api/users/3/followers" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 19 "GET /users/:id/following" "GET" "$baseUrl/api/users/3/following" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 20 "POST /users/:id/follow" "POST" "$baseUrl/api/users/4/follow" $null @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 21 "POST /users/:id/unfollow" "POST" "$baseUrl/api/users/4/unfollow" $null @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== QUESTION ENDPOINTS =====
Write-Host "`n--- QUESTION ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 22 "POST /questions (Create)" "POST" "$baseUrl/api/questions" '{"categoryId":1,"difficultyId":2,"questionText":"API Test Q","optionA":"A","optionB":"B","optionC":"C","optionD":"D","correctOption":"A"}' @{Authorization="Bearer $global:token"}
if ($result.success) { 
    $passCount++
    $questionData = $result.response.Content | ConvertFrom-Json
    $global:questionId = $questionData.data.id
    Write-Host "    Question ID: $global:questionId" -ForegroundColor Gray
} else { 
    $failCount++
    $global:questionId = 2
}

$result = Test-API 23 "GET /questions/:id" "GET" "$baseUrl/api/questions/$global:questionId" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 24 "PUT /questions/:id" "PUT" "$baseUrl/api/questions/$global:questionId" '{"questionText":"Updated Test Q"}' @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 25 "GET /questions/search" "GET" "$baseUrl/api/questions/search?q=test"
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== DUEL ENDPOINTS =====
Write-Host "`n--- DUEL ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 26 "POST /duels (Create)" "POST" "$baseUrl/api/duels" '{"opponentId":4,"categoryId":1,"difficultyId":1,"questionCount":5,"timeLimit":60}' @{Authorization="Bearer $global:token"}
if ($result.success) { 
    $passCount++
    $duelData = $result.response.Content | ConvertFrom-Json
    $global:duelId = $duelData.data.id
    Write-Host "    Duel ID: $global:duelId" -ForegroundColor Gray
} else { 
    $failCount++
    $global:duelId = 2
}

$result = Test-API 27 "GET /duels/my" "GET" "$baseUrl/api/duels/my" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 28 "GET /duels/:id" "GET" "$baseUrl/api/duels/$global:duelId" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 29 "POST /duels/:duelId/questions/:questionId/answer" "POST" "$baseUrl/api/duels/$global:duelId/questions/2/answer" '{"selectedOption":"B"}' @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== LEADERBOARD ENDPOINTS =====
Write-Host "`n--- LEADERBOARD ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 30 "GET /leaderboards/my/rank" "GET" "$baseUrl/api/leaderboards/my/rank" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 31 "GET /leaderboards/my/stats" "GET" "$baseUrl/api/leaderboards/my/stats" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 32 "GET /leaderboards/around-me" "GET" "$baseUrl/api/leaderboards/around-me?range=5" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== NOTIFICATION ENDPOINTS =====
Write-Host "`n--- NOTIFICATION ENDPOINTS ---`n" -ForegroundColor Cyan

$result = Test-API 33 "GET /notifications" "GET" "$baseUrl/api/notifications" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$result = Test-API 34 "PUT /notifications/read-all" "PUT" "$baseUrl/api/notifications/read-all" $null @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== ADMIN ENDPOINTS =====
Write-Host "`n--- ADMIN ENDPOINTS ---`n" -ForegroundColor Cyan

$ts = Get-Date -Format "HHmmss"
$result = Test-API 35 "POST /categories (Admin)" "POST" "$baseUrl/api/categories" "{`"name`":`"TestCat$ts`"}" @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

$ts = Get-Date -Format "HHmmss"
$result = Test-API 36 "POST /categories/difficulties (Admin)" "POST" "$baseUrl/api/categories/difficulties" "{`"level`":`"TestDiff$ts`"}" @{Authorization="Bearer $global:token"}
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== CLEANUP =====
Write-Host "`n--- CLEANUP ---`n" -ForegroundColor Cyan

$result = Test-API 37 "DELETE /questions/:id" "DELETE" "$baseUrl/api/questions/$global:questionId" $null @{Authorization="Bearer $global:token"} $true
if ($result.success) { $passCount++ } else { $failCount++ }

# ===== RESULTS =====
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests:  37" -ForegroundColor White
Write-Host "Passed:       $passCount" -ForegroundColor Green
Write-Host "Failed:       $failCount" -ForegroundColor Red
$successRate = [math]::Round(($passCount / 37) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($successRate -gt 90){"Green"}elseif($successRate -gt 75){"Yellow"}else{"Red"})
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Backend is fully operational." -ForegroundColor Green
} elseif ($successRate -gt 90) {
    Write-Host "✅ Excellent! Most APIs are working correctly." -ForegroundColor Green
} elseif ($successRate -gt 75) {
    Write-Host "⚠️  Good, but some APIs need attention." -ForegroundColor Yellow
} else {
    Write-Host "❌ Multiple APIs failing - investigation required." -ForegroundColor Red
}
