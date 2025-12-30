# 📋 Feature Testing Checklist

Use this checklist to systematically test all implemented features.

---

## ✅ Authentication & Account Management

### Email/Password Authentication
- [ ] **Sign Up**
  - [ ] Create new account with valid email/password
  - [ ] Validation: Email format check
  - [ ] Validation: Password min 8 chars, uppercase, lowercase, number
  - [ ] Error: Duplicate email rejected
  - [ ] Error: Duplicate username rejected
  - [ ] Success: Automatically logged in after signup

- [ ] **Login**
  - [ ] Login with correct credentials
  - [ ] Error: Wrong password shows error
  - [ ] Error: Non-existent email shows error
  - [ ] Remember session (token persists after app restart)

- [ ] **Forgot Password**
  - [ ] Enter email → Shows success message
  - [ ] Backend sends reset token (check console/logs)
  - [ ] Invalid email shows appropriate message

- [ ] **Reset Password**
  - [ ] Use reset token to set new password
  - [ ] Validation: New password meets requirements
  - [ ] Validation: Confirm password matches
  - [ ] Can login with new password
  - [ ] Old password no longer works

### Google OAuth
- [ ] **Google Sign-In Button**
  - [ ] Button appears on login screen
  - [ ] Clicking opens Google account picker
  - [ ] Selecting account logs you in
  - [ ] Creates new user if first time
  - [ ] Returns to existing user if already registered

### Session Management
- [ ] **Token Refresh**
  - [ ] Access token refreshes automatically when expired
  - [ ] Can continue using app without re-login

- [ ] **Logout**
  - [ ] Logout button removes tokens
  - [ ] Redirects to login screen
  - [ ] Cannot access protected routes after logout

---

## ✅ Quiz System

### Quiz Creation
- [ ] **Create Quiz Form**
  - [ ] Navigate to "Create Quiz" screen
  - [ ] Enter title (required)
  - [ ] Enter description (optional)
  - [ ] Select topic from dropdown
  - [ ] Select visibility (PUBLIC/PRIVATE)
  
- [ ] **Add Questions**
  - [ ] Tap "Add Question" button
  - [ ] Create question with 4 options
  - [ ] Mark correct answer
  - [ ] Select difficulty level
  - [ ] Question appears in list
  - [ ] Can add multiple questions (minimum 2)

- [ ] **Publish Quiz**
  - [ ] Validation: At least 1 question required
  - [ ] Validation: Topic required
  - [ ] Success message shown
  - [ ] Quiz appears in "My Quizzes" → Created tab

### Quiz Playing
- [ ] **Start Quiz**
  - [ ] Tap quiz from Home screen
  - [ ] Tap quiz from Explore screen
  - [ ] Quiz screen loads with first question
  
- [ ] **Answer Questions**
  - [ ] Can select an option (highlights)
  - [ ] Can change selection before submitting
  - [ ] "Submit" button submits answer
  - [ ] "Skip" button skips question
  - [ ] Progress indicator shows question number
  - [ ] Timer counts down (if enabled)

- [ ] **Quiz Results**
  - [ ] Score displayed (e.g., 8/10)
  - [ ] Percentage shown
  - [ ] Correct/incorrect answers highlighted
  - [ ] Can review answers
  - [ ] "Retake Quiz" button works
  - [ ] XP/points awarded

### My Quizzes
- [ ] **Created Tab**
  - [ ] Shows user's created quizzes
  - [ ] Displays status (Published/Draft)
  - [ ] Shows play count
  - [ ] Can tap to edit/view

- [ ] **Saved Tab**
  - [ ] Shows bookmarked quizzes
  - [ ] Can unbookmark quiz
  - [ ] Can play saved quiz

- [ ] **Completed Tab**
  - [ ] Shows completed quizzes
  - [ ] Displays score achieved
  - [ ] Shows completion date
  - [ ] Can tap to review

---

## ✅ Challenge System

### Create Challenge
- [ ] **Challenge Screen**
  - [ ] Navigate to "Create Challenge"
  - [ ] Select opponent (user search)
  - [ ] Select quiz/question set
  - [ ] Choose challenge type:
    - [ ] Async (take turns)
    - [ ] Instant (real-time)
  
