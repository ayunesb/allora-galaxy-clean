
import { supabase } from '@/lib/supabase';
import { Strategy } from '@/types/strategy';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { formatForDatabase } from '@/lib/utils/date';

/**
 * Interface for strategy filters
 */
export interface StrategyFilters {
  tenant_id?: string;
  status?: string;
  tags?: string[];
  search?: string;
  created_by?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'priority' | 'due_date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for strategy creation
 */
export interface StrategyCreateInput {
  title: string;
  description: string;
  tenant_id: string;
  status?: string;
  created_by?: string;
  due_date?: Date | null;
  priority?: string;
  tags?: string[];
}

/**
 * Interface for strategy updates
 */
export interface StrategyUpdateInput {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  due_date?: Date | null;
  priority?: string;
  tags?: string[];
  completion_percentage?: number;
  approved_by?: string;
}

/**
 * Fetch strategies with optional filtering
 * @param filters Optional filters to apply
 * @returns Promise resolving to array of Strategy objects
 */
export async function fetchStrategies(filters: StrategyFilters = {}): Promise<Strategy[]> {
  try {
    let query = supabase
      .from('strategies')
      .select('*');
    
    // Apply filters
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      // Overlap operator for array columns
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching strategies:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (err: any) {
    console.error('Error in fetchStrategies:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'strategy',
      'error',
      { message: 'Failed to fetch strategies', error: err.message },
      filters.tenant_id
    );
    return [];
  }
}

/**
 * Fetch a strategy by ID
 * @param id Strategy ID
 * @returns Promise resolving to Strategy object or null
 */
export async function fetchStrategyById(id: string): Promise<Strategy | null> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching strategy by ID:', error);
      throw error;
    }
    
    return data;
    
  } catch (err: any) {
    console.error('Error in fetchStrategyById:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'strategy',
      'error',
      { message: 'Failed to fetch strategy by ID', strategy_id: id, error: err.message }
    );
    return null;
  }
}

/**
 * Create a new strategy
 * @param strategy Strategy data to create
 * @returns Promise resolving to created Strategy or null
 */
export async function createStrategy(
  strategy: StrategyCreateInput
): Promise<Strategy | null> {
  try {
    // Format dates for the database
    const formattedStrategy = {
      ...strategy,
      due_date: strategy.due_date ? formatForDatabase(strategy.due_date) : null,
    };
    
    const { data, error } = await supabase
      .from('strategies')
      .insert(formattedStrategy)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating strategy:', error);
      throw error;
    }
    
    // Log the creation event
    await logSystemEvent(
      'strategy',
      'create',
      { 
        strategy_id: data.id, 
        title: data.title,
        created_by: strategy.created_by 
      },
      strategy.tenant_id
    );
    
    return data;
    
  } catch (err: any) {
    console.error('Error in createStrategy:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'strategy',
      'error',
      { message: 'Failed to create strategy', error: err.message },
      strategy.tenant_id
    );
    return null;
  }
}

/**
 * Update an existing strategy
 * @param strategy Strategy data to update
 * @returns Promise resolving to updated Strategy or null
 */
export async function updateStrategy(
  strategy: StrategyUpdateInput
): Promise<Strategy | null> {
  try {
    // Get the current strategy to preserve tenant_id
    const current = await fetchStrategyById(strategy.id);
    if (!current) {
      throw new Error(`Strategy not found: ${strategy.id}`);
    }
    
    // Format dates for the database
    const formattedStrategy = {
      ...strategy,
      due_date: strategy.due_date ? formatForDatabase(strategy.due_date) : null,
    };
    
    const { data, error } = await supabase
      .from('strategies')
      .update(formattedStrategy)
      .eq('id', strategy.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }
    
    // Log the update event
    await logSystemEvent(
      'strategy',
      'update',
      { 
        strategy_id: data.id, 
        title: data.title,
        fields_updated: Object.keys(strategy).filter(key => key !== 'id')
      },
      current.tenant_id
    );
    
    return data;
    
  } catch (err: any) {
    console.error('Error in updateStrategy:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'strategy',
      'error',
      { message: 'Failed to update strategy', strategy_id: strategy.id, error: err.message }
    );
    return null;
  }
}

/**
 * Delete a strategy
 * @param id Strategy ID
 * @param tenantId Tenant ID for logging
 * @returns Promise resolving to success status
 */
export async function deleteStrategy(
  id: string,
  tenantId?: string
): Promise<boolean> {
  try {
    // Get the current strategy for logging
    const current = await fetchStrategyById(id);
    if (!current) {
      throw new Error(`Strategy not found: ${id}`);
    }
    
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
    
    // Log the deletion event
    await logSystemEvent(
      'strategy',
      'delete',
      { 
        strategy_id: id, 
        title: current.title
      },
      current.tenant_id || tenantId
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in deleteStrategy:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'strategy',
      'error',
      { message: 'Failed to delete strategy', strategy_id: id, error: err.message },
      tenantId
    );
    return false;
  }
}

/**
 * Custom hook to fetch strategies with React Query
 * @param filters Optional filters to apply
 * @returns Query result object
 */
export function useStrategies(filters: StrategyFilters = {}) {
  return useQuery({
    queryKey: ['strategies', filters],
    queryFn: () => fetchStrategies(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Custom hook to fetch a strategy by ID with React Query
 * @param id Strategy ID
 * @returns Query result object
 */
export function useStrategy(id: string | undefined) {
  return useQuery({
    queryKey: ['strategy', id],
    queryFn: () => id ? fetchStrategyById(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Custom hook to create a strategy with React Query
 * @returns Mutation result object
 */
export function useCreateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createStrategy,
    onSuccess: (data) => {
      if (data?.tenant_id) {
        queryClient.invalidateQueries({ queryKey: ['strategies', { tenant_id: data.tenant_id }] });
      }
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
}

/**
 * Custom hook to update a strategy with React Query
 * @returns Mutation result object
 */
export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateStrategy,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['strategy', data.id] });
        if (data.tenant_id) {
          queryClient.invalidateQueries({ queryKey: ['strategies', { tenant_id: data.tenant_id }] });
        }
        queryClient.invalidateQueries({ queryKey: ['strategies'] });
      }
    },
  });
}

/**
 * Custom hook to delete a strategy with React Query
 * @returns Mutation result object
 */
export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId?: string }) => 
      deleteStrategy(id, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['strategy', variables.id] });
      if (variables.tenantId) {
        queryClient.invalidateQueries({ queryKey: ['strategies', { tenant_id: variables.tenantId }] });
      }
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
}
