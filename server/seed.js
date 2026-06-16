require('dotenv').config();
const mongoose = require('mongoose');
const { seedData } = require('./seed-helper');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volunteersphere');
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin:     admin@volunteersphere.com / Admin@1234');
    console.log('   Volunteer: priya@demo.com / Demo@1234');
    console.log('\n🌐 Start the app: npm run dev (from project root)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

