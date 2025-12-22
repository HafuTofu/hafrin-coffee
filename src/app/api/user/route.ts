import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { SafeUser } from "@/types/user";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

function isHexObjectId(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    if (!isHexObjectId(sessionCookie.value)) {
      const resp = NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
      resp.cookies.delete("session");
      return resp;
    }

    console.log("GET /api/user - Using Mongoose");
    await connectDB();
    const userObj: any = await User.findById(sessionCookie.value).select("-password").lean();

    if (!userObj) {
      const resp = NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
      resp.cookies.delete("session");
      return resp;
    }

    const safeUser: SafeUser = {
      _id: String(userObj._id),
      username: userObj.username,
      name: userObj.name,
      email: userObj.email
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("GET /api/user/check error:", err);
    return NextResponse.json({ success: false, error: "Authentication check failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as any;
    const username = typeof body?.username === 'string' ? body.username : undefined;
    const password = typeof body?.password === 'string' ? body.password : undefined;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
    }

    console.log("POST /api/user - Using Mongoose");
    await connectDB();
    const userObj: any = await User.findOne({ username }).select("+password").lean();

    if (!userObj || userObj.password !== password) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: {
      _id: String(userObj._id),
      username: userObj.username,
      name: userObj.name,
      email: userObj.email
    }});

    response.cookies.set("session", String(userObj._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return response;
  } catch (err) {
    console.error("POST /api/user/login error:", err);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const resp = NextResponse.json({ success: true });
    resp.cookies.delete("session");
    return resp;
  } catch (err) {
    console.error("DELETE /api/user/logout error:", err);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}