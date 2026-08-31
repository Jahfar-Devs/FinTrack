/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Replaces the Express bootstrap: connects MongoDB and (off Vercel only)
 * starts the reminder push-notification scheduler (60s polling loop).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (!process.env.JWT_SECRET) {
      console.error(
        "[FATAL] JWT_SECRET missing at startup. Please set JWT_SECRET in your environment variables."
      );
    }

    const { connectDB } = await import("./server/db");

    try {
      await connectDB();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[FATAL] Failed to connect to MongoDB: ${msg}`);
      return;
    }

    // Start the reminder push scheduler only on a persistent server.
    // On Vercel each request runs in a short-lived function, so setInterval
    // would be killed between invocations — an external scheduler hits
    // /api/cron/reminders every minute instead.
    if (!process.env.VERCEL) {
      const { startReminderScheduler } = await import("./server/scheduler");
      startReminderScheduler();
    }
  }
}
