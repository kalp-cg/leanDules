<div align="center">

# ⚔️ LearnDuels

### 🎮 The Ultimate Real-Time Multiplayer Quiz Battle Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

<br/>

> 🚀 **Challenge friends. Climb leaderboards. Master knowledge.** 🚀

*Transform boring study sessions into exciting 1v1 quiz battles!*

<br/>

---

</div>

## 🌟 What is LearnDuels?

**LearnDuels** is a gamified learning platform where knowledge meets competition. Challenge your friends or random opponents to real-time quiz duels across various subjects — from Mathematics to History, Science to Pop Culture.

<div align="center">

| 🎯 **Challenge** | ⚡ **Compete** | 🏆 **Conquer** |
|:---:|:---:|:---:|
| Send duel invites to friends | Answer questions in real-time | Rise up the global leaderboards |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### ⚔️ Real-Time 1v1 Duels
Battle head-to-head with live score updates. Feel the adrenaline as you race against your opponent!

### 🎯 Practice Mode
Sharpen your skills solo before challenging others. Track your progress and identify weak areas.

### 👥 Friend Challenges
Send direct challenges to friends. Prove who's the ultimate knowledge champion!

</td>
<td width="50%">

### 🏆 Global Leaderboards
Compete for the top spot on global, regional, and friend rankings. Earn your bragging rights!

### 📚 Multiple Categories
Choose from 10+ subjects including Math, Science, History, Geography, and more!

### 🔔 Push Notifications
Never miss a challenge! Get instant alerts for invites, results, and friend activities.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "📱 Client Layer"
        A[Flutter Mobile App]
    end
    
    subgraph "🌐 API Gateway"
        B[Express.js REST API]
        C[Socket.IO Server]
    end
    
    subgraph "💾 Data Layer"
        D[(PostgreSQL)]
        E[(Redis Cache)]
    end
    
    A -->|HTTP/REST| B
    A <-->|WebSocket| C
    B --> D
    B --> E
    C --> E
    
    style A fill:#02569B,color:#fff
    style B fill:#68a063,color:#fff
    style C fill:#010101,color:#fff
    style D fill:#336791,color:#fff
    style E fill:#DC382D,color:#fff
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---:|
| **Frontend** | Flutter • Dart • Provider • Dio • Socket.IO Client |
| **Backend** | Node.js • Express.js • Socket.IO • JWT • Passport.js |
| **Database** | PostgreSQL • Prisma ORM • Redis |
| **DevOps** | Docker • Docker Compose |

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **Flutter** 3.0+
- **PostgreSQL** 14+
- **Redis** (optional, for caching)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/learnDuels.git
cd learnDuels
```

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start the server
npm run dev
```

> 🌐 Backend runs on `http://localhost:4000`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Get Flutter packages
flutter pub get

# Run on your device/emulator
flutter run
```

### 🐳 Docker (Recommended)

```bash
# Start everything with one command
docker-compose up -d

# That's it! 🎉
```

---

## 📁 Project Structure

```
📦 learnDuels
├── 📂 backend/              # Node.js API Server
│   ├── 📂 src/
│   │   ├── 📂 controllers/  # Route handlers
│   │   ├── 📂 services/     # Business logic
│   │   ├── 📂 sockets/      # WebSocket handlers
│   │   └── 📂 middlewares/  # Auth, validation
│   └── 📂 prisma/           # Database schema
│
├── 📂 frontend/             # Flutter Mobile App
│   └── 📂 lib/
│       ├── 📂 screens/      # UI screens
│       ├── 📂 widgets/      # Reusable components
│       └── 📂 core/         # Services & utilities
│
└── 📜 docker-compose.yml    # Container orchestration
```

---

## 🎮 How It Works

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant S as Server
    participant P2 as Player 2
    
    P1->>S: 🎯 Create Duel
    S->>P2: 📩 Duel Invitation
    P2->>S: ✅ Accept Duel
    S->>P1: 🚀 Game Started!
    S->>P2: 🚀 Game Started!
    
    loop Each Question
        S->>P1: ❓ Question
        S->>P2: ❓ Question
        P1->>S: 📝 Answer
        P2->>S: 📝 Answer
        S->>P1: 📊 Live Score Update
        S->>P2: 📊 Live Score Update
    end
    
    S->>P1: 🏆 Final Results
    S->>P2: 🏆 Final Results
```

---

## 🤝 Contributing

Contributions are always welcome! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔃 Open a **Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 💖 Made with Love by the LearnDuels Team

**⭐ Star this repo if you find it helpful! ⭐**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
