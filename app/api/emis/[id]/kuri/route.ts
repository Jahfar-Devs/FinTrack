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

    const emi = await storage.getEmi(id);
    if (!emi || emi.userId !== userId) {
      return NextResponse.json({ message: "EMI not found" }, { status: 404 });
    }
    if (!emi.isKuri) {
      return NextResponse.json({ message: "This EMI is not a Kuri" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const { amount, date } = body;
    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ message: "Valid amount is required" }, { status: 400 });
    }

    const updated = await storage.updateKuriReceived(id, amount, date);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
