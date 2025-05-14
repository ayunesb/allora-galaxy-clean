import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { notifyError, notifySuccess } from '@/lib/notifications/toast';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: string;
  name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  avatar_url?: string;
  is_active?: boolean;
}

interface UseUserDataResult {
  userData: UserData[] | null;
  loading: boolean;
  error: string | null;
  updateUserRole: (userId: string, newRole: string, userName: string) => Promise<void>;
  toggleUserActiveStatus: (userId: string, isActive: boolean, userName: string) => Promise<void>;
}

const useUserData = (): UseUserDataResult => {
  const [userData, setUserData] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) {
          setError(error.message);
          console.error("Error fetching user data:", error);
          notifyError(`Failed to fetch user data: ${error.message}`);
        }

        if (data) {
          setUserData(data as UserData[]);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Unexpected error fetching user data:", err);
        notifyError(`Unexpected error fetching user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  const updateUserRole = async (userId: string, newRole: string, userName: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user role:", error);
        notifyError(`Failed to update user role: ${error.message}`);
      } else {
        toast.success("User role updated", {
          description: `Updated ${userName}'s role to ${newRole}`
        });
        // Optimistically update the local state
        setUserData(prevUserData =>
          prevUserData ? prevUserData.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          ) : null
        );
      }
    } catch (err: any) {
      console.error("Unexpected error updating user role:", err);
      notifyError(`Unexpected error updating user role: ${err.message}`);
    }
  };

  const toggleUserActiveStatus = async (userId: string, isActive: boolean, userName: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        console.error("Error toggling user active status:", error);
        notifyError(`Failed to toggle user active status: ${error.message}`);
      } else {
        notifySuccess(`User ${userName} ${isActive ? 'activated' : 'deactivated'} successfully`);
        // Optimistically update the local state
        setUserData(prevUserData =>
          prevUserData ? prevUserData.map(user =>
            user.id === userId ? { ...user, is_active: isActive } : user
          ) : null
        );
      }
    } catch (err: any) {
      console.error("Unexpected error toggling user active status:", err);
      notifyError(`Unexpected error toggling user active status: ${err.message}`);
    }
  };

  return { userData, loading, error, updateUserRole, toggleUserActiveStatus };
};

export default useUserData;
