import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { updateExpenseDaySchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Update a day in a month
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ month: string; date: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const { month, date } = await params;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ message: "Invalid month format. Use YYYY-MM" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = updateExpenseDaySchema.safeParse({ ...body, date });
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const expense = await storage.getExpenseByMonth(userId, month);
    if (!expense) {
      return NextResponse.json({ message: "Month not found" }, { status: 404 });
    }

    const updated = await storage.updateExpenseDay(userId, month, result.data);
    if (!updated) {
      return NextResponse.json({ message: "Day not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Delete a day from a month
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ month: string; date: string }> }
) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const { month, date } = await params;
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

    const updated = await storage.deleteExpenseDay(userId, month, date);
    if (!updated) {
      return NextResponse.json({ message: "Day not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
