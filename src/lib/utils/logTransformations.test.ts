
import { 
  systemLogToAuditLog, 
  auditLogToSystemLog, 
  groupLogsByDate,
  filterLogsBySearchTerm
} from './logTransformations';
import { SystemLog, AuditLog } from '@/types/logs';

describe('Log Transformation Utilities', () => {
  const mockSystemLog: SystemLog = {
    id: 'sys-123',
    module: 'auth',
    event: 'login',
    level: 'info',
    description: 'User login successful',
    context: { user_id: 'user-123', resource_id: 'session-456' },
    tenant_id: 'tenant-123',
    created_at: '2023-05-10T14:30:00.000Z',
    user_id: 'user-123'
  };

  const mockAuditLog: AuditLog = {
    id: 'audit-123',
    action: 'create',
    entity_type: 'user',
    entity_id: 'user-456',
    user_id: 'admin-123',
    tenant_id: 'tenant-123',
    details: { before: null, after: { name: 'John Doe' } },
    created_at: '2023-05-10T14:30:00.000Z',
    module: 'user',
    event: 'create'
  };

  describe('systemLogToAuditLog', () => {
    it('converts a system log to audit log format correctly', () => {
      const result = systemLogToAuditLog(mockSystemLog);
      
      expect(result).toEqual({
        id: mockSystemLog.id,
        action: mockSystemLog.event,
        entity_type: mockSystemLog.module,
        entity_id: mockSystemLog.context?.resource_id,
        user_id: mockSystemLog.context?.user_id,
        tenant_id: mockSystemLog.tenant_id,
        details: mockSystemLog.context,
        created_at: mockSystemLog.created_at,
        module: mockSystemLog.module,
        event: mockSystemLog.event,
        description: mockSystemLog.description,
        context: mockSystemLog.context
      });
    });

    it('handles missing fields gracefully', () => {
      const partialLog: SystemLog = {
        id: 'sys-456',
        module: 'system',
        event: 'error',
        created_at: '2023-05-10T14:30:00.000Z'
      };
      
      const result = systemLogToAuditLog(partialLog);
      
      expect(result.tenant_id).toBe('');
      expect(result.user_id).toBe('system');
      expect(result.entity_id).toBe(partialLog.id);
    });
  });

  describe('auditLogToSystemLog', () => {
    it('converts an audit log to system log format correctly', () => {
      const result = auditLogToSystemLog(mockAuditLog);
      
      expect(result).toEqual({
        id: mockAuditLog.id,
        module: mockAuditLog.entity_type,
        event: mockAuditLog.action,
        level: 'info',
        description: mockAuditLog.description || '',
        context: mockAuditLog.details,
        tenant_id: mockAuditLog.tenant_id,
        created_at: mockAuditLog.created_at,
        user_id: mockAuditLog.user_id
      });
    });

    it('sets level to error for error events', () => {
      const errorAuditLog = { 
        ...mockAuditLog, 
        action: 'error', 
        details: { level: 'error', message: 'Something went wrong' } 
      };
      
      const result = auditLogToSystemLog(errorAuditLog);
      expect(result.level).toBe('error');
    });
  });

  describe('groupLogsByDate', () => {
    it('groups logs by date correctly', () => {
      const logs = [
        { id: '1', created_at: '2023-05-10T10:00:00.000Z' },
        { id: '2', created_at: '2023-05-10T14:30:00.000Z' },
        { id: '3', created_at: '2023-05-11T09:15:00.000Z' },
      ];
      
      const result = groupLogsByDate(logs);
      
      const dates = Object.keys(result);
      expect(dates.length).toBe(2);
      expect(result[dates[0]].length).toBe(2);
      expect(result[dates[1]].length).toBe(1);
    });

    it('returns empty object for empty array', () => {
      const result = groupLogsByDate([]);
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('filterLogsBySearchTerm', () => {
    it('filters system logs by module correctly', () => {
      const logs = [
        { ...mockSystemLog, id: '1', module: 'auth' },
        { ...mockSystemLog, id: '2', module: 'user' },
        { ...mockSystemLog, id: '3', module: 'auth' },
      ];
      
      const result = filterLogsBySearchTerm(logs, 'auth');
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('filters system logs by event correctly', () => {
      const logs = [
        { ...mockSystemLog, id: '1', event: 'login' },
        { ...mockSystemLog, id: '2', event: 'logout' },
        { ...mockSystemLog, id: '3', event: 'login' },
      ];
      
      const result = filterLogsBySearchTerm(logs, 'logout');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    it('filters system logs by description correctly', () => {
      const logs = [
        { ...mockSystemLog, id: '1', description: 'Login successful' },
        { ...mockSystemLog, id: '2', description: 'Login failed' },
        { ...mockSystemLog, id: '3', description: 'User created' },
      ];
      
      const result = filterLogsBySearchTerm(logs, 'login');
      expect(result.length).toBe(2);
    });

    it('returns all logs when search term is empty', () => {
      const logs = [
        { ...mockSystemLog, id: '1' },
        { ...mockSystemLog, id: '2' },
      ];
      
      const result = filterLogsBySearchTerm(logs, '');
      expect(result.length).toBe(2);
    });
  });
});
