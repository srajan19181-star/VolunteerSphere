const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/volunteersphere';
    let isFallback = false;

    try {
      console.log(`⏳ Connecting to MongoDB at ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000, // 3 seconds timeout
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return { isFallback: false };
    } catch (error) {
      if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
        console.log(`⚠️ Local MongoDB connection failed: ${error.message}`);
        console.log(`🚀 Starting in-memory MongoDB Server fallback...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'volunteersphere',
          }
        });
        const memoryUri = mongoServer.getUri();
        console.log(`ℹ️ In-memory MongoDB URI: ${memoryUri}`);
        const conn = await mongoose.connect(memoryUri);
        console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
        process.env.MONGO_URI = memoryUri;
        return { isFallback: true };
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

