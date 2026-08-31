import mongoose from "mongoose";

// Cached connection pattern for Next.js: survives dev hot-reloads and is
// shared across route-handler invocations within one server process.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: {
    promise: Promise<typeof mongoose> | null;
    conn: typeof mongoose | null;
  } | undefined;
}

const cached = global._mongooseConn ?? (global._mongooseConn = { promise: null, conn: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }
    // Serverless: many function instances each hold their own pool, so keep
    // it small to stay under the Atlas cluster connection limit.
    cached.promise = mongoose.connect(MONGODB_URI, { maxPoolSize: 10 }).then((m) => {
      console.log("✅ MongoDB connected successfully");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("MongoDB disconnected");
  }
}
