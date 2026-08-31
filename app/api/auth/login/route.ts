import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/server/auth";
import { connectDB } from "@/server/db";
import { storage } from "@/server/storage";
import { loginSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const user = await storage.getUserByPhone(result.data.phone);
    if (!user) {
      return NextResponse.json({ message: "Invalid phone or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(result.data.password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid phone or password" }, { status: 401 });
    }

    const token = signToken(user.id);

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