- [ ] **Send Challenge**
  - [ ] Validation: Opponent selected
  - [ ] Validation: Quiz selected
  - [ ] Success: Challenge sent notification
  - [ ] Appears in opponent's "Pending" challenges

### Accept/Decline Challenge
- [ ] **Pending Challenges**
  - [ ] Shows incoming challenges
  - [ ] Displays opponent name & avatar
  - [ ] Shows quiz topic
  - [ ] "Accept" button works
  - [ ] "Decline" button removes challenge

- [ ] **Active Challenges (Async)**
  - [ ] Challenge moves to "Active" after accept
  - [ ] Can take quiz at any time
  - [ ] Score submitted after completion
  - [ ] Opponent notified when you finish

### Challenge Results
- [ ] **Completed Challenges**
  - [ ] Shows final scores
  - [ ] Displays "Won" or "Lost" badge
  - [ ] Shows both players' scores
  - [ ] Can view detailed results
  - [ ] XP/rating updated

---

## ✅ Real-time Duels (Instant Mode)

### WebSocket Connection
- [ ] **Socket Connection**
  - [ ] Connects automatically when app opens
  - [ ] Shows connection status
  - [ ] Reconnects if dropped

### Live Duel
- [ ] **Start Duel**
  - [ ] Both players see "Waiting for opponent"
  - [ ] Duel starts when both ready
  - [ ] Same questions for both players
  
- [ ] **Real-time Updates**
  - [ ] See opponent's progress
  - [ ] Live scoreboard updates
  - [ ] Opponent's answer speed shown
  
- [ ] **Duel Completion**
  - [ ] Winner announced immediately
  - [ ] Final scores displayed
  - [ ] Rating change shown (+/- points)

---

## ✅ Social Features

### User Profiles
- [ ] **View Profile**
  - [ ] Tap user avatar anywhere
  - [ ] Shows user stats (Level, XP, Rating)
  - [ ] Shows Followers/Following count
  - [ ] Shows quizzes completed
  - [ ] Displays bio

### Follow/Unfollow
- [ ] **Follow User**
  - [ ] Tap "Follow" button
  - [ ] Button changes to "Unfollow"
  - [ ] Follower count increases
  - [ ] Appears in "Following" list
  
- [ ] **Unfollow User**
  - [ ] Tap "Unfollow" button
  - [ ] Button changes to "Follow"
  - [ ] Follower count decreases
  - [ ] Removed from "Following" list

### User Search
- [ ] **Search**
  - [ ] Search bar in Explore screen
  - [ ] Type username or name
  - [ ] Results appear as you type
  - [ ] Tap result to view profile

### Followers/Following Lists
- [ ] **View Lists**
  - [ ] Tap follower count on profile
  - [ ] Shows list of followers
  - [ ] Tap following count
  - [ ] Shows list of following
  - [ ] Can tap user to view their profile

---

## ✅ Leaderboard

### Global Leaderboard
- [ ] **View Leaderboard**
  - [ ] Accessible from Explore tab
  - [ ] Shows top users by rating
  - [ ] Displays rank, username, XP, rating
  - [ ] Shows your rank (highlighted)

### Topic Leaderboards
- [ ] **Filter by Topic**
  - [ ] Select topic from dropdown
  - [ ] Leaderboard updates
  - [ ] Shows top users for that topic

### Time Periods
- [ ] **Filter by Time**
  - [ ] Daily leaderboard
  - [ ] Weekly leaderboard
  - [ ] Monthly leaderboard
  - [ ] All-time leaderboard

---

## ✅ Notifications

### In-App Notifications
- [ ] **Notification Badge**
  - [ ] Red badge shows unread count
  - [ ] Appears on tab bar
  
- [ ] **Notification List**
  - [ ] Tap bell icon to view
  - [ ] Shows challenge invites
  - [ ] Shows quiz completions
  - [ ] Shows follower updates
  - [ ] Tap to navigate to relevant screen

### Mark as Read
- [ ] **Read Notifications**
  - [ ] Tap notification marks as read
  - [ ] Badge count decreases
  - [ ] Read notifications appear dimmed

---

## ✅ Home Screen

### Quick Start Quizzes
- [ ] **Recommended Quizzes**
  - [ ] Shows 3 suggested quizzes
  - [ ] Displays difficulty badge
  - [ ] Shows question count
  - [ ] Tap to start quiz

