import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertFinanceEntrySchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertFinanceEntrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { type, person, amount } = result.data;
    const finance = await storage.addFinanceEntry(userId, type, { person, amount });
    return NextResponse.json(finance);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
