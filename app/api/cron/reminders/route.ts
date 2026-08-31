import { NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { processReminderPushNotifications } from "@/server/scheduler";

export const dynamic = "force-dynamic";

/**
 * Cron target — replaces the 60s setInterval loop, which cannot run on
 * serverless (no long-lived process between requests).
 *
 * Driven by an external scheduler (cron-job.org) hitting this URL every
 * minute, because Vercel Hobby only allows once-daily crons. The caller must
 * send `Authorization: Bearer $CRON_SECRET` so the endpoint is not publicly
 * triggerable.
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
