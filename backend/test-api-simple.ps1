# API Test Script for LearnDuels Backend
$baseUrl = "http://localhost:4000"
$headers = @{"Content-Type" = "application/json"}

Write-Host ""
Write-Host "Testing LearnDuels API Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   PASS: Health check" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "   FAIL: Health check - $_" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host ""
Write-Host "2. Testing User Login..." -ForegroundColor Yellow
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
    Write-Host "   PASS: Login successful" -ForegroundColor Green
    Write-Host "   Username: $($response.data.user.username)" -ForegroundColor Gray
} catch {
    Write-Host "   FAIL: Login failed - $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get Topics
Write-Host ""
Write-Host "3. Testing Topics API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/topics" -Method GET -Headers $authHeaders
    Write-Host "   PASS: Retrieved $($response.data.Count) topics" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: Topics API - $_" -ForegroundColor Red
}

# Test 4: Get Questions
Write-Host ""
Write-Host "4. Testing Questions API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/questions?limit=10" -Method GET -Headers $authHeaders
    Write-Host "   PASS: Retrieved $($response.data.questions.Count) questions" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: Questions API - $_" -ForegroundColor Red
}

# Test 5: Get Question Sets
Write-Host ""
Write-Host "5. Testing Question Sets API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/question-sets" -Method GET -Headers $authHeaders
    Write-Host "   PASS: Retrieved $($response.data.Count) question sets" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: Question Sets - $_" -ForegroundColor Red
}

# Test 6: Get Leaderboard
Write-Host ""
Write-Host "6. Testing Leaderboard API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard" -Method GET -Headers $authHeaders
    Write-Host "   PASS: Retrieved $($response.data.Count) leaderboard entries" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: Leaderboard - $_" -ForegroundColor Red
}

# Test 7: Get User Profile
Write-Host ""
Write-Host "7. Testing User Profile..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" -Method GET -Headers $authHeaders
    Write-Host "   PASS: Profile retrieved" -ForegroundColor Green
    Write-Host "   User: $($response.data.username) | Level: $($response.data.level)" -ForegroundColor Gray
} catch {
    Write-Host "   FAIL: Profile - $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "API Testing Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
