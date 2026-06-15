import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Typed cache for mongoose connection to avoid `any`
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
let cached = (global as any).mongoose as CachedMongoose | undefined;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null } as CachedMongoose;
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
