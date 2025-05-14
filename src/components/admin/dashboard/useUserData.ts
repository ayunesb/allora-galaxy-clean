
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
}

export interface UserFilter {
  role?: string;
  search?: string;
  active?: boolean | null;
}

export function useUserData(initialFilter: UserFilter = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch users with pagination and filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filter, page, pageSize],
    queryFn: async () => {
      // Start with the base query
      let query = supabase
        .from('users_view')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.role) {
        query = query.eq('role', filter.role);
      }
      if (filter.search) {
        query = query.or(`email.ilike.%${filter.search}%,full_name.ilike.%${filter.search}%`);
      }
      if (filter.active !== null && filter.active !== undefined) {
        query = query.eq('is_active', filter.active);
      }

      // Calculate pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Execute query with range pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return {
        users: data as User[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
        currentPage: page,
        pageSize
      };
    },
    keepPreviousData: true
  });

  // Update user role or status
  const updateUser = useMutation({
    mutationFn: async ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: Partial<User> 
    }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { userId, data };
    },
    onSuccess: ({ userId, data }) => {
      let message = 'User updated successfully';
      let description = '';
      
      if ('role' in data) {
        message = 'User role updated';
        description = `The user's role has been updated to ${data.role}`;
      } else if ('is_active' in data) {
        message = data.is_active ? 'User activated' : 'User deactivated';
        description = data.is_active 
          ? 'The user account has been activated' 
          : 'The user account has been deactivated';
      }
      
      toast.success(message, { description });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update user', {
        description: error.message || 'An error occurred while updating user data'
      });
    }
  });

  return {
    userData: data?.users || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: page,
    isLoading,
    error,
    filter,
    setFilter,
    page,
    setPage,
    pageSize,
    updateUser
  };
}
