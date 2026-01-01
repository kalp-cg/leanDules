const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function ensureUsers() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'arya@example.com', fullName: 'Arya Stark', role: 'user' },
    { email: 'dev@example.com', fullName: 'Dev User', role: 'user' }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: u.email,
          passwordHash,
          fullName: u.fullName,
          role: u.role,
          authProvider: 'email'
        }
      });
      console.log(`Created user ${u.email}`);
    } else {
      console.log(`User ${u.email} exists`);
    }
  }
}

ensureUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
