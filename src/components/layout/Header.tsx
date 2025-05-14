
import { useState } from 'react';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import MobileSidebar from './MobileSidebar';
import { NotificationCenter } from './NotificationCenter';
import { useNavigate } from 'react-router-dom';
import { navigationItems } from '@/contexts/workspace/navigationItems';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Galaxy Command Center' }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/settings/profile');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileSidebar items={navigationItems} onItemClick={() => {}} />
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <span className="text-lg font-semibold">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            {showNotifications && (
              <NotificationCenter onClose={closeNotifications} />
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
            aria-label="User Profile"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
