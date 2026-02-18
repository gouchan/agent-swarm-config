import cron from "node-cron";
import { config } from "../config.js";
import { checkPriceMovements } from "./price-monitor.js";
import { sendDailyBriefing } from "./daily-briefing.js";

let priceTask: cron.ScheduledTask | null = null;
let briefingTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  // Price monitoring: every N minutes
  const priceInterval = `*/${config.pollIntervalMinutes} * * * *`;
  priceTask = cron.schedule(priceInterval, async () => {
    try {
      await checkPriceMovements();
    } catch (err) {
      console.error("Price monitor cron error:", err);
    }
  });
  console.log(`Price monitor scheduled: every ${config.pollIntervalMinutes} minutes`);

  // Daily briefing: at configured hour UTC
  const briefingCron = `0 ${config.briefingHourUtc} * * *`;
  briefingTask = cron.schedule(briefingCron, async () => {
    try {
      await sendDailyBriefing();
    } catch (err) {
      console.error("Daily briefing cron error:", err);
    }
  }, { timezone: "UTC" });
  console.log(`Daily briefing scheduled: ${config.briefingHourUtc}:00 UTC`);
}

export function stopScheduler(): void {
  priceTask?.stop();
  briefingTask?.stop();
  console.log("Scheduler stopped.");
}
