import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

async function updatePlanHandler(req: Request, params: Promise<{ id: string }>) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id } = await params;

    const plan = await storage.getPlan(id);
    if (!plan || plan.userId !== userId) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const updated = await storage.updatePlan(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return updatePlanHandler(req, params);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return updatePlanHandler(req, params);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id } = await params;

    const plan = await storage.getPlan(id);
    if (!plan || plan.userId !== userId) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    await storage.deletePlan(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
