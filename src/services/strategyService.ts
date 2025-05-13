
import { supabase } from '@/lib/supabase';
import { Strategy, CreateStrategyInput } from '@/types/strategy';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDisplayDate } from '@/lib/utils/date';

export const fetchStrategies = async (tenantId: string, status?: Strategy['status']) => {
  let query = supabase
    .from('strategies')
    .select('*')
    .eq('tenant_id', tenantId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data as Strategy[];
};

export const fetchStrategy = async (id: string) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    throw error;
  }
  
  return data as Strategy;
};

export const createStrategy = async (strategy: CreateStrategyInput) => {
  const { data, error } = await supabase
    .from('strategies')
    .insert([strategy])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const updateStrategy = async (id: string, updates: Partial<Strategy>) => {
  const { data, error } = await supabase
    .from('strategies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const approveStrategy = async (id: string, userId: string) => {
  const { data, error } = await supabase
    .from('strategies')
    .update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const rejectStrategy = async (id: string, userId: string, reason: string) => {
  const { data, error } = await supabase
    .from('strategies')
    .update({
      status: 'rejected',
      rejected_by: userId,
      rejected_at: new Date().toISOString(),
      metadata: { rejection_reason: reason }
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const useStrategies = (tenantId: string, status?: Strategy['status']) => {
  return useQuery({
    queryKey: ['strategies', tenantId, status],
    queryFn: () => fetchStrategies(tenantId, status),
    enabled: !!tenantId
  });
};

export const useStrategy = (id: string) => {
  return useQuery({
    queryKey: ['strategy', id],
    queryFn: () => fetchStrategy(id),
    enabled: !!id && id !== 'new'
  });
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: createStrategy,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', variables.tenant_id] });
      toast({
        title: 'Strategy created',
        description: `"${data.title}" has been created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create strategy',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Strategy> }) => 
      updateStrategy(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', data.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ['strategy', data.id] });
      toast({
        title: 'Strategy updated',
        description: `"${data.title}" has been updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update strategy',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

export const useApproveStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      approveStrategy(id, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', data.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ['strategy', data.id] });
      toast({
        title: 'Strategy approved',
        description: `"${data.title}" has been approved successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to approve strategy',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

export const useRejectStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, userId, reason }: { id: string; userId: string; reason: string }) => 
      rejectStrategy(id, userId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', data.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ['strategy', data.id] });
      toast({
        title: 'Strategy rejected',
        description: `"${data.title}" has been rejected`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to reject strategy',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

export const formatStrategyDate = (date: string | null | undefined): string => {
  if (!date) return 'Not set';
  return formatDisplayDate(date);
};
