import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { updateUserSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const user = await storage.updateUser(userId, result.data);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
