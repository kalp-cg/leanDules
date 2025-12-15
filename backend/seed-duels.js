const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Duel Seeding...');

  try {
    // 1. Fetch Users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      take: 10,
    });

    if (users.length < 2) {
      console.log('⚠️ Not enough users to create duels. Creating dummy users...');
      // Create 2 dummy users
      for (let i = 1; i <= 2; i++) {
        const user = await prisma.user.create({
          data: {
            username: `duel_player_${i}_${Date.now()}`,
            email: `duel_player_${i}_${Date.now()}@example.com`,
            passwordHash: 'hashed_password', // Dummy hash
            fullName: `Duel Player ${i}`,
            role: 'user',
            isActive: true,
          },
        });
        users.push(user);
      }
    }

    // 2. Fetch Questions
    const questions = await prisma.question.findMany({
      take: 20,
    });

    if (questions.length < 5) {
      console.error('❌ Not enough questions. Please run seed-questions.js first.');
      return;
    }

    console.log(`👉 Found ${users.length} users and ${questions.length} questions.`);

    // 3. Create Duels
    const duelsToCreate = 10;
    console.log(`👉 Creating ${duelsToCreate} dummy duels...`);

    for (let i = 0; i < duelsToCreate; i++) {
      // Pick two random different users
      const player1 = users[Math.floor(Math.random() * users.length)];
      let player2 = users[Math.floor(Math.random() * users.length)];
      while (player2.id === player1.id) {
        player2 = users[Math.floor(Math.random() * users.length)];
      }

      // Pick 5 random questions
      const shuffledQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 5);

      // Create Challenge
      const challenge = await prisma.challenge.create({
        data: {
          challengerId: player1.id,
          type: 'instant',
          settings: { categoryId: 1, difficultyId: 2, questionCount: 5 },
          status: 'completed',
          participants: {
            create: [
              { userId: player1.id, status: 'completed', score: Math.floor(Math.random() * 50) },
              { userId: player2.id, status: 'completed', score: Math.floor(Math.random() * 50) },
            ],
          },
        },
      });

      // Create Duel
      const duel = await prisma.duel.create({
        data: {
          challengeId: challenge.id,
          player1Id: player1.id,
          player2Id: player2.id,
          status: 'completed',
          winnerId: Math.random() > 0.5 ? player1.id : player2.id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random time in past
          completedAt: new Date(),
        },
      });

      // Add Questions to Duel
      for (let j = 0; j < shuffledQuestions.length; j++) {
        await prisma.duelQuestion.create({
          data: {
            duelId: duel.id,
            questionId: shuffledQuestions[j].id,
            orderIndex: j + 1,
          },
        });

        // Add Answers (Random correctness)
        // Player 1
        await prisma.duelAnswer.create({
          data: {
            duelId: duel.id,
            playerId: player1.id,
            questionId: shuffledQuestions[j].id,
            selectedAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            isCorrect: Math.random() > 0.5,
            timeTaken: Math.floor(Math.random() * 10) + 1,
          },
        });

        // Player 2
        await prisma.duelAnswer.create({
          data: {
            duelId: duel.id,
            playerId: player2.id,
            questionId: shuffledQuestions[j].id,
            selectedAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            isCorrect: Math.random() > 0.5,
            timeTaken: Math.floor(Math.random() * 10) + 1,
          },
        });
      }

      process.stdout.write('.');
    }

    console.log('\n✅ Duel Seeding Completed Successfully!');

  } catch (error) {
    console.error('\n❌ Seeding Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
