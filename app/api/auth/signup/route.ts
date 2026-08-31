import { NextResponse } from "next/server";
import { signToken } from "@/server/auth";
import { connectDB } from "@/server/db";
import { storage } from "@/server/storage";
import { insertUserSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const existingUser = await storage.getUserByPhone(result.data.phone);
    if (existingUser) {
      return NextResponse.json({ message: "Phone number already registered" }, { status: 400 });
    }

    const user = await storage.createUser(result.data);
    const token = signToken(user.id);

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
