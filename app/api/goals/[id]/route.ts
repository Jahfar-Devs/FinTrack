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

    const goal = await storage.getGoal(id);
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const updated = await storage.updateGoal(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id } = await params;

    const goal = await storage.getGoal(id);
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    await storage.deleteGoal(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
