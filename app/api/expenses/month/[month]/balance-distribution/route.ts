import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { updateBalanceDistributionSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Update balance distribution for a month
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const { month } = await params;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ message: "Invalid month format. Use YYYY-MM" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = updateBalanceDistributionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await storage.updateExpenseMonthBalanceDistribution(
      userId,
      month,
      result.data.balanceSBI,
      result.data.balanceKGB,
      result.data.balanceCash
    );

    if (!updated) {
      return NextResponse.json({ message: "Month not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("must equal")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
