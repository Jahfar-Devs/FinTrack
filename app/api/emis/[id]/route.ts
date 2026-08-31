import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertEmiSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id } = await params;

    const emi = await storage.getEmi(id);
    if (!emi || emi.userId !== userId) {
      return NextResponse.json({ message: "EMI not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertEmiSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await storage.updateEmi(id, result.data);
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

    const emi = await storage.getEmi(id);
    if (!emi || emi.userId !== userId) {
      return NextResponse.json({ message: "EMI not found" }, { status: 404 });
    }

    await storage.deleteEmi(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
