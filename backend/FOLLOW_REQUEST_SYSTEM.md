# Follow Request System - Implementation Guide

## Overview
The follow system has been upgraded to a **follow request system** where users must accept or decline follow requests before becoming followers.

## Features
✅ **Send Follow Request** - Users send follow requests instead of instantly following
✅ **Accept/Decline** - Recipients can accept or decline requests
✅ **Real-time Notifications** - Users get notified via socket.io
✅ **Status Tracking** - Track pending/accepted/declined states
✅ **Resend After Decline** - Can resend requests after being declined

## API Endpoints

### 1. Send Follow Request
```http
POST /api/users/:id/follow
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request sent"
}
```

### 2. Accept Follow Request
```http
POST /api/users/:id/follow/accept
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request accepted"
}
```

### 3. Decline Follow Request
```http
POST /api/users/:id/follow/decline
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request declined"
}
```

### 4. Get Pending Follow Requests
```http
GET /api/users/follow-requests?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow requests retrieved successfully",
  "data": [
    {
      "id": 123,
      "fullName": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "rating": 1500
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 5. Unfollow User / Cancel Request
```http
DELETE /api/users/:id/follow
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Unfollowed successfully"
}
```

### 6. Get Followers (Only Accepted)
```http
GET /api/users/:id/followers?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Followers retrieved successfully",
  "data": [...]
}
```

### 7. Get Following (Only Accepted)
```http
GET /api/users/:id/following?page=1&limit=20
Authorization: Bearer <token>
```

## Database Schema

### UserFollower Model
```prisma
model UserFollower {
  id          Int      @id @default(autoincrement())
  followerId  Int      @map("follower_id")
  followingId Int      @map("following_id")
  status      String   @default("pending") @db.VarChar(20)  // NEW FIELD
  createdAt   DateTime @default(now()) @map("created_at")
  
  follower    User     @relation("UserFollowers", fields: [followerId])
  following   User     @relation("UserFollowing", fields: [followingId])
  
  @@unique([followerId, followingId])
  @@map("user_followers")
}
```

### Status Values
- `"pending"` - Follow request sent, awaiting response
- `"accepted"` - Follow request accepted, users are now connected
- `"declined"` - Follow request declined (can be resent)

## Notifications

### Follow Request Notification
Sent when someone sends a follow request:
```javascript
{
  type: 'follow_request',
  message: 'John Doe sent you a follow request',
  data: {
    followerId: 123,
    followerName: 'John Doe',
    followerEmail: 'john@example.com'
  }
}
```

### Follow Accepted Notification
Sent when someone accepts your follow request:
```javascript
{
  type: 'follow_accepted',
  message: 'Jane Smith accepted your follow request',
  data: {
    userId: 456
  }
}
```

## Migration Instructions

### Step 1: Update Database Schema
```bash
cd backend
npx prisma migrate dev --name add_follow_request_system
```

### Step 2: Run SQL Migration (Alternative)
```bash
psql -d your_database -f prisma/migrations/add_follow_request_system.sql
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart Server
```bash
npm restart
# or
pm2 restart all
```

## Frontend Integration

### User Profile - Follow Status
```javascript
// User profile now includes followStatus
{
  id: 123,
  fullName: "John Doe",
  isFollowing: false,
  followStatus: "pending" // or "accepted" or null
}
```

### Display Logic
```javascript
if (user.followStatus === 'pending') {
  // Show "Request Sent" or "Cancel Request" button
} else if (user.followStatus === 'accepted') {
  // Show "Following" or "Unfollow" button
} else {
  // Show "Follow" button
}
```

### Accept/Decline UI
```javascript
// In notifications or follow requests screen
followRequests.map(request => (
  <div>
    <h3>{request.fullName}</h3>
    <button onClick={() => acceptRequest(request.id)}>Accept</button>
    <button onClick={() => declineRequest(request.id)}>Decline</button>
  </div>
))
```

## Socket.io Events

### Listen for Follow Request
```javascript
socket.on('notification', (data) => {
  if (data.type === 'follow_request') {
    // Show notification: "X sent you a follow request"
    // Optionally update follow requests count
  }
});
```

### Listen for Follow Accepted
```javascript
socket.on('notification', (data) => {
  if (data.type === 'follow_accepted') {
    // Show notification: "X accepted your follow request"
    // Update following list
  }
});
```

## Error Handling

### Common Errors

**Already Following**
```json
{
  "success": false,
  "message": "Already following this user"
}
```

**Request Already Sent**
```json
{
  "success": false,
  "message": "Follow request already sent"
}
```

**Cannot Follow Yourself**
```json
{
  "success": false,
  "message": "Cannot follow yourself"
}
```

**Request Not Found**
```json
{
  "success": false,
  "message": "Follow request not found"
}
```

## Testing

### Test Follow Flow
```bash
# User A sends follow request to User B
curl -X POST http://localhost:5000/api/users/2/follow \
  -H "Authorization: Bearer USER_A_TOKEN"

# User B gets pending requests
curl -X GET http://localhost:5000/api/users/follow-requests \
  -H "Authorization: Bearer USER_B_TOKEN"

# User B accepts request
curl -X POST http://localhost:5000/api/users/1/follow/accept \
  -H "Authorization: Bearer USER_B_TOKEN"

# Verify followers list (should show User A)
curl -X GET http://localhost:5000/api/users/2/followers \
  -H "Authorization: Bearer USER_B_TOKEN"
```

## Performance Considerations

### Database Indexes
The migration adds indexes for optimal performance:
- `idx_user_followers_status` - For filtering by status
- `idx_user_followers_follower_status` - For user's outgoing requests

### Caching Strategy
Consider caching:
- Follower/following counts
- Pending request counts
- User follow status

## Security Notes

✅ **Authorization**: All endpoints require authentication
✅ **Self-follow Prevention**: Cannot follow yourself
✅ **Duplicate Prevention**: Cannot send multiple pending requests
✅ **Request Validation**: Validates user existence before creating request

## Backward Compatibility

All existing followers are automatically set to `status: 'accepted'` during migration, ensuring:
- No data loss
- Existing functionality preserved
- Seamless upgrade

## Support

For issues or questions:
1. Check server logs: `pm2 logs backend`
2. Verify database migration: `SELECT status FROM user_followers LIMIT 5;`
3. Test socket connection: Check browser console for socket events

---

**Last Updated:** January 1, 2026
**Version:** 1.0.0
