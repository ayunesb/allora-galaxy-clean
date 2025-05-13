
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface UserProfile {
  first_name: string;
  last_name: string;
  avatar_url: string;
  email: { email: string };
}

export interface User {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  profiles: UserProfile;
}

export function useUserData() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentWorkspace?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select(`
            id,
            role,
            created_at,
            user_id,
            profiles:user_id(
              first_name,
              last_name,
              avatar_url,
              email(email)
            )
          `)
          .eq('tenant_id', currentWorkspace.id);
          
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Correctly format the profiles data
          const formattedUsers = data.map(item => {
            const profileData = item.profiles || {};
            
            return {
              id: item.id,
              role: item.role,
              created_at: item.created_at,
              user_id: item.user_id,
              profiles: {
                first_name: typeof profileData === 'object' ? profileData.first_name || '' : '',
                last_name: typeof profileData === 'object' ? profileData.last_name || '' : '',
                avatar_url: typeof profileData === 'object' ? profileData.avatar_url || '' : '',
                email: {
                  email: typeof profileData === 'object' && 
                         Array.isArray(profileData.email) && 
                         profileData.email.length > 0 && 
                         profileData.email[0]?.email
                    ? profileData.email[0].email 
                    : ''
                }
              }
            };
          });
          
          setUsers(formattedUsers);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message || "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentWorkspace?.id, toast]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    // Implementation of updating user role
    console.log(`Updating role for user ${userId} to ${newRole}`);
  };

  const handleRemoveUser = (userId: string) => {
    // Implementation of removing a user
    console.log(`Removing user ${userId}`);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.toLowerCase();
    const email = user.profiles?.email?.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return {
    users: filteredUsers,
    loading,
    searchQuery,
    handleSearchChange,
    handleUpdateRole,
    handleRemoveUser
  };
}
