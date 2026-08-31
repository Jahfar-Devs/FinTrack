import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { updateSalarySchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Update salary for a month (creates month if it doesn't exist)
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
    const result = updateSalarySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    // Check if month exists
    let expense = await storage.getExpenseByMonth(userId, month);

    if (!expense) {
      // Create the month with the salary if it doesn't exist
      expense = await storage.createExpenseMonth(userId, {
        month,
        salaryCredited: result.data.salaryCredited,
      });
    } else {
      // Update existing month's salary
      const updated = await storage.updateExpenseMonthSalary(userId, month, result.data.salaryCredited);
      if (!updated) {
        return NextResponse.json({ message: "Failed to update salary" }, { status: 500 });
      }
      expense = updated;
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
