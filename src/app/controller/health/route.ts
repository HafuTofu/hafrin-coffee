import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    const checks = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI?.length || 0,
        mongoUriStartsWith: process.env.MONGODB_URI?.substring(0, 10) || 'N/A',
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        readyState: mongoose.connection.readyState,
        readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        connectionTest: 'pending'
      }
    };

    // Try to connect
    const connected = await connectDB();
    checks.database.connectionTest = connected ? 'success' : 'failed';

    return NextResponse.json(checks, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
