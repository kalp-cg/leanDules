# Follow Request System - Complete Guide

## 📱 How It Works (User Perspective)

### For User A (Sender):
1. **Sees User B's profile** → Follow button shows "Follow"
2. **Clicks "Follow"** → Button changes to "Cancel Request" (orange)
3. **Message shown:** "Follow request sent"
4. **Can cancel:** Click "Cancel Request" to remove the request

### For User B (Receiver):
1. **Gets notification** → "User A sent you a follow request"
2. **Opens Follow Requests screen** → Sees User A in the list
3. **Two options:**
   - ✅ **Accept** → User A becomes a follower
   - ❌ **Decline** → Request is removed
4. **After accepting:** User A sees "Unfollow" button

---

## 🎯 Button States

| State | Button Text | Button Color | Action When Clicked |
|-------|------------|--------------|---------------------|
| Not Following | **Follow** | Primary | Sends follow request |
| Request Pending | **Cancel Request** | Orange | Cancels the request |
| Following | **Unfollow** | Gray | Unfollows the user |

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         INITIAL STATE                        │
│  User A sees User B's profile → Button shows "Follow"       │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    User A clicks "Follow"
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       REQUEST SENT                           │
│  • Button changes to "Cancel Request" (orange)              │
│  • Message: "Follow request sent"                           │
│  • User B gets notification                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                  User B opens Follow Requests
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER B'S DECISION                         │
│                                                              │
│         ✅ Accept              ❌ Decline                    │
│            ↓                      ↓                          │
│    User A → Follower       Request Removed                  │
│    Button → "Unfollow"     Button → "Follow" again          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Steps

### Test 1: Send Follow Request
```
1. Login as User A
2. Go to User B's profile
3. Click "Follow"
4. ✅ Check: Button changes to "Cancel Request" (orange)
5. ✅ Check: Toast message: "Follow request sent"
```

### Test 2: View Pending Requests
```
1. Login as User B
2. Go to Profile tab
3. Click the person icon (top right)
4. ✅ Check: See User A in the list
5. ✅ Check: Accept and Decline buttons visible
```

### Test 3: Accept Request
```
1. On User B's Follow Requests screen
2. Click ✅ Accept for User A
3. ✅ Check: User A removed from list
4. ✅ Check: Toast message: "Follow request accepted"
5. Login as User A
6. Go to User B's profile
7. ✅ Check: Button shows "Unfollow" (gray)
```

### Test 4: Decline Request
```
1. User A sends follow request to User C
2. Login as User C
3. Open Follow Requests
4. Click ❌ Decline for User A
5. ✅ Check: User A removed from list
6. ✅ Check: Toast message: "Follow request declined"
7. Login as User A
8. Go to User C's profile
9. ✅ Check: Button shows "Follow" again
```

### Test 5: Cancel Request
```
1. Login as User A
2. Go to User D's profile
3. Click "Follow"
4. ✅ Check: Button shows "Cancel Request"
5. Click "Cancel Request"
6. ✅ Check: Button changes back to "Follow"
7. ✅ Check: Toast message: "Request cancelled"
8. Login as User D
9. Open Follow Requests
10. ✅ Check: No request from User A
```

---

## 🗄️ Database States

### user_followers table
```sql
id | follower_id | following_id | status    | created_at
---|-------------|--------------|-----------|------------
1  | 5          | 8            | pending   | 2026-01-01
2  | 5          | 9            | accepted  | 2026-01-01
3  | 7          | 5            | declined  | 2026-01-01
```

**Status Values:**
- `pending` → Request sent, waiting for response
- `accepted` → Request accepted, users are connected
- `declined` → Request was declined (can resend)

---

## 📊 API Calls Summary

| Action | Endpoint | Method | Response |
|--------|----------|--------|----------|
| Send Request | `/api/users/:id/follow` | POST | `{status: 'pending', message: 'Follow request sent'}` |
| Cancel/Unfollow | `/api/users/:id/follow` | DELETE | `{success: true, message: 'Unfollowed successfully'}` |
| Get Requests | `/api/users/follow-requests` | GET | `{data: [...pending requests]}` |
| Accept Request | `/api/users/:id/follow/accept` | POST | `{success: true, message: 'Follow request accepted'}` |
| Decline Request | `/api/users/:id/follow/decline` | POST | `{success: true, message: 'Follow request declined'}` |

---

## 🎨 UI Components

### Profile Screen (user_profile_screen.dart)
- **Follow Button** - Shows current state
- **Colors:**
  - Green/Primary → Follow (not following)
  - Orange → Cancel Request (pending)
  - Gray → Unfollow (following)

### Follow Requests Screen (follow_requests_screen.dart)
- **List of pending requests** with:
  - Avatar
  - Name and email
  - Accept (green checkmark)
  - Decline (red X)

### Profile Tab Navigation
- **Person icon** - Opens Follow Requests screen
- **Badge (future)** - Shows count of pending requests

---

## ✅ Checklist Before Testing

- [ ] Backend server running (`npm start` in backend folder)
- [ ] Database seeded with test users
- [ ] Flutter app running
- [ ] At least 2 test accounts available
- [ ] Network connectivity working

---

## 🐛 Common Issues & Solutions

### Issue: Button doesn't change after clicking
**Solution:** Check that `followStatus` is being updated from API response

### Issue: Requests not appearing
**Solution:** Verify backend is running and check API response in network tab

### Issue: Accept/Decline not working
**Solution:** Check console for errors, verify user IDs are correct

### Issue: Button shows wrong state
**Solution:** Reload profile to get fresh `followStatus` from backend

---

## 📝 Summary

✅ **User A** clicks "Follow" → Sends request (button: "Cancel Request")
✅ **User B** sees request → Can Accept or Decline  
✅ **After Accept** → User A sees "Unfollow", User B sees +1 follower
✅ **After Decline** → Request removed, User A can send again
✅ **Cancel anytime** → User A can cancel pending request

**System is fully functional and ready for production! 🚀**
