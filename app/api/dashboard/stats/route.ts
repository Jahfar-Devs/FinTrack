import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const expenseMonths = await storage.getAllExpenseMonths(userId);
    const goals = await storage.getGoals(userId);
    const emis = await storage.getEmis(userId);
    const finance = await storage.getFinance(userId);

    // Current month stats
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const currentMonthData = expenseMonths.find((m) => m.month === currentMonth);
    const totalExpenses = currentMonthData?.monthlyTotal || 0;
    const monthlyEarnings = currentMonthData?.monthlyEarnings || 0;
    const salaryCredited = currentMonthData?.salaryCredited || 0;
    const balance = salaryCredited + monthlyEarnings - totalExpenses;

    const pendingGoals = goals.filter((g) => g.status === "pending").length;
    const activeEmis = emis.filter((e) => e.remainingAmount > 0).length;

    return NextResponse.json({
      totalExpenses,
      balance,
      totalCredit: finance.totalCredit,
      totalDebit: finance.totalDebit,
      pendingGoals,
      activeEmis,
      salaryCredited,
      monthlyEarnings,
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
