import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";
import { insertPlanSchema } from "@shared/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const plans = await storage.getPlans(userId);
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const result = insertPlanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const plan = await storage.createPlan(userId, result.data);
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
