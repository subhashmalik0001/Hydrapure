import { RISK_LEVELS } from '../utils/constants.js';

/**
 * Water Risk Scoring Service
 * 
 * Computes an operational monitoring score from 0 (pristine) to 100 (critical hazard).
 * Based on weighted contributions of key potable indicators against BIS IS 10500:2012 guidelines.
 * 
 * IMPORTANT DISCLAIMER:
 * This score is an operational monitoring and early-warning index.
 * It does not constitute certified legal biological/pathogen testing.
 */
export class RiskScoreService {
  calculateScore(reading, thresholds = []) {
    let score = 0;
    const reasons = [];

    const { ph, tds, turbidity, temperature, residual_chlorine } = reading;

    // 1. pH Evaluation (Weight: 25%)
    if (ph !== undefined && ph !== null) {
      if (ph < 5.5 || ph > 9.5) {
        score += 25;
        reasons.push(`Critical pH deviation (${ph}) — severe acidity/alkalinity`);
      } else if (ph < 6.5 || ph > 8.5) {
        score += 15;
        reasons.push(`pH (${ph}) outside BIS 10500 optimal range (6.5–8.5)`);
      } else if (ph < 6.8 || ph > 8.2) {
        score += 5;
      }
    }

    // 2. TDS Evaluation (Weight: 35%)
    if (tds !== undefined && tds !== null) {
      if (tds > 1000) {
        score += 35;
        reasons.push(`Dangerous TDS concentration (${tds} ppm) exceeds emergency threshold (1000 ppm)`);
      } else if (tds > 500) {
        score += 20;
        reasons.push(`Elevated TDS (${tds} ppm) exceeds standard potable limit (500 ppm)`);
      } else if (tds > 350) {
        score += 5;
      }
    }

    // 3. Turbidity Evaluation (Weight: 25%)
    if (turbidity !== undefined && turbidity !== null) {
      if (turbidity > 10.0) {
        score += 25;
        reasons.push(`Severe turbidity (${turbidity} NTU) indicates high particulate or treatment bypass`);
      } else if (turbidity > 5.0) {
        score += 18;
        reasons.push(`Turbidity (${turbidity} NTU) exceeds permissible safe limit (5.0 NTU)`);
      } else if (turbidity > 1.0) {
        score += 5;
        reasons.push(`Slight turbidity haze (${turbidity} NTU)`);
      }
    }

    // 4. Free Residual Chlorine (Weight: 10%)
    if (residual_chlorine !== undefined && residual_chlorine !== null) {
      if (residual_chlorine < 0.1) {
        score += 10;
        reasons.push(`Insufficient residual chlorine (${residual_chlorine} mg/L) — microbial risk`);
      } else if (residual_chlorine > 2.0) {
        score += 8;
        reasons.push(`Excessive chlorination (${residual_chlorine} mg/L)`);
      }
    }

    // 5. Water Temperature (Weight: 5%)
    if (temperature !== undefined && temperature !== null) {
      if (temperature > 35.0 || temperature < 5.0) {
        score += 5;
        reasons.push(`Atypical water temperature (${temperature}°C)`);
      }
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    let riskLevel = RISK_LEVELS.SAFE;
    if (finalScore >= 81) {
      riskLevel = RISK_LEVELS.CRITICAL;
    } else if (finalScore >= 61) {
      riskLevel = RISK_LEVELS.HIGH;
    } else if (finalScore >= 31) {
      riskLevel = RISK_LEVELS.CAUTION;
    }

    return {
      riskScore: finalScore,
      riskLevel,
      reasons: reasons.length ? reasons : ['All physical and chemical parameters within BIS guidelines'],
      disclaimer: 'Operational monitoring score for early warning. Not a substitute for full certified laboratory microbial testing.',
    };
  }

  calculateRisk(reading = {}, stage = 'TREATED') {
    const result = this.calculateScore(reading);
    const risk_score = result.riskScore;
    const is_potable =
      risk_score <= 50 &&
      (reading.ph === undefined || (reading.ph >= 6.5 && reading.ph <= 8.5)) &&
      (reading.tds === undefined || reading.tds <= 500) &&
      (reading.turbidity === undefined || reading.turbidity <= 5.0);

    return {
      risk_score,
      risk_level: result.riskLevel,
      riskScore: risk_score,
      riskLevel: result.riskLevel,
      is_potable,
      reasons: result.reasons,
      recommendations: !is_potable
        ? ['Inspect primary RO/UV filtration cartridges', 'Check pre-filter sediment filters', 'Notify district field engineer']
        : ['Water meets potable distribution standards'],
      disclaimer: result.disclaimer,
    };
  }
}

export const riskScoreService = new RiskScoreService();
