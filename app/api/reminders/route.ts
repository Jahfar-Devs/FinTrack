import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertReminderSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const reminders = await storage.getReminders(userId);
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertReminderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const reminder = await storage.createReminder(userId, result.data);
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
