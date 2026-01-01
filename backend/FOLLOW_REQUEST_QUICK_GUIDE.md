# 🎯 Follow Request System - Quick Reference

## ✨ What It Does

The follow request system allows users to:
1. **Send** follow requests to other users
2. **Receive** requests and get notifications
3. **Accept** or **Reject** incoming requests

## 🔄 Complete Flow

```
┌─────────┐                           ┌─────────┐
│ User A  │                           │ User B  │
└────┬────┘                           └────┬────┘
     │                                     │
     │  POST /users/:id/follow             │
     ├────────────────────────────────────>│
     │                                     │
     │                          Receives   │
     │                          Notification
     │                                     │
     │  GET /users/follow-requests         │
     │<────────────────────────────────────┤
     │                                     │
     │  Returns pending requests           │
     ├────────────────────────────────────>│
     │                                     │
     │  POST /users/:id/follow/accept      │
     │<────────────────────────────────────┤
     │                                     │
     │  Receives                           │
     │  Notification                       │
     │                                     │
```

## 📝 API Endpoints Summary

| Action | Method | Endpoint | Who Calls |
|--------|--------|----------|-----------|
| Send request | POST | `/api/users/:id/follow` | User A |
| View requests | GET | `/api/users/follow-requests` | User B |
| Accept request | POST | `/api/users/:id/follow/accept` | User B |
| Reject request | POST | `/api/users/:id/follow/decline` | User B |
| Unfollow/Cancel | DELETE | `/api/users/:id/follow` | Either |

## 🧪 Quick Test

### Option 1: Using PowerShell Script
```powershell
cd backend
.\test-follow-requests.ps1
```

### Option 2: Using Node.js Script
```bash
cd backend
node test-follow-requests.js
```

### Option 3: Manual curl
```bash
# 1. Login as User A
TOKEN_A=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# 2. Login as User B  
TOKEN_B=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# 3. User A sends follow request to User B (ID: 2)
curl -X POST http://localhost:3000/api/users/2/follow \
  -H "Authorization: Bearer $TOKEN_A"

# 4. User B checks pending requests
curl http://localhost:3000/api/users/follow-requests \
  -H "Authorization: Bearer $TOKEN_B"

# 5. User B accepts request from User A (ID: 1)
curl -X POST http://localhost:3000/api/users/1/follow/accept \
  -H "Authorization: Bearer $TOKEN_B"
```

## 📊 Database Status Table

| Field | Values | Description |
|-------|--------|-------------|
| `status` | `pending` | Request sent, waiting for response |
| | `accepted` | Request accepted, users now following |
| | `declined` | Request rejected |

## 🔔 Notifications

### When Request is Sent
- **Recipient:** User B
- **Type:** `follow_request`
- **Message:** "John Doe sent you a follow request"

### When Request is Accepted
- **Recipient:** User A
- **Type:** `follow_accepted`
- **Message:** "Jane Smith accepted your follow request"

## 🎯 Key Features

✅ **Pending Status:** Requests stay pending until accepted/declined
✅ **Real-time Notifications:** Instant WebSocket notifications
✅ **Resend After Decline:** Can send again after rejection
✅ **No Self-Follow:** Cannot follow yourself
✅ **Duplicate Prevention:** One relationship per user pair
✅ **Pagination Support:** Handle many requests efficiently

## 📁 Files Involved

- **Schema:** `backend/prisma/schema.prisma`
- **Service Logic:** `backend/src/services/user.service.js`
- **API Handlers:** `backend/src/controllers/user.controller.js`
- **Routes:** `backend/src/routes/user.routes.js`
- **Test Scripts:** 
  - `backend/test-follow-requests.js`
  - `backend/test-follow-requests.ps1`
- **Documentation:** `backend/FOLLOW_REQUEST_API.md`

## 🐛 Troubleshooting

### "User not found"
- Ensure test users exist in database
- Check user IDs are correct

### "Follow request already sent"
- Request is still pending
- Check `/users/follow-requests` to see existing requests

### "Follow request not found"
- Request may have been already accepted/declined
- User ID mismatch in accept/decline endpoint

### No notifications received
- Check WebSocket connection
- Verify notification service is running
- Check socket configuration

## 💡 Usage Examples

### Frontend Integration

```javascript
// Send follow request
async function sendFollowRequest(userId) {
  const response = await fetch(`/api/users/${userId}/follow`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Get pending requests
async function getPendingRequests() {
  const response = await fetch('/api/users/follow-requests', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Accept request
async function acceptRequest(userId) {
  const response = await fetch(`/api/users/${userId}/follow/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Decline request
async function declineRequest(userId) {
  const response = await fetch(`/api/users/${userId}/follow/decline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}
```

## 🚀 Next Steps

1. Test the API endpoints with the provided scripts
2. Check database for follow relationships
3. Verify notifications are being sent
4. Integrate with frontend application
5. Add UI components for follow requests

---

**Full Documentation:** See `FOLLOW_REQUEST_API.md` for complete API reference
