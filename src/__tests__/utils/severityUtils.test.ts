
import { describe, test, expect } from 'vitest';
import { 
  getSeverityColor, 
  getSeverityLabel, 
  countBySeverity, 
  calculateSeverityPercentages 
} from '@/components/admin/errors/utils/severityUtils';
import type { SystemLog } from '@/types/logs';

describe('severityUtils', () => {
  const mockLogs: SystemLog[] = [
    { id: '1', created_at: '2023-01-01', timestamp: '2023-01-01', module: 'test', level: 'error', event: 'test', event_type: 'error', description: 'Test', message: 'Test error 1', tenant_id: 'test', severity: 'critical', context: {} },
    { id: '2', created_at: '2023-01-01', timestamp: '2023-01-01', module: 'test', level: 'error', event: 'test', event_type: 'error', description: 'Test', message: 'Test error 2', tenant_id: 'test', severity: 'high', context: {} },
    { id: '3', created_at: '2023-01-01', timestamp: '2023-01-01', module: 'test', level: 'error', event: 'test', event_type: 'error', description: 'Test', message: 'Test error 3', tenant_id: 'test', severity: 'medium', context: {} },
    { id: '4', created_at: '2023-01-01', timestamp: '2023-01-01', module: 'test', level: 'error', event: 'test', event_type: 'error', description: 'Test', message: 'Test error 4', tenant_id: 'test', severity: 'low', context: {} },
    { id: '5', created_at: '2023-01-01', timestamp: '2023-01-01', module: 'test', level: 'error', event: 'test', event_type: 'error', description: 'Test', message: 'Test error 5', tenant_id: 'test', severity: 'high', context: {} },
  ];

  test('getSeverityColor returns correct color classes', () => {
    expect(getSeverityColor('critical')).toContain('text-red-500');
    expect(getSeverityColor('high')).toContain('text-amber-500');
    expect(getSeverityColor('medium')).toContain('text-yellow-500');
    expect(getSeverityColor('low')).toContain('text-blue-500');
    expect(getSeverityColor(undefined)).toContain('text-gray-500');
  });

  test('getSeverityLabel returns correct human-readable labels', () => {
    expect(getSeverityLabel('critical')).toBe('Critical');
    expect(getSeverityLabel('high')).toBe('High');
    expect(getSeverityLabel('medium')).toBe('Medium');
    expect(getSeverityLabel('low')).toBe('Low');
    expect(getSeverityLabel(undefined)).toBe('Unknown');
  });

  test('countBySeverity counts logs by severity correctly', () => {
    const counts = countBySeverity(mockLogs);
    
    expect(counts.critical).toBe(1);
    expect(counts.high).toBe(2);
    expect(counts.medium).toBe(1);
    expect(counts.low).toBe(1);
    expect(counts.unknown).toBe(0);
  });

  test('calculateSeverityPercentages calculates correct percentages', () => {
    const percentages = calculateSeverityPercentages(mockLogs);
    
    expect(percentages.critical).toBe(20);
    expect(percentages.high).toBe(40);
    expect(percentages.medium).toBe(20);
    expect(percentages.low).toBe(20);
    expect(percentages.unknown).toBe(0);
  });
});
