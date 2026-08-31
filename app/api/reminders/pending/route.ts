import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const now = new Date().toISOString();
    const reminders = await storage.getPendingReminders(userId, now);
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
