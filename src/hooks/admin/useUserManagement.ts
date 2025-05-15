
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { User, UserProfile } from '@/components/admin/users/UserTable';

export const useUserManagement = () => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const tenantId = currentWorkspace?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (tenantId) {
      fetchUsers();
    }
  }, [tenantId]);
  
  const fetchUsers = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          role,
          user_id,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            email:id(email)
          )
        `)
        .eq('tenant_id', tenantId);
        
      if (error) {
        throw error;
      }
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = (data || []).map((item: any) => {
        const email = item.profiles?.email?.[0]?.email || '';
        const lastLogin = new Date().toISOString(); // Mock last login data
        
        return {
          id: item.id,
          user_id: item.user_id,
          role: item.role,
          email: email,
          lastLogin: lastLogin,
          created_at: item.created_at,
          profiles: item.profiles as UserProfile
        };
      });
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast("Error fetching users", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!tenantId) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast("Role updated", {
        description: `User role updated to ${newRole}`
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast("Error updating role", {
        description: error.message
      });
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    if (!tenantId) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast("User removed", {
        description: "User has been removed from the workspace"
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast("Error removing user", {
        description: error.message
      });
    }
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const firstName = user.profiles?.first_name || '';
    const lastName = user.profiles?.last_name || '';
    const email = user.profiles?.email?.[0]?.email || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
    
    const query = searchQuery.toLowerCase().trim();
    
    return fullName.includes(query) || 
      firstName.toLowerCase().includes(query) || 
      lastName.toLowerCase().includes(query) || 
      email.toLowerCase().includes(query);
  });

  return {
    users: filteredUsers,
    loading,
    searchQuery,
    setSearchQuery,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
    handleUpdateRole,
    handleRemoveUser
  };
};

export default useUserManagement;
