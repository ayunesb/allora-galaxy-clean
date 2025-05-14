
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { UserRole } from '@/types/shared';

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: { email: string }[];
}

export interface User {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  profiles: UserProfile;
  last_active?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  // Fetch users when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchUsers();
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  // Fetch users from the database
  const fetchUsers = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id(
            first_name,
            last_name,
            avatar_url,
            email(email)
          )
        `)
        .eq('tenant_id', currentWorkspace.id);

      if (error) throw error;

      if (data) {
        // Transform data to match our User type
        const formattedUsers = data.map(item => {
          // Process profiles data to match UserProfile type
          const profileData: UserProfile = {
            first_name: '',
            last_name: '',
            avatar_url: '',
            email: []
          };
          
          if (item.profiles) {
            const profiles = item.profiles as unknown as any;
            profileData.first_name = profiles.first_name || '';
            profileData.last_name = profiles.last_name || '';
            profileData.avatar_url = profiles.avatar_url || '';
            profileData.email = Array.isArray(profiles.email) ? profiles.email : [];
          }
          
          return {
            id: item.id,
            user_id: item.user_id,
            role: item.role,
            created_at: item.created_at,
            profiles: profileData,
            last_active: undefined // Add if available in the future
          };
        });
        
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error loading users',
        description: error.message || 'Failed to load user data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, toast]);

  // Change user role
  const changeUserRole = async (userId: string, newRole: UserRole | string): Promise<boolean> => {
    if (!currentWorkspace?.id) return false;

    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('tenant_id', currentWorkspace.id);

      if (error) throw error;

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId ? { ...user, role: newRole as string } : user
        )
      );

      // Log the role change
      await logSystemEvent(
        'auth',
        'info',
        {
          description: `User role updated to ${newRole}`,
          event_type: 'role_change',
          target_user_id: userId,
          new_role: newRole
        },
        currentWorkspace.id
      );

      toast({
        title: 'Role updated',
        description: `User role has been updated to ${newRole}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error updating role',
        description: error.message || 'Failed to update user role',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Remove user from workspace
  const removeUser = async (userId: string): Promise<boolean> => {
    if (!currentWorkspace?.id) return false;

    try {
      // Find user details before removal for logging
      const userToRemove = users.find(u => u.user_id === userId);
      const userEmail = userToRemove?.profiles?.email?.[0]?.email || 'unknown';
      
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', currentWorkspace.id);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.filter(user => user.user_id !== userId));

      // Log the removal
      await logSystemEvent(
        'auth',
        'warning',
        {
          description: `User removed from workspace`,
          event_type: 'user_removal',
          target_user_id: userId,
          email: userEmail
        },
        currentWorkspace.id
      );

      toast({
        title: 'User removed',
        description: 'User has been removed from the workspace',
      });

      return true;
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error removing user',
        description: error.message || 'Failed to remove user',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.toLowerCase();
    const email = user.profiles?.email?.[0]?.email?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    changeUserRole,
    removeUser
  };
}