### Recent Activity
- [ ] **Activity Feed**
  - [ ] Shows recent challenges
  - [ ] Shows quiz completions
  - [ ] Shows new followers
  - [ ] Relative timestamps (e.g., "2h ago")

---

## ✅ Explore Screen

### Search
- [ ] **Search Bar**
  - [ ] Search for quizzes
  - [ ] Search for topics
  - [ ] Search for users
  - [ ] Results categorized

### Popular Topics
- [ ] **Topic Pills**
  - [ ] Shows trending topics
  - [ ] Tap to filter quizzes
  - [ ] Shows topic emoji/icon

### Trending Quizzes
- [ ] **Quiz List**
  - [ ] Shows popular quizzes
  - [ ] Displays rating (stars)
  - [ ] Shows play count
  - [ ] Tap to view/start quiz

---

## ✅ Profile Screen

### My Profile
- [ ] **Profile Info**
  - [ ] Shows avatar
  - [ ] Shows username & full name
  - [ ] Shows bio
  
- [ ] **Stats Grid**
  - [ ] Level displayed
  - [ ] XP count
  - [ ] Followers count
  - [ ] Following count

### Edit Profile
- [ ] **Edit Button**
  - [ ] Opens edit screen
  - [ ] Can update username
  - [ ] Can update bio
  - [ ] Can change avatar (if implemented)
  - [ ] Save button updates profile

### Recent Quizzes
- [ ] **Quiz History**
  - [ ] Shows last 3 quizzes taken
  - [ ] Displays scores
  - [ ] "See all" link to full history

### Logout
- [ ] **Logout Button**
  - [ ] Confirmation dialog appears
  - [ ] Logs out and clears session
  - [ ] Returns to login screen

---

## 🐛 Error Handling

### Network Errors
- [ ] **Offline Mode**
  - [ ] Shows error when no internet
  - [ ] Retry button works
  - [ ] App doesn't crash

### API Errors
- [ ] **Server Errors**
  - [ ] 500 errors show user-friendly message
  - [ ] 404 errors handled gracefully
  - [ ] 401 errors redirect to login

### Validation Errors
- [ ] **Form Validation**
  - [ ] Required fields marked
  - [ ] Error messages displayed inline
  - [ ] Can't submit with invalid data

---

## 📱 UI/UX

### Loading States
- [ ] **Spinners**
  - [ ] Loading indicators show during API calls
  - [ ] Buttons show loading state
  - [ ] Skeleton screens for lists (optional)

### Responsive Design
- [ ] **Different Screen Sizes**
  - [ ] Works on small phones (5")
  - [ ] Works on tablets
  - [ ] Works on web browser

### Dark Theme
- [ ] **Theme Colors**
  - [ ] Midnight black background
  - [ ] Burnished gold accents
  - [ ] Text readable (high contrast)
  - [ ] Cards have proper elevation

---

## 🎯 Performance

### App Performance
- [ ] **Smooth Scrolling**
  - [ ] Lists scroll without jank
  - [ ] Images load progressively
  - [ ] No memory leaks (test by navigating multiple times)

### Backend Performance
- [ ] **API Response Times**
  - [ ] Login < 1 second
  - [ ] Quiz loading < 2 seconds
  - [ ] Leaderboard < 3 seconds

---

## ✅ Security

### Authentication
- [ ] **Token Security**
  - [ ] Tokens stored securely
  - [ ] Refresh token rotation works
  - [ ] Expired tokens handled

### Data Privacy
- [ ] **User Data**
  - [ ] Can't view other users' email
  - [ ] Can't access unauthorized quizzes
  - [ ] Private quizzes stay private

---

## 📊 Progress Tracking

- **Total Features:** 50+
- **Critical Features:** 30
- **Nice-to-Have Features:** 20+

**Mark each item as you test it!**

---

**Testing Tips:**
1. Test on both Android & iOS (if possible)
2. Test with different user accounts
3. Test with slow internet (use network throttling)
4. Test edge cases (empty states, max limits)
5. Test error scenarios (wrong credentials, expired tokens)

---

**Found a bug?**
- Note the steps to reproduce
- Check console logs
- Check backend logs in `backend/logs/`
- Create an issue or fix it!

Good luck! 🚀
