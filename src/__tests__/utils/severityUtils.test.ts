
import {
  getSeverityColor,
  getSeverityLabel,
  countBySeverity,
  calculateSeverityPercentages
} from '@/components/admin/errors/utils/severityUtils';

describe('severityUtils', () => {
  // Test data
  const testErrors = [
    { id: '1', level: 'critical', message: 'Critical error' },
    { id: '2', level: 'high', message: 'High error' },
    { id: '3', level: 'medium', message: 'Medium error' },
    { id: '4', level: 'low', message: 'Low error' },
    { id: '5', level: 'critical', message: 'Another critical error' },
    { id: '6', level: 'high', message: 'Another high error' },
    { id: '7', level: 'medium', message: 'Another medium error' },
    { id: '8', level: 'low', message: 'Another low error' },
    { id: '9', level: 'critical', message: 'Yet another critical error' },
    { id: '10', level: 'unknown', message: 'Unknown severity error' },
  ];

  test('getSeverityColor returns correct colors', () => {
    expect(getSeverityColor('critical')).toBe('#ef4444'); // Red
    expect(getSeverityColor('high')).toBe('#f97316'); // Orange
    expect(getSeverityColor('medium')).toBe('#eab308'); // Yellow
    expect(getSeverityColor('low')).toBe('#22c55e'); // Green
    expect(getSeverityColor('unknown')).toBe('#a1a1aa'); // Default gray
  });

  test('getSeverityLabel returns formatted labels', () => {
    expect(getSeverityLabel('critical')).toBe('Critical');
    expect(getSeverityLabel('high')).toBe('High');
    expect(getSeverityLabel('medium')).toBe('Medium');
    expect(getSeverityLabel('low')).toBe('Low');
    expect(getSeverityLabel('unknown')).toBe('Unknown');
  });

  test('countBySeverity counts errors correctly', () => {
    const result = countBySeverity(testErrors);
    
    expect(result.critical).toBe(3);
    expect(result.high).toBe(2);
    expect(result.medium).toBe(2);
    expect(result.low).toBe(2);
    expect(result.unknown).toBe(1);
    expect(result.total).toBe(10);
  });

  test('calculateSeverityPercentages calculates percentages correctly', () => {
    const counts = countBySeverity(testErrors);
    const percentages = calculateSeverityPercentages(counts);
    
    expect(percentages.critical).toBe(30);
    expect(percentages.high).toBe(20);
    expect(percentages.medium).toBe(20);
    expect(percentages.low).toBe(20);
    expect(percentages.unknown).toBe(10);
  });
});
