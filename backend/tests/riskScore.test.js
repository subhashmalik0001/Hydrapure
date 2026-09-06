import { describe, it, expect } from 'vitest';
import { riskScoreService } from '../src/services/riskScore.service.js';

describe('Risk Score Calculation Engine', () => {
  it('should score safe drinking water at low risk (< 25)', () => {
    const assessment = riskScoreService.calculateRisk({
      ph: 7.2,
      tds: 180,
      turbidity: 1.2,
      dissolved_oxygen: 7.0,
    }, 'TREATED');

    expect(assessment.risk_score).toBeLessThanOrEqual(25);
    expect(assessment.risk_level).toBe('LOW');
    expect(assessment.is_potable).toBe(true);
    expect(assessment.disclaimer).toBeDefined();
  });

  it('should score severely contaminated water as CRITICAL risk (> 70)', () => {
    const assessment = riskScoreService.calculateRisk({
      ph: 4.8, // Acidic mine runoff
      tds: 850, // Heavy dissolved solids
      turbidity: 9.5, // High particulate
    }, 'TREATED');

    expect(assessment.risk_score).toBeGreaterThanOrEqual(70);
    expect(assessment.risk_level).toBe('CRITICAL');
    expect(assessment.is_potable).toBe(false);
    expect(assessment.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it('should include diagnostic recommendations when bounds are exceeded', () => {
    const assessment = riskScoreService.calculateRisk({
      ph: 7.0,
      tds: 620, // TDS breach
      turbidity: 1.5,
    }, 'TREATED');

    expect(assessment.reasons.some((r) => r.includes('TDS'))).toBe(true);
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });
});
