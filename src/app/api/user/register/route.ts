import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

type RegisterRequest = {
  username: string;
  name: string;
  email: string;
  password: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  address?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RegisterRequest;
    const { username, name, email, password, gender, phone, address } = body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("POST /api/user/register - Using Mongoose");
    await connectDB();
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: existingUser.username === username ? "Username already taken" : "Email already registered" },
        { status: 400 }
      );
    }
    
    const user = await User.create({ username, name, email, password, gender: gender || "other", phone, address });
    return NextResponse.json({ success: true, user: { _id: user._id, username, name, email } });
  } catch (err) {
    console.error("POST /api/user/register error:", err);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}