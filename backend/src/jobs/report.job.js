import cron from 'node-cron';
import { reportService } from '../services/report.service.js';
import { logger } from '../utils/logger.js';

/**
 * Nightly report generator job
 * Runs at 01:00 AM every day to generate district-wide compliance digests
 */
export function startDailyReportJob() {
  return cron.schedule('0 1 * * *', async () => {
    logger.info('[ReportJob] Generating nightly water quality compliance digests...');

    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await reportService.generateReport({
        title: `Automated Daily Water Quality Summary - ${yesterday}`,
        report_type: 'DAILY_COMPLIANCE',
        format: 'JSON',
        filters: { date: yesterday },
      }, '00000000-0000-0000-0000-000000000001');

      logger.info('[ReportJob] Daily report generation completed successfully.');
    } catch (err) {
      logger.error('[ReportJob] Daily report generation error:', err);
    }
  });
}
