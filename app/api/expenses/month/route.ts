import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertDailyExpenseSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

// Create a new expense month
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertDailyExpenseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const expense = await storage.createExpenseMonth(userId, result.data);
    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof Error && error.message === "Month already exists") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
