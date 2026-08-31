import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertDailyTaskSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const tasks = await storage.getDailyTasks(userId);
    return NextResponse.json(tasks);
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
    const result = insertDailyTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const task = await storage.createDailyTask(userId, result.data);
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
