
import { fetchSystemLogs, fetchAuditLogs, fetchLogModules, fetchLogEvents } from './logService';
import { supabase } from '@/lib/supabase';
import { LogFilters } from '@/types/logs';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  },
}));

describe('logService', () => {
  const mockLogs = [
    { id: 'log-1', module: 'system', event: 'info' },
    { id: 'log-2', module: 'auth', event: 'login' },
  ];

  const mockModules = ['system', 'auth', 'user'];
  const mockEvents = ['info', 'error', 'login'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSystemLogs', () => {
    it('fetches system logs with no filters', async () => {
      // Set up the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          order: () => Promise.resolve({ data: mockLogs, error: null })
        })
      }));

      const result = await fetchSystemLogs();

      expect(supabase.from).toHaveBeenCalledWith('system_logs');
      expect(result).toEqual(mockLogs);
    });

    it('applies filters correctly', async () => {
      // Set up the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.gte as jest.Mock).mockReturnThis();
      (supabase.lt as jest.Mock).mockReturnThis();
      (supabase.or as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          order: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  or: () => ({
                    gte: () => ({
                      lt: () => ({
                        limit: () => ({
                          range: () => Promise.resolve({ data: mockLogs, error: null })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      }));

      const filters: LogFilters = {
        module: 'auth',
        event: 'login',
        tenant_id: 'tenant-123',
        searchTerm: 'test',
        fromDate: new Date('2023-01-01'),
        toDate: new Date('2023-12-31'),
        limit: 10,
        offset: 20,
      };

      const result = await fetchSystemLogs(filters);

      expect(supabase.from).toHaveBeenCalledWith('system_logs');
      expect(supabase.eq).toHaveBeenCalledWith('module', 'auth');
      expect(supabase.eq).toHaveBeenCalledWith('event', 'login');
      expect(supabase.eq).toHaveBeenCalledWith('tenant_id', 'tenant-123');
      expect(supabase.or).toHaveBeenCalled();
      expect(supabase.gte).toHaveBeenCalled();
      expect(supabase.lt).toHaveBeenCalled();
      expect(supabase.limit).toHaveBeenCalledWith(10);
      expect(supabase.range).toHaveBeenCalledWith(20, 29);
      expect(result).toEqual(mockLogs);
    });

    it('throws error when supabase returns an error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          order: () => Promise.resolve({ data: null, error: { message: 'Test error' } })
        })
      }));

      await expect(fetchSystemLogs()).rejects.toThrow('Error fetching system logs: Test error');
    });
  });

  describe('fetchAuditLogs', () => {
    it('fetches audit logs with no filters', async () => {
      // Set up the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          order: () => Promise.resolve({ data: mockLogs, error: null })
        })
      }));

      const result = await fetchAuditLogs();

      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
      expect(result).toEqual(mockLogs);
    });

    // Additional tests similar to fetchSystemLogs...
  });

  describe('fetchLogModules', () => {
    it('fetches unique module names', async () => {
      const moduleData = [
        { module: 'system' },
        { module: 'auth' },
        { module: 'system' }, // Duplicate to test deduplication
        { module: 'user' },
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => Promise.resolve({ data: moduleData, error: null })
      }));

      const result = await fetchLogModules();

      expect(supabase.from).toHaveBeenCalledWith('system_logs');
      expect(result).toEqual(['system', 'auth', 'user']);
    });

    it('throws error when supabase returns an error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Test error' } })
      }));

      await expect(fetchLogModules()).rejects.toThrow('Error fetching log modules: Test error');
    });
  });

  describe('fetchLogEvents', () => {
    it('fetches unique event names', async () => {
      const eventData = [
        { event: 'info' },
        { event: 'error' },
        { event: 'info' }, // Duplicate to test deduplication
        { event: 'login' },
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => Promise.resolve({ data: eventData, error: null })
      }));

      const result = await fetchLogEvents();

      expect(supabase.from).toHaveBeenCalledWith('system_logs');
      expect(result).toEqual(['info', 'error', 'login']);
    });

    it('throws error when supabase returns an error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Test error' } })
      }));

      await expect(fetchLogEvents()).rejects.toThrow('Error fetching log events: Test error');
    });
  });
});
