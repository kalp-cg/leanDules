# 🚀 Quick Start Guide - learnDules

## Prerequisites
- ✅ PostgreSQL running on port 5432
- ✅ Node.js v16+ installed
- ✅ Flutter 3.10+ installed
- ✅ Android Studio / Xcode (for mobile testing)

---

## 1. Backend Setup (5 minutes)

```bash
cd backend

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed database with sample data
npx prisma db seed

# Start backend server
npm run dev
```

Backend should now be running at `http://localhost:4000`

### Verify Backend:
```bash
curl http://localhost:4000/health
```

---

## 2. Flutter Setup (3 minutes)

```bash
cd frontend

# Install dependencies
flutter pub get

# Run on Android emulator / iOS simulator
flutter run

# Or run on Chrome (web)
flutter run -d chrome
```

---

## 3. Test User Accounts (Pre-seeded)

```
Email: alice@example.com
Password: password123

Email: bob@example.com
Password: password123

Email: charlie@example.com
Password: password123
```

---

## 4. Key Features to Test

### ✅ Authentication
1. Open app → Login with `alice@example.com` / `password123`
2. Click "Forgot Password?" → Enter email → Check console for reset token
3. Click "Sign Up" → Create new account
4. Click Google Sign-In button (requires Google OAuth setup)

### ✅ Quiz Creation
1. Go to "Quizzes" tab
2. Tap "Create New Quiz"
3. Fill in title, description, select topic
4. Tap "Add Question" → Create at least 2 questions
5. Tap "Publish" to create quiz

### ✅ Quiz Playing
1. Go to "Home" tab
2. Tap any quiz from "Quick Start"
3. Answer questions
4. View results screen

### ✅ Challenges
1. Go to "Challenges" tab
2. Tap "Challenge Someone"
3. Select opponent, quiz, and type
4. Send challenge
5. Accept incoming challenges from other users

### ✅ Social Features
1. Go to "Explore" tab
2. Search for users
3. Tap user profile → View stats
4. Tap "Follow" button
5. Go to "Profile" → View followers/following count

### ✅ Leaderboard
1. Go to "Explore" tab
2. View global leaderboard
3. Filter by topic or time period

---

## 5. Common Issues & Fixes

### Issue: "Connection refused" on Android
**Fix:** Update `api_constants.dart` line 14:
```dart
if (Platform.isAndroid) {
  return 'http://YOUR_IP_ADDRESS:4000/api';
}
```
Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Issue: Google Sign-In not working
**Fix:** 
1. Ensure Google OAuth credentials in `.env`
2. Add SHA-1 to Google Cloud Console:
```bash
cd android
./gradlew signingReport
```

### Issue: Database connection error
**Fix:** 
1. Check PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `backend/.env`
3. Run `npx prisma db push` again

---

## 6. Project Structure

```
learnDules/
├── backend/                 # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Request handlers
│   │   └── sockets/        # WebSocket handlers
│   └── prisma/
│       └── schema.prisma   # Database schema
│
└── frontend/               # Flutter app
    └── lib/
        ├── screens/        # UI screens
        ├── widgets/        # Reusable components
        ├── providers/      # State management (Riverpod)
        ├── core/
        │   ├── services/   # API services
        │   └── theme.dart  # App styling
        └── main.dart       # Entry point
```

---

## 7. Available API Endpoints

**Base URL:** `http://localhost:4000/api`

### Auth
- `POST /auth/login` - Login with email/password
- `POST /auth/signup` - Register new user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/google/mobile` - Google Sign-In (mobile)
- `GET /auth/me` - Get current user

### Quizzes
- `GET /question-sets` - List all quizzes
- `POST /question-sets` - Create new quiz
- `GET /question-sets/:id` - Get quiz details
- `DELETE /question-sets/:id` - Delete quiz

### Challenges
- `POST /challenges` - Create challenge
- `GET /challenges` - List user's challenges
- `POST /challenges/:id/accept` - Accept challenge
- `POST /challenges/:id/submit` - Submit challenge attempt

### Users
- `GET /users/:id` - Get user profile
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get followers list
- `GET /users/:id/following` - Get following list

### Leaderboard
- `GET /leaderboard` - Get global leaderboard
- `GET /leaderboard?topicId=:id` - Topic leaderboard
- `GET /leaderboard?period=weekly` - Time-filtered leaderboard

---

## 8. Development Commands

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm test            # Run tests
npx prisma studio   # Open database GUI
npx prisma migrate dev  # Create new migration
```

### Flutter
```bash
flutter run                    # Run app
flutter build apk --release   # Build Android APK
flutter build ios --release   # Build iOS
flutter analyze               # Check for errors
flutter test                  # Run tests
dart format lib/              # Format all Dart files
```

---

## 9. Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:root@localhost:5432/learnduels

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=30d

# Server
PORT=4000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
SERVER_URL=http://localhost:4000
FLUTTER_WEB_URL=http://localhost:8080
FLUTTER_DEEP_LINK_SCHEME=learn_duel_app
```

---

## 10. Deployment Checklist

### Before Production:
- [ ] Change JWT_SECRET to strong random value
- [ ] Update CORS_ORIGIN to your frontend domain
- [ ] Set NODE_ENV=production
- [ ] Update API base URLs in Flutter
- [ ] Test on physical Android & iOS devices
- [ ] Setup error tracking (Sentry)
- [ ] Configure production database
- [ ] Add SSL certificates
- [ ] Setup CDN for static assets
- [ ] Enable rate limiting
- [ ] Add backup strategy

---

## 11. Support & Resources

- **Backend API Docs:** `backend/API_DOCUMENTATION.md`
- **Database Schema:** `backend/prisma/schema.prisma`
- **Implementation Summary:** `IMPLEMENTATION_COMPLETE.md`
- **Flutter Docs:** https://flutter.dev/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**Need Help?**
- Check `backend/logs/` for server errors
- Run `flutter doctor` to verify Flutter setup
- Use `npx prisma studio` to inspect database
- Check console logs in browser/mobile debugger

---

**Happy Coding! 🎉**
