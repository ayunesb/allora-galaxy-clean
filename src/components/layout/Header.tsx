
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BellIcon, MenuIcon, Sun, Moon } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import MobileSidebar from "./MobileSidebar";
import { useTheme } from "@/hooks/useTheme";
import { useRBAC } from "@/hooks/useRBAC";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Allora OS" }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useRBAC();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileItemClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleNotifications}>
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {showNotifications && (
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileSidebar onItemClick={handleMobileItemClick} />
      )}
    </header>
  );
}

export default Header;
