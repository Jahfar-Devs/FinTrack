import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id } = await params;

    const task = await storage.getDailyTask(id);
    if (!task || task.userId !== userId) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const { date } = body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: "Valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }

    const updated = await storage.toggleDailyTaskCompletion(id, date);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
