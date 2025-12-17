# Detailed API Test with Error Diagnosis
$baseUrl = "http://localhost:4000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  LearnDuels API Test Report" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login and get token
Write-Host "Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@learnduels.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -Headers @{"Content-Type"="application/json"}
    $token = $loginResponse.data.accessToken
    $userId = $loginResponse.data.user.id
    Write-Host "✓ Logged in as: $($loginResponse.data.user.username)" -ForegroundColor Green
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Token (first 20 chars): $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n----------------------------------------" -ForegroundColor Cyan
Write-Host "Testing Core Endpoints" -ForegroundColor Cyan
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

# Test 1: Topics
Write-Host "1. Topics API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/topics" -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved $($response.data.Count) topics" -ForegroundColor Green
    $response.data | ForEach-Object { Write-Host "     - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Topics Tree
Write-Host "`n2. Topics Tree Structure" -ForegroundColor Yellow
try {
    $treeUrl = $baseUrl + '/api/topics?asTree=true'
    $response = Invoke-RestMethod -Uri $treeUrl -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved tree with $($response.data.Count) root topics" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Questions (with proper params)
Write-Host "`n3. Questions API" -ForegroundColor Yellow
try {
    $questionsUrl = $baseUrl + '/api/questions?page=1&limit=5'
    $response = Invoke-RestMethod -Uri $questionsUrl -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved questions" -ForegroundColor Green
    Write-Host "     Total: $($response.data.total)" -ForegroundColor Gray
    Write-Host "     Page: $($response.data.page) of $($response.data.totalPages)" -ForegroundColor Gray
    Write-Host "     Questions on page: $($response.data.questions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 4: Question Sets
Write-Host "`n4. Question Sets API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/question-sets" -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved $($response.data.Count) question sets" -ForegroundColor Green
    $response.data | Select-Object -First 3 | ForEach-Object { 
        Write-Host "     - $($_.name) ($($_.visibility))" -ForegroundColor Gray 
    }
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 5: User Profile (correct endpoint)
Write-Host "`n5. User Profile" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" -Method GET -Headers $authHeaders
    Write-Host "   ✓ Profile loaded" -ForegroundColor Green
    Write-Host "     Username: $($response.data.username)" -ForegroundColor Gray
    Write-Host "     Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "     Level: $($response.data.level) | XP: $($response.data.xp)" -ForegroundColor Gray
    Write-Host "     Role: $($response.data.role)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 6: Leaderboard
Write-Host "`n6. Leaderboard" -ForegroundColor Yellow
try {
    $leaderboardUrl = $baseUrl + '/api/leaderboard?limit=10'
    $response = Invoke-RestMethod -Uri $leaderboardUrl -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved $($response.data.Count) leaderboard entries" -ForegroundColor Green
    $response.data | Select-Object -First 3 | ForEach-Object { 
        Write-Host "     #$($_.rank): $($_.username) - $($_.rating) points" -ForegroundColor Gray 
    }
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 7: Notifications
Write-Host "`n7. Notifications" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method GET -Headers $authHeaders
    Write-Host "   ✓ Retrieved $($response.data.Count) notifications" -ForegroundColor Green
    $unread = ($response.data | Where-Object { -not $_.isRead }).Count
    Write-Host "     Unread: $unread" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 8: Create Question Set
Write-Host "`n8. Create Question Set (Write Test)" -ForegroundColor Yellow
try {
    $createBody = @{
        name = "Test Quiz $(Get-Random)"
        description = "Created by automated test"
        questionIds = @(1, 2, 3, 4, 5)
        visibility = "private"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/question-sets" -Method POST -Body $createBody -Headers $authHeaders
    Write-Host "   ✓ Question set created!" -ForegroundColor Green
    Write-Host "     ID: $($response.data.id)" -ForegroundColor Gray
    Write-Host "     Name: $($response.data.name)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 9: User Stats
Write-Host "`n9. User Stats" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/stats" -Method GET -Headers $authHeaders
    Write-Host "   ✓ Stats retrieved" -ForegroundColor Green
    Write-Host "     Total Attempts: $($response.data.totalAttempts)" -ForegroundColor Gray
    Write-Host "     Average Score: $($response.data.averageScore)%" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

# Test 10: Search Topics
Write-Host "`n10. Search Topics" -ForegroundColor Yellow
try {
    $searchUrl = $baseUrl + '/api/topics/search?q=prog'
    $response = Invoke-RestMethod -Uri $searchUrl -Method GET -Headers $authHeaders
    Write-Host "   ✓ Search returned $($response.data.Count) results" -ForegroundColor Green
    $response.data | ForEach-Object { Write-Host "     - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Report Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Database Stats
Write-Host "`nDatabase Contents:" -ForegroundColor Yellow
Write-Host "  - Users: 21 (1 admin + 20 test users)" -ForegroundColor Gray
Write-Host "  - Topics: 7 (hierarchical structure)" -ForegroundColor Gray
Write-Host "  - Questions: 50" -ForegroundColor Gray
Write-Host "  - Question Sets: 10" -ForegroundColor Gray
Write-Host "  - Attempts: 30" -ForegroundColor Gray
Write-Host "  - Notifications: 20" -ForegroundColor Gray

Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@learnduels.com / admin123" -ForegroundColor Gray
Write-Host "  Users: user1@test.com through user20@test.com / password123" -ForegroundColor Gray

Write-Host ""
