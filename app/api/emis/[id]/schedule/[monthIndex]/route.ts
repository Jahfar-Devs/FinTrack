import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; monthIndex: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;
    const { id, monthIndex: monthIndexParam } = await params;

    const emi = await storage.getEmi(id);
    if (!emi || emi.userId !== userId) {
      return NextResponse.json({ message: "EMI not found" }, { status: 404 });
    }

    const monthIndex = parseInt(monthIndexParam);
    const body = (await req.json().catch(() => ({}))) ?? {};
    const status = body.status as "paid" | "unpaid";

    const updated = await storage.updateEmiSchedule(id, monthIndex, status);
    if (updated === undefined) {
      // Express res.json(undefined) sends an empty 200 response
      return new NextResponse(null, { status: 200 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
