const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('./src/utils/token');

const API_URL = 'http://localhost:4000/api';
const REPORTER_EMAIL = `reporter_${Date.now()}@example.com`;
const REPORTED_EMAIL = `reported_${Date.now()}@example.com`;
const PASSWORD = 'Password123!';

async function runTest() {
  try {
    console.log('🚀 Starting Report System Test...');

    // 1. Create Users
    console.log('\n1. Creating test users...');
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    
    const reporter = await prisma.user.create({
      data: {
        email: REPORTER_EMAIL,
        username: `reporter_${Date.now()}`,
        passwordHash: hashedPassword,
        isActive: true,
        role: 'user'
      }
    });

    const reported = await prisma.user.create({
      data: {
        email: REPORTED_EMAIL,
        username: `reported_${Date.now()}`,
        passwordHash: hashedPassword,
        isActive: true,
        role: 'user'
      }
    });

    const admin = await prisma.user.create({
        data: {
          email: `admin_${Date.now()}@example.com`,
          username: `admin_${Date.now()}`,
          passwordHash: hashedPassword,
          isActive: true,
          role: 'admin'
        }
      });

    console.log('✅ Users created');

    // Generate tokens
    const reporterTokens = generateTokenPair({ userId: reporter.id, email: reporter.email, role: reporter.role });
    const adminTokens = generateTokenPair({ userId: admin.id, email: admin.email, role: admin.role });

    // 2. Create Report
    console.log('\n2. Creating a report...');
    try {
        const reportRes = await axios.post(`${API_URL}/reports`, {
            reportedId: reported.id,
            type: 'user',
            reason: 'This user is being rude.'
        }, {
            headers: { Authorization: `Bearer ${reporterTokens.accessToken}` }
        });
        console.log('✅ Report created:', reportRes.data.data.id);
    } catch (e) {
        console.error('❌ Create report failed:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        }
        process.exit(1);
    }

    // 3. Get Reports (Admin)
    console.log('\n3. Fetching reports as Admin...');
    try {
        const reportsRes = await axios.get(`${API_URL}/reports`, {
            headers: { Authorization: `Bearer ${adminTokens.accessToken}` }
        });
        console.log(`✅ Fetched ${reportsRes.data.data.reports.length} reports`);
        
        const ourReport = reportsRes.data.data.reports.find(r => r.userId === reporter.id && r.reportedId === reported.id);
        if (ourReport) {
            console.log('✅ Found our report in the list');
        } else {
            console.error('❌ Report not found in list');
        }
    } catch (e) {
        console.error('❌ Fetch reports failed:', e.response?.data || e.message);
    }

    // Cleanup
    await prisma.report.deleteMany({ where: { userId: reporter.id } });
    await prisma.user.delete({ where: { id: reporter.id } });
    await prisma.user.delete({ where: { id: reported.id } });
    await prisma.user.delete({ where: { id: admin.id } });
    console.log('\n🧹 Cleanup complete');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
