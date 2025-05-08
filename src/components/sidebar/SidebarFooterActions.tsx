
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Import Sidebar components
import { 
  SidebarMenu,
  SidebarMenuButton
} from '@/components/ui/sidebar';

const SidebarFooterActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  const handleHelpClick = () => {
    // Open help documentation in a new tab
    window.open('https://docs.alloraos.com', '_blank');
  };
  
  return (
    <SidebarMenu>
      <SidebarMenuButton icon={<Settings className="h-4 w-4" />} onClick={handleSettingsClick}>
        {t('navigation.settings')}
      </SidebarMenuButton>
      
      <SidebarMenuButton icon={<HelpCircle className="h-4 w-4" />} onClick={handleHelpClick}>
        {t('navigation.help')}
      </SidebarMenuButton>
      
      <SidebarMenuButton icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
        {t('auth.logout')}
      </SidebarMenuButton>
    </SidebarMenu>
  );
};

export default SidebarFooterActions;
