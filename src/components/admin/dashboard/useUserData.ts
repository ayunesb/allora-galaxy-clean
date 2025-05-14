
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { handleSupabaseError } from '@/lib/errors';

export interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  role: string;
}

interface UseUserDataReturn {
  users: UserData[];
  loading: boolean;
  error: Error | null;
  totalUsers: number;
  newUsersThisWeek: number;
  refetch: () => Promise<void>;
}

const useUserData = (): UseUserDataReturn => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [newUsersThisWeek, setNewUsersThisWeek] = useState<number>(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all users from the auth.users view
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
      setTotalUsers(data?.length || 0);

      // Calculate new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newUsers = data?.filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt >= oneWeekAgo;
      });

      setNewUsersThisWeek(newUsers?.length || 0);
    } catch (err: any) {
      const alloraError = handleSupabaseError(err, {
        context: { operation: 'fetchUsers' },
        showNotification: false
      });
      setError(new Error(alloraError.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    totalUsers,
    newUsersThisWeek,
    refetch: fetchUsers
  };
};

export default useUserData;
