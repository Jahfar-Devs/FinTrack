import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { storage } from "@/server/storage";

export const dynamic = "force-dynamic";

// Save OneSignal player ID for the authenticated user
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const body = (await req.json().catch(() => ({}))) ?? {};
    const { playerId } = body;
    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json({ message: "playerId is required" }, { status: 400 });
    }
    await storage.saveOneSignalPlayerId(userId, playerId);
    console.log(`[push] Player ID saved for user ${userId}: ${playerId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Debug: check push subscription status for the current user
export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const user = await storage.getUser(userId);
    return NextResponse.json({
      userId,
      oneSignalPlayerId: user?.oneSignalPlayerId ?? null,
      hasSubscription: !!user?.oneSignalPlayerId,
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
