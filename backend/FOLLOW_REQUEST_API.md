# Follow Request System API Documentation

## Overview
The follow request system allows users to send follow requests to other users, who can then accept or reject them. This creates a controlled way for users to build their network within the application.

## Workflow

```
User A                          User B
   |                               |
   |------ Send Follow Request --->|
   |                               |
   |                               |<--- Receives Notification
   |                               |
   |                               |<--- Checks Pending Requests
   |                               |
   |<----- Accept/Reject Request --|
   |                               |
   |<--- Receives Notification ----|
```

## API Endpoints

### 1. Send Follow Request

**Endpoint:** `POST /api/users/:id/follow`

**Description:** Sends a follow request to another user

**Authentication:** Required

**Parameters:**
- `id` (path parameter): The ID of the user to follow

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Follow request sent successfully",
  "data": {
    "success": true,
    "message": "Follow request sent"
  }
}
```

**Response (Error - 409 Conflict):**
```json
{
  "status": "error",
  "message": "Follow request already sent"
}
```

---

### 2. Get Pending Follow Requests

**Endpoint:** `GET /api/users/follow-requests`

**Description:** Get all pending follow requests for the authenticated user

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Request Example:**
```bash
curl http://localhost:3000/api/users/follow-requests?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Follow requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": 5,
        "fullName": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "https://example.com/avatar.jpg",
        "rating": 1450
      },
      {
        "id": 8,
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "avatarUrl": null,
        "rating": 1200
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Accept Follow Request

**Endpoint:** `POST /api/users/:id/follow/accept`

**Description:** Accept a follow request from another user

**Authentication:** Required

**Parameters:**
- `id` (path parameter): The ID of the user who sent the follow request

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/users/5/follow/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Follow request accepted",
  "data": {
    "success": true,
    "message": "Follow request accepted"
  }
}
```

**Response (Error - 404 Not Found):**
```json
{
  "status": "error",
  "message": "Follow request not found"
}
```

---

### 4. Decline Follow Request

**Endpoint:** `POST /api/users/:id/follow/decline`

**Description:** Decline a follow request from another user

**Authentication:** Required

**Parameters:**
- `id` (path parameter): The ID of the user who sent the follow request

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/users/5/follow/decline \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Follow request declined",
  "data": {
    "success": true,
    "message": "Follow request declined"
  }
}
```

**Response (Error - 404 Not Found):**
```json
{
  "status": "error",
  "message": "Follow request not found"
}
```

---

### 5. Unfollow User / Cancel Follow Request

**Endpoint:** `DELETE /api/users/:id/follow`

**Description:** Unfollow a user or cancel a pending follow request

**Authentication:** Required

**Parameters:**
- `id` (path parameter): The ID of the user to unfollow

**Request Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Unfollowed successfully",
  "data": {
    "success": true,
    "message": "Unfollowed successfully"
  }
}
```

---

## Database Schema

The follow request system uses the `user_followers` table:

```sql
CREATE TABLE user_followers (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);
```

**Status Values:**
- `pending`: Follow request has been sent but not yet accepted
- `accepted`: Follow request has been accepted
- `declined`: Follow request has been declined

---

## Real-time Notifications

When a follow request is sent or accepted, real-time notifications are sent via WebSocket:

### Follow Request Notification
```json
{
  "type": "follow_request",
  "message": "John Doe sent you a follow request",
  "followerId": 5
}
```

### Follow Accepted Notification
```json
{
  "type": "follow_accepted",
  "message": "Jane Smith accepted your follow request",
  "userId": 8
}
```

---

## Testing the System

### Using the Test Script

1. **Test Accept Flow:**
```bash
cd backend
node test-follow-requests.js
```

2. **Test Decline Flow:**
```bash
node test-follow-requests.js decline
```

### Manual Testing with curl

**Step 1: Login as User A**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'
```

**Step 2: Login as User B**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"password123"}'
```

**Step 3: User A sends follow request to User B**
```bash
curl -X POST http://localhost:3000/api/users/2/follow \
  -H "Authorization: Bearer USER_A_TOKEN"
```

**Step 4: User B checks pending requests**
```bash
curl http://localhost:3000/api/users/follow-requests \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Step 5: User B accepts the request**
```bash
curl -X POST http://localhost:3000/api/users/1/follow/accept \
  -H "Authorization: Bearer USER_B_TOKEN"
```

---

## Error Codes

| Status Code | Message | Description |
|------------|---------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid request parameters (e.g., trying to follow yourself) |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | User or follow request not found |
| 409 | Conflict | Follow request already exists or user already followed |
| 500 | Internal Server Error | Server error occurred |

---

## Business Rules

1. **Cannot Follow Yourself:** Users cannot send follow requests to themselves
2. **Unique Relationships:** Only one follow relationship can exist between two users at a time
3. **Pending Limit:** No limit on pending follow requests
4. **After Decline:** Users can resend follow requests after being declined
5. **Notifications:** 
   - User B receives a notification when User A sends a follow request
   - User A receives a notification when User B accepts the request
   - No notification is sent when a request is declined
6. **Counts:** 
   - Follower/following counts are only updated when a request is accepted
   - Pending requests don't affect these counts

---

## Implementation Files

1. **Schema:** `backend/prisma/schema.prisma` - UserFollower model
2. **Service:** `backend/src/services/user.service.js` - Follow request logic
3. **Controller:** `backend/src/controllers/user.controller.js` - API handlers
4. **Routes:** `backend/src/routes/user.routes.js` - API endpoints
5. **Test:** `backend/test-follow-requests.js` - Test script

---

## Future Enhancements

- [ ] Block users from sending follow requests
- [ ] Bulk accept/decline follow requests
- [ ] Follow request expiration
- [ ] Mutual follow suggestions
- [ ] Privacy settings (auto-accept from certain users)
