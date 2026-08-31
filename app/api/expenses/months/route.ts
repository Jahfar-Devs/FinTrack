import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

// Get all expense months for a user
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const expenseMonths = await storage.getAllExpenseMonths(userId);
    return NextResponse.json(expenseMonths);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
