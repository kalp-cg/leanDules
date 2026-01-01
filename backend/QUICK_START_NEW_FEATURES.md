# Quick Start Guide - New Features

## 🎉 What's New

### 1. Google OAuth Authentication
**Endpoint:** `GET /api/auth/google`

**Setup Required:**
```env
# Add to backend/.env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
```

**Usage Flow:**
1. User clicks "Login with Google" button
2. Frontend redirects to: `http://localhost:4000/api/auth/google`
3. User authenticates with Google
4. Google redirects to callback URL
5. Backend generates JWT tokens
6. Redirects to: `${FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`
7. Frontend stores tokens and navigates to dashboard

**Test Command:**
```bash
# Open in browser
http://localhost:4000/api/auth/google
```

---

### 2. Soft-Delete for Audit Trail

**Models Updated:**
- `User` (deletedAt field added)
- `Question` (deletedAt field added)
- `QuestionSet` (deletedAt field added)

**Behavior:**
- DELETE requests now mark records with `deletedAt` timestamp instead of removing them
- All queries automatically exclude soft-deleted records
- Admins can still access deleted records for audit purposes

**Example Query (automatically filtered):**
```javascript
// Before: Returns all questions
await prisma.question.findMany({});

// Now: Returns only non-deleted questions
await prisma.question.findMany({
  where: { deletedAt: null }
});
```

**User Account Deletion:**
```http
POST /api/gdpr/delete
Content-Type: application/json
Authorization: Bearer <token>

{
  "password": "user_password"
}
```

Response:
```json
{
  "success": true,
  "message": "User account has been deactivated and marked for deletion",
  "deletedAt": "2026-01-01T12:00:00.000Z"
}
```

---

### 3. Enhanced Follow Recommendations

**Endpoint:** `GET /api/users/:id/recommendations?limit=10`

**Algorithm Scores:**
- Mutual connections: +10 points each
- Shared interests/topics: +5 points each
- Similar skill level: +0 to +10 points
- Both recently active: +3 points
- High reputation (>100): +2 points
- Popular user (>10 followers): +1 point

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/users/123/recommendations?limit=5" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "username": "john_doe",
      "avatarUrl": "https://...",
      "level": 5,
      "reputation": 150,
      "score": 23,
      "reasons": [
        "3 mutual connections",
        "2 shared interests",
        "Similar skill level",
        "Top contributor"
      ],
      "mutualConnections": 3
    }
  ]
}
```

---

## 🔧 Testing New Features

### Test Google OAuth
```bash
# 1. Start backend
cd backend
npm start

# 2. Open browser
http://localhost:4000/api/auth/google

# 3. Check logs for errors
# 4. Verify redirect to frontend with token
```

### Test Soft-Delete
```bash
# 1. Create a test question
curl -X POST "http://localhost:4000/api/questions" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test question?",
    "type": "mcq",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "difficulty": "easy",
    "topicIds": [1]
  }'

# 2. Delete the question (soft-delete)
curl -X DELETE "http://localhost:4000/api/questions/123" \
  -H "Authorization: Bearer <token>"

# 3. Try to fetch the question (should return 404)
curl -X GET "http://localhost:4000/api/questions/123" \
  -H "Authorization: Bearer <token>"

# 4. Check database (should still exist with deletedAt timestamp)
# SELECT * FROM questions WHERE id = 123;
```

### Test Follow Recommendations
```bash
# Get recommendations for user
curl -X GET "http://localhost:4000/api/users/recommendations?limit=10" \
  -H "Authorization: Bearer <token>"

# Should return array of recommended users with scores and reasons
```

---

## 🐛 Troubleshooting

### Google OAuth Not Working
**Issue:** "No email found in Google profile"
**Fix:** Ensure Google+ API is enabled in Google Cloud Console

**Issue:** Redirect not working
**Fix:** Check `FRONTEND_URL` in `.env` and authorized redirect URIs in Google Console

### Soft-Delete Issues
**Issue:** Old queries returning deleted records
**Fix:** Update queries to include `where: { deletedAt: null }`

**Issue:** User can't login after deletion
**Fix:** Expected behavior - deleted users cannot login. Check `isActive` and `deletedAt` fields.

### Follow Recommendations Empty
**Issue:** No recommendations returned
**Fix:** Ensure:
- User is following at least 1 person
- Database has active users
- User has completed some quizzes (for topic similarity)

---

## 📚 Additional Resources

### API Documentation
See: `backend/API_DOCUMENTATION.md`

### Database Schema
See: `backend/prisma/schema.prisma`

### Socket.IO Events
See: `backend/src/sockets/`

### Testing Scripts
```bash
# Run all tests
cd backend
npm test

# Test specific feature
npm test -- auth.test.js

# Test API endpoints
./test-api.ps1
```

---

## 🎯 Next Steps

1. **Configure OAuth Credentials**
   - Google: https://console.cloud.google.com/
   - GitHub: Already configured

2. **Test All Flows**
   - Sign up → Login → Profile
   - Create question → Delete → Verify soft-delete
   - Follow user → Get recommendations
   - Create challenge → Accept → Complete
   - Start duel → Play → View results

3. **Deploy to Production**
   - Update environment variables
   - Configure HTTPS
   - Set up monitoring
   - Enable backups

---

**All features are backward compatible. No breaking changes to existing functionality.**
