import { NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { processReminderPushNotifications } from "@/server/scheduler";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron target — replaces the 60s setInterval loop, which cannot run
 * on serverless (no long-lived process between requests).
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set
 * as an environment variable. Reject anything else so the endpoint is not
 * publicly triggerable.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }

  await processReminderPushNotifications();
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
