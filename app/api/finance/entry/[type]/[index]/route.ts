import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ type: string; index: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const { type: typeParam, index: indexParam } = await params;
    const type = typeParam as "debit" | "credit";
    const index = parseInt(indexParam);

    if (type !== "debit" && type !== "credit") {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const { person, amount } = body;
    if (!person || typeof person !== "string" || person.trim().length === 0) {
      return NextResponse.json({ message: "Person name is required" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ message: "Amount must be a positive number" }, { status: 400 });
    }

    const finance = await storage.updateFinanceEntry(userId, type, index, { person: person.trim(), amount });
    return NextResponse.json(finance);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ type: string; index: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const { type: typeParam, index: indexParam } = await params;
    const type = typeParam as "debit" | "credit";
    const index = parseInt(indexParam);

    if (type !== "debit" && type !== "credit") {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const finance = await storage.removeFinanceEntry(userId, type, index);
    return NextResponse.json(finance);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
