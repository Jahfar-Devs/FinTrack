import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

// Delete a specific item from a day
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ month: string; date: string; itemId: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const { month, date, itemId } = await params;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ message: "Invalid month format. Use YYYY-MM" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const expense = await storage.getExpenseByMonth(userId, month);
    if (!expense) {
      return NextResponse.json({ message: "Month not found" }, { status: 404 });
    }

    const updated = await storage.deleteExpenseDayItem(userId, month, date, itemId);
    if (!updated) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
