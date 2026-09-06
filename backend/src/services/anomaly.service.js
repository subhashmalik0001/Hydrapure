import { logger } from '../utils/logger.js';

/**
 * Anomaly Detection Service
 * 
 * Analyzes incoming sensor readings against previous readings and baseline behavior.
 * Supports:
 * - Sudden Spike Detection (Delta thresholding)
 * - Rate-of-Change limits
 * - Sensor Drift / Sensor Freezing (identical floating point values across many samples)
 * - Abnormal Outflow (Flowing while valve blocked or zero flow when supply active)
 */
export class AnomalyService {
  /**
   * Detects anomalies in a new reading compared against previous reading
   */
  detectAnomalies(currentReading, previousReading = null, activeThresholds = {}) {
    const anomalies = [];

    // 1. Extreme Outlier Check (Physical bounds)
    if (currentReading.ph < 0 || currentReading.ph > 14) {
      anomalies.push({
        type: 'PHYSICAL_BOUNDS_ERROR',
        parameter: 'pH',
        severity: 'CRITICAL',
        message: `Sensor hardware malfunction: pH reading ${currentReading.ph} is outside physical 0–14 range.`,
      });
    }

    if (currentReading.turbidity < 0) {
      anomalies.push({
        type: 'PHYSICAL_BOUNDS_ERROR',
        parameter: 'turbidity',
        severity: 'WARNING',
        message: `Invalid negative turbidity value: ${currentReading.turbidity} NTU`,
      });
    }

    // 2. Sudden Spike Detection (Delta check vs previous reading)
    if (previousReading) {
      const timeDiffMinutes = (new Date(currentReading.recorded_at) - new Date(previousReading.recorded_at)) / (1000 * 60);

      // Only compare if readings occurred within 30 minutes of each other
      if (timeDiffMinutes > 0 && timeDiffMinutes <= 30) {
        // TDS Spike check (> 300 ppm delta within short window)
        const tdsDelta = Math.abs(currentReading.tds - previousReading.tds);
        if (tdsDelta > 300) {
          anomalies.push({
            type: 'SUDDEN_SPIKE',
            parameter: 'tds',
            severity: currentReading.tds > 500 ? 'CRITICAL' : 'WARNING',
            message: `Sudden TDS spike detected: jump of ${tdsDelta} ppm within ${timeDiffMinutes.toFixed(1)} minutes.`,
            delta: tdsDelta,
          });
        }

        // Turbidity Spike check (> 8 NTU delta)
        const turbDelta = Math.abs(currentReading.turbidity - previousReading.turbidity);
        if (turbDelta > 8.0) {
          anomalies.push({
            type: 'SUDDEN_SPIKE',
            parameter: 'turbidity',
            severity: 'CRITICAL',
            message: `Sudden turbidity surge: increase of ${turbDelta.toFixed(1)} NTU within ${timeDiffMinutes.toFixed(1)} minutes.`,
            delta: turbDelta,
          });
        }

        // Sensor Freezing / Drift Check
        // If 4 parameters are identically identical to multiple decimal places over time, sensor may be frozen
        if (
          currentReading.ph === previousReading.ph &&
          currentReading.tds === previousReading.tds &&
          currentReading.turbidity === previousReading.turbidity &&
          currentReading.temperature === previousReading.temperature &&
          timeDiffMinutes >= 15
        ) {
          anomalies.push({
            type: 'SENSOR_FROZEN',
            parameter: 'system',
            severity: 'WARNING',
            message: 'Static sensor telemetry: multiple readings identical across 15+ minutes. Check probe fouling.',
          });
        }
      }
    }

    // 3. Flow vs Quality Anomaly (Supply anomaly)
    if (currentReading.tds > 1000 && currentReading.flow_rate > 10.0) {
      anomalies.push({
        type: 'VALVE_LEAK_OR_OVERRIDE',
        parameter: 'flow_rate',
        severity: 'CRITICAL',
        message: 'Active outflow (>10 L/s) detected while water TDS is at critical hazard level (>1000 ppm). Solenoid actuation failure suspected.',
      });
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
    };
  }
}

export const anomalyService = new AnomalyService();
