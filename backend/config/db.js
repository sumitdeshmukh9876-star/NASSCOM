import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financial_advisor_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`! Primary MongoDB connection failed (${error.message}). Attempting in-memory database fallback...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(` In-Memory MongoDB Connected at: ${memoryUri}`);
      console.log(`(Notice: Using embedded MongoMemoryServer for development. Add MONGODB_URI in backend/.env for persistent MongoDB storage)`);
      return conn;
    } catch (memError) {
      console.error(` Fatal: Could not connect to any MongoDB instance:`, memError.message);
      throw memError;
    }
  }
};
