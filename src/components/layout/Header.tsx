import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  Menu
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MobileSidebar from './MobileSidebar';

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, userRole, signOut } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'owner';

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!user) return '?';
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <MobileSidebar/>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:block">
          <WorkspaceSwitcher />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" asChild>
          <Link to="/notifications" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>

        {/* Admin Panel Access */}
        {isAdmin && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin" aria-label="Admin Panel">
              <Shield className="h-5 w-5 text-blue-600" />
            </Link>
          </Button>
        )}
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              {userRole && (
                <span className="absolute -bottom-1 -right-1">
                  <Badge variant="outline" className="h-4 w-4 rounded-full p-1 text-[8px] uppercase">
                    {userRole.charAt(0)}
                  </Badge>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
                {userRole && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {userRole}
                  </p>
                )}
                {currentWorkspace && (
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    Workspace: {currentWorkspace.name}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
