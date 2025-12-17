# API Test Script for LearnDuels Backend
# Tests all major endpoints

$baseUrl = "http://localhost:4000"
$headers = @{"Content-Type" = "application/json"}

Write-Host "`n🧪 Testing LearnDuels API Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   ✅ Health check passed" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Register New User
Write-Host "`n2️⃣  Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random)"
    email = "test_$(Get-Random)@test.com"
    password = "Test123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -Headers $headers
    $accessToken = $response.data.accessToken
    Write-Host "   ✅ Registration successful" -ForegroundColor Green
    Write-Host "   User ID: $($response.data.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Registration failed: $_" -ForegroundColor Red
}

# Test 3: Login
Write-Host "`n3️⃣  Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "user1@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -Headers $headers
    $token = $response.data.accessToken
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    Write-Host "   ✅ Login successful" -ForegroundColor Green
    Write-Host "   Username: $($response.data.user.username)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Get Topics
Write-Host "`n4️⃣  Testing Topics API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/topics" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Topics retrieved: $($response.data.Count) topics" -ForegroundColor Green
    Write-Host "   Topics: $($response.data.name -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Topics API failed: $_" -ForegroundColor Red
}

# Test 5: Get Topics as Tree
Write-Host "`n5️⃣  Testing Topics Tree..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/topics?asTree=true" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Topics tree retrieved: $($response.data.Count) root topics" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Topics tree failed: $_" -ForegroundColor Red
}

# Test 6: Get Questions
Write-Host "`n6️⃣  Testing Questions API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/questions?limit=10" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Questions retrieved: $($response.data.questions.Count) questions" -ForegroundColor Green
    Write-Host "   Total: $($response.data.total)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Questions API failed: $_" -ForegroundColor Red
}

# Test 7: Get Question Sets
Write-Host "`n7️⃣  Testing Question Sets API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/question-sets" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Question sets retrieved: $($response.data.Count) sets" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Question sets failed: $_" -ForegroundColor Red
}

# Test 8: Get Leaderboard
Write-Host "`n8️⃣  Testing Leaderboard API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Leaderboard retrieved: $($response.data.Count) entries" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Leaderboard failed: $_" -ForegroundColor Red
}

# Test 9: Get User Profile
Write-Host "`n9️⃣  Testing User Profile..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Profile retrieved" -ForegroundColor Green
    Write-Host "   Username: $($response.data.username)" -ForegroundColor Gray
    Write-Host "   Level: $($response.data.level) | XP: $($response.data.xp)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Profile failed: $_" -ForegroundColor Red
}

# Test 10: Get Notifications
Write-Host "`n🔟 Testing Notifications API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method GET -Headers $authHeaders
    Write-Host "   ✅ Notifications retrieved: $($response.data.Count) notifications" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Notifications failed: $_" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
