
import React, { ReactNode } from 'react';
import Header from './Header';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarMenu } from '@/components/ui/sidebar';
import { getNavigationItems } from '@/contexts/workspace/navigationItems';
import { useRBAC } from '@/hooks/useRBAC';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showSidebar = true,
  title,
}) => {
  const { isAdmin } = useRBAC();
  const navigationItems = getNavigationItems(isAdmin());

  // Create sidebar items from navigation items
  const renderSidebarItems = () => {
    return navigationItems.map(item => (
      <SidebarMenu
        key={item.title}
        title={item.title}
        icon={item.icon}
        link={item.href}
      />
    ));
  };

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <Header title={title} />}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar className="w-64 flex-shrink-0 border-r hidden md:block">
            {renderSidebarItems()}
          </Sidebar>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
