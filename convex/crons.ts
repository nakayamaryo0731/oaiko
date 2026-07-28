import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 5:00 JST に当日実行分の定期支出を生成
crons.daily(
  "generate recurring expenses",
  { hourUTC: 20, minuteUTC: 0 },
  internal.recurringExpenses.generateDue,
  {},
);

export default crons;
