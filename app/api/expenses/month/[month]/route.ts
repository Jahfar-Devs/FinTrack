import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

// Get expense data for a specific month
export async function GET(
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

    const expense = await storage.getExpenseByMonth(userId, month);
    if (!expense) {
      return NextResponse.json({ message: "Month not found" }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
