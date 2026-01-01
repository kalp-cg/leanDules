# Test Follow Request System
# Run this script to test the complete follow request flow

Write-Host "`n🚀 Testing Follow Request System" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$baseUrl = "http://localhost:3000/api"

# Test user credentials
$userA = @{
    email = "testuser1@example.com"
    password = "password123"
}

$userB = @{
    email = "testuser2@example.com"
    password = "password123"
}

# Helper function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token,
        [object]$Body
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
        throw
    }
}

# Step 1: Login as User A
Write-Host "`n📝 Step 1: Login as User A" -ForegroundColor Yellow
try {
    $loginA = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $userA
    $tokenA = $loginA.data.accessToken
    
    $profileA = Invoke-ApiRequest -Method GET -Endpoint "/users/me" -Token $tokenA
    $userAId = $profileA.data.id
    Write-Host "✅ Logged in as: $($profileA.data.fullName) (ID: $userAId)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to login as User A. Make sure the user exists." -ForegroundColor Red
    exit 1
}

# Step 2: Login as User B
Write-Host "`n📝 Step 2: Login as User B" -ForegroundColor Yellow
try {
    $loginB = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $userB
    $tokenB = $loginB.data.accessToken
    
    $profileB = Invoke-ApiRequest -Method GET -Endpoint "/users/me" -Token $tokenB
    $userBId = $profileB.data.id
    Write-Host "✅ Logged in as: $($profileB.data.fullName) (ID: $userBId)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to login as User B. Make sure the user exists." -ForegroundColor Red
    exit 1
}

# Step 3: User A sends follow request to User B
Write-Host "`n📝 Step 3: User A sends follow request to User B" -ForegroundColor Yellow
try {
    $followRequest = Invoke-ApiRequest -Method POST -Endpoint "/users/$userBId/follow" -Token $tokenA
    Write-Host "✅ Follow request sent: $($followRequest.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Follow request may already exist" -ForegroundColor Yellow
}

# Step 4: User B checks pending follow requests
Write-Host "`n📝 Step 4: User B checks pending follow requests" -ForegroundColor Yellow
try {
    $pendingRequests = Invoke-ApiRequest -Method GET -Endpoint "/users/follow-requests" -Token $tokenB
    $requestCount = $pendingRequests.data.requests.Count
    Write-Host "✅ User B has $requestCount pending request(s)" -ForegroundColor Green
    
    if ($requestCount -gt 0) {
        Write-Host "`nPending Requests:" -ForegroundColor Cyan
        foreach ($req in $pendingRequests.data.requests) {
            Write-Host "  - $($req.fullName) (ID: $($req.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Failed to get pending requests" -ForegroundColor Red
    exit 1
}

# Step 5: User B accepts the follow request
Write-Host "`n📝 Step 5: User B accepts the follow request from User A" -ForegroundColor Yellow
try {
    $acceptRequest = Invoke-ApiRequest -Method POST -Endpoint "/users/$userAId/follow/accept" -Token $tokenB
    Write-Host "✅ Follow request accepted: $($acceptRequest.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to accept follow request" -ForegroundColor Red
    exit 1
}

# Step 6: Verify no more pending requests
Write-Host "`n📝 Step 6: Verify no more pending requests" -ForegroundColor Yellow
try {
    $updatedRequests = Invoke-ApiRequest -Method GET -Endpoint "/users/follow-requests" -Token $tokenB
    $newRequestCount = $updatedRequests.data.requests.Count
    Write-Host "✅ User B now has $newRequestCount pending request(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get updated requests" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

Write-Host "`n📚 To test decline flow, modify the script to use decline endpoint" -ForegroundColor Cyan
Write-Host "   Replace '/follow/accept' with '/follow/decline'" -ForegroundColor Cyan
Write-Host "`n"
