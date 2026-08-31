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

    const reminder = await storage.getReminder(id);
    if (!reminder || reminder.userId !== userId) {
      return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
    }

    const updated = await storage.updateReminder(id, { status: "dismissed" });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
