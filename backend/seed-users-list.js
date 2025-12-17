const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  "Kanishka", "Krish", "Dax", "Priy", "Dhruvesh", "Nehil", "Het", "Pawan",
  "Aniket", "Arya", "Kiran", "Vanshika 1", "Vanshika 2", "Khushi", "Kalpan",
  "Isha", "RIjans", "Dhruv", "Jatin", "Ishita", "Kalp", "Dristi", "Mahir",
  "Kk", "Homasvi", "Jatan", "Garvit", "Priyasha", "Khushbu", "Dhruvil",
  "Yashvi", "Arjun", "Krishna", "Deep", "Dev", "Kashyap", "Shubham"
];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const password = await bcrypt.hash('password123', 10);

  for (const name of users) {
    const username = name.toLowerCase().replace(/\s+/g, '');
    const email = `${username}@example.com`;

    try {
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            fullName: name,
            username: username,
            email: email,
            passwordHash: password,
            role: 'user',
            level: 1,
            xp: 0,
            rating: 1000,
          },
        });
        console.log(`✅ Created user: ${name}`);
      } else {
        // Update password for existing users to ensure test works
        await prisma.user.update({
          where: { username },
          data: { 
            passwordHash: password,
            email: email // Ensure email matches for login
          }
        });
        console.log(`🔄 Updated password/email for: ${name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create user ${name}:`, error.message);
    }
  }

  console.log('✨ User seeding completed');
}

seedUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
