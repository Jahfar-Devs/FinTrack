import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertExpenseDaySchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Add a day with items to a month
export async function POST(
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
    const result = insertExpenseDaySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    // Validate that the date belongs to the month
    const dateMonth = result.data.date.substring(0, 7);
    if (dateMonth !== month) {
      return NextResponse.json({ message: "Date must belong to the specified month" }, { status: 400 });
    }

    const updated = await storage.addExpenseDay(userId, month, result.data);
    if (!updated) {
      return NextResponse.json({ message: "Failed to add expense day" }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
