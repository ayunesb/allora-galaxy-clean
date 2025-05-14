
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const SidebarProfile = () => {
  const { user } = useAuth();
  
  const username = user?.email?.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();
  
  return (
    <div className="flex items-center space-x-3 p-2">
      <Avatar>
        <AvatarImage src="/avatar.png" alt={username} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{username}</p>
        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
};

export default SidebarProfile;
