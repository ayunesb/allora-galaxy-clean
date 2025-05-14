
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useWorkspace } from '@/context/WorkspaceContext';
import UserAccountNav from '@/components/layout/UserAccountNav';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const { navigation, workspace } = useWorkspace();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {toggleSidebar && (
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
        
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Allora OS</span>
            <Badge variant="outline" className="text-xs font-normal">Galaxy</Badge>
          </Link>
          
          {workspace && <WorkspaceSwitcher />}
        </div>
        
        <div className="mr-4 flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <div className="px-7">
                <Link to="/" className="flex items-center space-x-2 mb-8 mt-4">
                  <span className="font-bold text-lg">Allora OS</span>
                  <Badge variant="outline">Galaxy</Badge>
                </Link>
              </div>
              <SidebarNav items={navigation} />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          
          <NotificationCenter />
          
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
          
          <UserAccountNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
