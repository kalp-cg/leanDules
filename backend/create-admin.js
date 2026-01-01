/**
 * Script to create admin user
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');

    // Hash the password
    const passwordHash = await bcrypt.hash('Kalp0000', 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'kalpp210@gmail.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: kalpp210@gmail.com');
      console.log('📧 Email: kalpp210@gmail.com');
      console.log('🔑 Password: Kalp0000');
      console.log('👤 Role: admin');
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        fullName: 'Admin',
        username: 'admin',
        email: 'kalpp210@gmail.com',
        passwordHash: passwordHash,
        role: 'admin',
        rating: 2000,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        rating: true,
        isActive: true,
        createdAt: true,
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: kalpp210@gmail.com');
    console.log('🔑 Password: Kalp0000');
    console.log('👤 Role: admin');
    console.log('⭐ Rating: 2000');
    console.log('📊 User ID:', admin.id);
    console.log('\n🎯 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
