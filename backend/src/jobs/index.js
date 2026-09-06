import { startStationHealthJob } from './stationHealth.job.js';
import { startAlertEscalationJob } from './alert.job.js';
import { startDailyReportJob } from './report.job.js';
import { logger } from '../utils/logger.js';

let runningJobs = [];

/**
 * Initialize all automated background cron tasks
 */
export function startBackgroundJobs() {
  logger.info('[BackgroundJobs] Initializing scheduled background jobs...');

  const healthJob = startStationHealthJob();
  const alertJob = startAlertEscalationJob();
  const reportJob = startDailyReportJob();

  runningJobs = [healthJob, alertJob, reportJob];

  logger.info(`[BackgroundJobs] ${runningJobs.length} background jobs registered successfully.`);
}

/**
 * Gracefully stop all scheduled jobs
 */
export function stopBackgroundJobs() {
  logger.info('[BackgroundJobs] Stopping background jobs...');
  for (const job of runningJobs) {
    job.stop();
  }
  runningJobs = [];
}
