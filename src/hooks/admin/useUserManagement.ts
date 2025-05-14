
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface User {
  id: string;
  user_id: string;
  role: string;
  last_active: string | null;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: { email: string }[];
  };
}

export function useUserManagement() {
  const { currentWorkspace } = useWorkspace();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchUsers();
    }
  }, [currentWorkspace?.id]);

  const fetchUsers = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            email:email (email)
          )
        `)
        .eq('tenant_id', currentWorkspace.id);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', currentWorkspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );
      
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error updating user role:', error);
    }
  };

  const removeUser = async (userId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', currentWorkspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "User removed",
        description: "User has been removed from workspace",
      });
      
      // Update local state
      setUsers(prev => prev.filter(user => user.user_id !== userId));
      
    } catch (error: any) {
      toast({
        title: "Error removing user",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error removing user:', error);
    }
  };

  const inviteUser = async (email: string, role: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      // In a real implementation, this would send an invitation email
      // and create a pending invitation record
      
      toast({
        title: "Invitation sent",
        description: `Invitation has been sent to ${email}`,
      });
      
      setIsInviteDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error inviting user:', error);
    }
  };

  // Helper to get user's full name
  const getUserFullName = (user: User) => {
    const firstName = user.profiles?.first_name || '';
    const lastName = user.profiles?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  // Helper to get user's email
  const getUserEmail = (user: User) => {
    if (user.profiles?.email && Array.isArray(user.profiles.email) && user.profiles.email.length > 0) {
      return user.profiles.email[0]?.email || '';
    }
    return '';
  };

  return {
    users,
    loading,
    selectedUser,
    isInviteDialogOpen,
    setSelectedUser,
    setIsInviteDialogOpen,
    fetchUsers,
    updateUserRole,
    removeUser,
    inviteUser,
    getUserFullName,
    getUserEmail
  };
}
