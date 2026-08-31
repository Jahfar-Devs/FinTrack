import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { updatePersonalMemorySchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Original Express backend has GET /api/memories/:date (date lookup) and
// PUT/DELETE /api/memories/:id (UUID) at the same path position.

export async function GET(
  req: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const { param: date } = await params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const memories = await storage.getMemoriesByDate(userId, date);
    return NextResponse.json(memories);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const { param: id } = await params;
    const memory = await storage.getMemory(id);
    if (!memory || memory.userId !== userId) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = updatePersonalMemorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await storage.updateMemory(id, result.data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const { param: id } = await params;
    const memory = await storage.getMemory(id);
    if (!memory || memory.userId !== userId) {
      return NextResponse.json({ message: "Memory not found" }, { status: 404 });
    }

    await storage.deleteMemory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
