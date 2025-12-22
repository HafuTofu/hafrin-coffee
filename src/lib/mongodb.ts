import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI is not defined. Database calls will be skipped.");
}

let isConnected = false; 

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("⚡ MongoDB already connected");
    return true;
  }

  if (!MONGODB_URI) {
    console.error("❌ connectDB called but MONGODB_URI is missing in environment");
    return false;
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("MONGODB_URI exists:", Boolean(MONGODB_URI));
    
  const db = await mongoose.connect(MONGODB_URI, {
      dbName: "hafrincoffee",
      // Allow more time for cluster handshake, especially from CI/Vercel
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    isConnected = db.connection.readyState === 1;
    console.log("✅ MongoDB Connected successfully");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.error("Error details:", {
      message: err instanceof Error ? err.message : 'Unknown error',
      name: err instanceof Error ? err.name : 'Unknown',
      stack: err instanceof Error ? err.stack : 'No stack'
    });
    isConnected = false;
    return false;
  }
}