# LearnDuels System Audit - PRD Compliance Check

**Date:** December 11, 2025  
**Status:** Analyzing existing system vs PRD requirements

---

## ✅ IMPLEMENTED (Working)

### Auth & Accounts
- ✅ Email/password authentication (JWT-based)
- ✅ Google OAuth (90% complete - fixing redirect)
- ✅ User profiles with avatarUrl
- ❌ Bio field missing
- ❌ XP/Level system missing (only rating exists)

### Database Models
- ✅ User model with ratings
- ✅ Question model (MCQ)
- ✅ Category/Difficulty models
- ✅ Duel system (instant duels)
- ✅ Follow system (UserFollower)
- ✅ Leaderboard
- ✅ Notifications
- ✅ Reports/Moderation

### Backend Routes
- ✅ Auth routes
- ✅ User routes
- ✅ Question routes
- ✅ Duel routes
- ✅ Leaderboard routes
- ✅ Google OAuth routes

---

## ❌ MISSING FROM PRD (Must Build)

### Core Features Missing

#### 1. **Topics vs Categories**
- **Current:** Categories (flat structure)
- **PRD Requires:** Topics with `parentId` (hierarchical)
- **Action:** Rename Category → Topic, add parentId

#### 2. **Question Fields Missing**
- ❌ `explanation` field
- ❌ `timeLimit` field
- ❌ `status` (draft/pending/published)
- ❌ `reputation` system for authors
- ❌ Multiple topic tags (currently 1 category only)

#### 3. **QuestionSet/Quiz Model**
- ❌ Model doesn't exist
- **PRD Requires:** Saved question sets with visibility control
- **Action:** Create QuestionSet model

#### 4. **Challenge Model (Async + Instant)**
- **Current:** Only Duel model (instant)
- **PRD Requires:** 
  - Separate Challenge model
  - Type: async/instant
  - Settings object
  - Result tracking
- **Action:** Create Challenge model, keep Duel for real-time

#### 5. **Attempt/Result Model**
- ❌ Doesn't exist (only DuelAnswer)
- **PRD Requires:** Generic attempt tracking for quizzes
- **Action:** Create Attempt model

#### 6. **User Profile Fields**
- ❌ `bio` missing
- ❌ `xp` missing
- ❌ `level` missing
- ❌ `reputation` missing
- ❌ `followersCount` missing
- ❌ `followingCount` missing

#### 7. **Leaderboard Enhancement**
- **Current:** Global only
- **PRD Requires:** Topic-specific + period filtering
- **Action:** Add topicId, period fields

#### 8. **Admin Features**
- ❌ Flagging system missing
- ❌ Moderation queue missing
- **Current:** Only basic reports
- **Action:** Add Flag model, moderation endpoints

#### 9. **Analytics**
- ❌ No analytics models/endpoints
- **PRD Requires:** DAU, challenge acceptance rate, completion rate
- **Action:** Create Analytics service

---

## 🗑️ TO REMOVE (Not in PRD)

