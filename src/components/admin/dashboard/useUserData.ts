
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  role: string;
  last_sign_in?: string;
}

const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, last_sign_in')
          .order('role', { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error removing user:', err);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    users: filteredUsers,
    loading,
    searchQuery,
    handleSearchChange,
    handleUpdateRole,
    handleRemoveUser
  };
};

export default useUserData;
