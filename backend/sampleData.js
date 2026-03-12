require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const AIAnalysis = require('./models/AIAnalysis');

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([User.deleteMany({}), Complaint.deleteMany({}), AIAnalysis.deleteMany({})]);

    const [admin, citizen] = await User.create([
      {
        name: 'Municipal Admin',
        email: 'admin@municipal.gov',
        password: 'Admin@123',
        role: 'admin'
      },
      {
        name: 'Sample Citizen',
        email: 'citizen@example.com',
        password: 'Citizen@123',
        role: 'citizen'
      }
    ]);

    const now = new Date();
    const complaints = await Complaint.insertMany([
      {
        title: 'Garbage not collected in 3 days',
        description: 'Large garbage pile near the market road is causing foul smell and insects.',
        category: 'Sanitation',
        location: 'Market Road Ward 7',
        status: 'pending',
        delayFlag: true,
        createdAt: new Date(now.getTime() - 72 * 3600000),
        department: 'Sanitation Department',
        aiCluster: 0,
        user: citizen._id
      },
      {
        title: 'Street light not working',
        description: 'Main junction street light has been off for one week and road is very dark.',
        category: 'Streetlight',
        location: 'MG Road Junction',
        status: 'in_progress',
        delayFlag: false,
        createdAt: new Date(now.getTime() - 24 * 3600000),
        department: 'Electrical Department',
        aiCluster: 1,
        user: citizen._id
      },
      {
        title: 'Water leakage from public pipeline',
        description: 'Water is continuously leaking near the school and wasting huge quantity daily.',
        category: 'Water Supply',
        location: 'School Street Ward 3',
        status: 'resolved',
        delayFlag: false,
        createdAt: new Date(now.getTime() - 120 * 3600000),
        resolvedAt: new Date(now.getTime() - 48 * 3600000),
        department: 'Water Board',
        aiCluster: 2,
        user: citizen._id
      }
    ]);

    await AIAnalysis.insertMany([
      {
        complaintId: complaints[0]._id,
        predictedCategory: 'Sanitation',
        keywords: ['garbage', 'foul', 'insects', 'market'],
        clusterId: 0,
        confidence: 0.87
      },
      {
        complaintId: complaints[1]._id,
        predictedCategory: 'Streetlight',
        keywords: ['street', 'light', 'junction', 'dark'],
        clusterId: 1,
        confidence: 0.91
      },
      {
        complaintId: complaints[2]._id,
        predictedCategory: 'Water Supply',
        keywords: ['water', 'leakage', 'pipeline'],
        clusterId: 2,
        confidence: 0.88
      }
    ]);

    console.log('Seed data inserted successfully');
    console.log('Admin login -> admin@municipal.gov / Admin@123');
    console.log('Citizen login -> citizen@example.com / Citizen@123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
