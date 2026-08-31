import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { changePasswordSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(result.data.currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(result.data.newPassword, 10);
    await storage.updateUser(userId, { password: hashedPassword });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
