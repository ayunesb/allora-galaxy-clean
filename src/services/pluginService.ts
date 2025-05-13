
import { supabase } from '@/lib/supabase';
import { Plugin } from '@/types/plugin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Interface for plugin filters
 */
export interface PluginFilters {
  tenant_id?: string;
  status?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'created_at' | 'xp' | 'roi';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for plugin creation
 */
export interface PluginCreateInput {
  name: string;
  description?: string;
  tenant_id?: string;
  status?: string;
  category?: string;
  version: string;
  icon?: string;
  xp?: number;
  roi?: number;
  metadata?: Record<string, any>;
}

/**
 * Interface for plugin updates
 */
export interface PluginUpdateInput {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  category?: string;
  version?: string;
  icon?: string;
  xp?: number;
  roi?: number;
  metadata?: Record<string, any>;
}

/**
 * Fetch plugins with optional filtering
 * @param filters Optional filters to apply
 * @returns Promise resolving to array of Plugin objects
 */
export async function fetchPlugins(filters: PluginFilters = {}): Promise<Plugin[]> {
  try {
    let query = supabase
      .from('plugins')
      .select('*');
    
    // Apply filters
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching plugins:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (err: any) {
    console.error('Error in fetchPlugins:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'plugin',
      'error',
      { message: 'Failed to fetch plugins', error: err.message },
      filters.tenant_id
    );
    return [];
  }
}

/**
 * Fetch a plugin by ID
 * @param id Plugin ID
 * @returns Promise resolving to Plugin object or null
 */
export async function fetchPluginById(id: string): Promise<Plugin | null> {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching plugin by ID:', error);
      throw error;
    }
    
    return data;
    
  } catch (err: any) {
    console.error('Error in fetchPluginById:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'plugin',
      'error',
      { message: 'Failed to fetch plugin by ID', plugin_id: id, error: err.message }
    );
    return null;
  }
}

/**
 * Create a new plugin
 * @param plugin Plugin data to create
 * @returns Promise resolving to created Plugin or null
 */
export async function createPlugin(
  plugin: PluginCreateInput
): Promise<Plugin | null> {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .insert(plugin)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating plugin:', error);
      throw error;
    }
    
    // Log the creation event
    await logSystemEvent(
      'plugin',
      'create',
      { 
        plugin_id: data.id, 
        name: data.name
      },
      plugin.tenant_id
    );
    
    return data;
    
  } catch (err: any) {
    console.error('Error in createPlugin:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'plugin',
      'error',
      { message: 'Failed to create plugin', error: err.message },
      plugin.tenant_id
    );
    return null;
  }
}

/**
 * Update an existing plugin
 * @param plugin Plugin data to update
 * @returns Promise resolving to updated Plugin or null
 */
export async function updatePlugin(
  plugin: PluginUpdateInput
): Promise<Plugin | null> {
  try {
    // Get the current plugin to preserve tenant_id
    const current = await fetchPluginById(plugin.id);
    if (!current) {
      throw new Error(`Plugin not found: ${plugin.id}`);
    }
    
    const { data, error } = await supabase
      .from('plugins')
      .update(plugin)
      .eq('id', plugin.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating plugin:', error);
      throw error;
    }
    
    // Log the update event
    await logSystemEvent(
      'plugin',
      'update',
      { 
        plugin_id: data.id, 
        name: data.name,
        fields_updated: Object.keys(plugin).filter(key => key !== 'id')
      },
      current.tenant_id
    );
    
    return data;
    
  } catch (err: any) {
    console.error('Error in updatePlugin:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'plugin',
      'error',
      { message: 'Failed to update plugin', plugin_id: plugin.id, error: err.message }
    );
    return null;
  }
}

/**
 * Delete a plugin
 * @param id Plugin ID
 * @param tenantId Tenant ID for logging
 * @returns Promise resolving to success status
 */
export async function deletePlugin(
  id: string,
  tenantId?: string
): Promise<boolean> {
  try {
    // Get the current plugin for logging
    const current = await fetchPluginById(id);
    if (!current) {
      throw new Error(`Plugin not found: ${id}`);
    }
    
    const { error } = await supabase
      .from('plugins')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting plugin:', error);
      throw error;
    }
    
    // Log the deletion event
    await logSystemEvent(
      'plugin',
      'delete',
      { 
        plugin_id: id, 
        name: current.name
      },
      current.tenant_id || tenantId
    );
    
    return true;
    
  } catch (err: any) {
    console.error('Error in deletePlugin:', err);
    // Log the error to the system logs
    await logSystemEvent(
      'plugin',
      'error',
      { message: 'Failed to delete plugin', plugin_id: id, error: err.message },
      tenantId
    );
    return false;
  }
}

/**
 * Custom hook to fetch plugins with React Query
 * @param filters Optional filters to apply
 * @returns Query result object
 */
export function usePlugins(filters: PluginFilters = {}) {
  return useQuery({
    queryKey: ['plugins', filters],
    queryFn: () => fetchPlugins(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Custom hook to fetch a plugin by ID with React Query
 * @param id Plugin ID
 * @returns Query result object
 */
export function usePlugin(id: string | undefined) {
  return useQuery({
    queryKey: ['plugin', id],
    queryFn: () => id ? fetchPluginById(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Custom hook to create a plugin with React Query
 * @returns Mutation result object
 */
export function useCreatePlugin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlugin,
    onSuccess: (data) => {
      if (data?.tenant_id) {
        queryClient.invalidateQueries({ queryKey: ['plugins', { tenant_id: data.tenant_id }] });
      }
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });
}

/**
 * Custom hook to update a plugin with React Query
 * @returns Mutation result object
 */
export function useUpdatePlugin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePlugin,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['plugin', data.id] });
        if (data.tenant_id) {
          queryClient.invalidateQueries({ queryKey: ['plugins', { tenant_id: data.tenant_id }] });
        }
        queryClient.invalidateQueries({ queryKey: ['plugins'] });
      }
    },
  });
}

/**
 * Custom hook to delete a plugin with React Query
 * @returns Mutation result object
 */
export function useDeletePlugin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId?: string }) => 
      deletePlugin(id, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plugin', variables.id] });
      if (variables.tenantId) {
        queryClient.invalidateQueries({ queryKey: ['plugins', { tenant_id: variables.tenantId }] });
      }
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });
}

/**
 * Fetch plugin categories
 * @param tenantId Optional tenant ID to filter by
 * @returns Promise resolving to array of category names
 */
export async function fetchPluginCategories(tenantId?: string): Promise<string[]> {
  try {
    let query = supabase
      .from('plugins')
      .select('category');
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching plugin categories:', error);
      throw error;
    }
    
    // Extract unique categories
    const uniqueCategories = Array.from(
      new Set(data.map(item => item.category).filter(Boolean))
    );
    
    return uniqueCategories;
    
  } catch (err: any) {
    console.error('Error in fetchPluginCategories:', err);
    return [];
  }
}

/**
 * Custom hook to fetch plugin categories with React Query
 * @param tenantId Optional tenant ID
 * @returns Query result object
 */
export function usePluginCategories(tenantId?: string) {
  return useQuery({
    queryKey: ['plugin_categories', tenantId],
    queryFn: () => fetchPluginCategories(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