### Models to Remove
1. ❌ **SubscriptionPlan** - Not in PRD
2. ❌ **UserSubscription** - Not in PRD
3. ❌ **Session** - Can use JWT only (PRD doesn't mention)

### Routes to Remove
1. ❌ `/api/quiz` routes - PRD uses "QuestionSet" not "Quiz"
2. ❌ `/api/challenge` routes - Need to rebuild according to PRD spec
3. ❌ Subscription-related endpoints

---

## 🔄 TO REFACTOR

### 1. Question Model → PRD Spec
```prisma
model Question {
  id              Int      @id @default(autoincrement())
  authorId        Int
  topicIds        Int[]    // Array of topic IDs
  difficulty      String   // easy/medium/hard
  type            String   @default("mcq")
  content         String   // Question text
  options         Json     // Array of options
  correctAnswer   String   
  explanation     String?  
  timeLimit       Int      @default(30)
  status          String   @default("draft") // draft/pending/published
  createdAt       DateTime @default(now())
}
```

### 2. Topic Model (rename Category)
```prisma
model Topic {
  id        Int     @id @default(autoincrement())
  name      String
  parentId  Int?    // For hierarchical topics
}
```

### 3. Challenge Model (New)
```prisma
model Challenge {
  id              Int      @id @default(autoincrement())
  challengerId    Int
  opponentIds     Int[]
  questionSetId   Int?
  type            String   // "async" | "instant"
  settings        Json     // { numQuestions, difficulty, etc }
  status          String   @default("pending")
  results         Json[]
  createdAt       DateTime @default(now())
}
```

### 4. QuestionSet Model (New)
```prisma
model QuestionSet {
  id          Int      @id @default(autoincrement())
  name        String
  authorId    Int
  questionIds Int[]
  visibility  String   @default("private") // private/public
  createdAt   DateTime @default(now())
}
```

### 5. User Model → Add PRD Fields
```prisma
model User {
  // Add:
  bio             String?
  xp              Int      @default(0)
  level           Int      @default(1)
  reputation      Int      @default(0)
  followersCount  Int      @default(0)
  followingCount  Int      @default(0)
}
```

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Database Schema Refactor (Priority 1)
1. Backup current database
2. Remove: SubscriptionPlan, UserSubscription, Session models
3. Update User model (add bio, xp, level, reputation, follower counts)
4. Rename Category → Topic, add parentId
5. Update Question model (add explanation, timeLimit, status, topicIds[])
6. Create QuestionSet model
7. Create Challenge model (separate from Duel)
8. Create Attempt model
9. Update Leaderboard (add topicId, period)
10. Generate migration

### Phase 2: Backend Services (Priority 2)
1. Update auth.service.js (OAuth complete)
2. Create topic.service.js (hierarchical topics)
3. Refactor question.service.js (new fields + moderation)
4. Create questionSet.service.js
5. Create challenge.service.js (async + instant)
6. Update duel.service.js (use new Challenge model)
7. Create attempt.service.js
8. Update leaderboard.service.js (topic + period filtering)
9. Create admin.service.js (moderation queue)
10. Create analytics.service.js (DAU, rates)

### Phase 3: API Routes (Priority 3)
1. Remove: quiz.routes.js, subscription routes
2. Update: auth.routes.js (complete OAuth)
3. Create: topic.routes.js (CRUD + hierarchy)
4. Update: question.routes.js (moderation flow)
5. Create: questionSet.routes.js
6. Refactor: challenge.routes.js (async + instant)
7. Update: duel.routes.js (integrate with Challenge)
8. Update: leaderboard.routes.js (filtering)
9. Create: admin.routes.js (flags, moderation queue)
10. Create: analytics.routes.js

### Phase 4: Real-time (Socket.IO) (Priority 4)
1. Update duel.socket.js → challenge.socket.js
2. Add events: invite, inviteAccepted, startDuel, answer, duelResult
3. Add spectator support (optional)
4. Implement reconnect logic

### Phase 5: Frontend Refactor (Priority 5)
1. Update auth screens (complete OAuth flow)
2. Create follow system UI
3. Create quiz/question set builder
4. Create async challenge UI
5. Update instant duel UI
6. Create topic-based leaderboards
7. Add admin moderation UI

---

## 🎯 NEXT IMMEDIATE ACTIONS

### Right Now:
1. ✅ Finish Google OAuth redirect fix
2. Create database migration plan document
3. Backup current database
4. Start Phase 1 schema refactor

### This Session:
- Complete OAuth (5 min)
- Remove unwanted models (10 min)
- Add missing User fields (10 min)
- Create new models (Challenge, QuestionSet, Attempt) (20 min)
- Generate migration (5 min)
- Test migration (10 min)

**Total estimated time:** ~1 hour for backend schema

---

## ⚠️ RISKS & CONSIDERATIONS

1. **Data Migration:** Existing duels/questions need careful migration
2. **Breaking Changes:** Frontend will need updates after schema changes
3. **OAuth In Progress:** Complete before major refactoring
4. **Testing:** Each phase needs thorough testing

---

**Ready to proceed with Phase 1?**
