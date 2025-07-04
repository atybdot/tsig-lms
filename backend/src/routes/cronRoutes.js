import { Router } from "express";
import { initScheduler } from "../utils/scheduler";
// You'll need to import the actual function you want to run on a schedule.
// For example, let's assume you have a function in `scheduler.js`.
// import { initScheduler } from '../utils/scheduler.js';

const router = Router();

router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send("Unauthorized");
  }

  try {
    console.log("Cron job started...");
    initScheduler();

    console.log("Cron job finished successfully.");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cron job failed:", error);
    res.status(500).json({ success: false, message: "Cron job failed" });
  }
});

export default router;