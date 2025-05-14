
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { navigationItems } from '@/contexts/workspace/navigationItems';
import MobileSidebar from './MobileSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
      <div className="md:hidden">
        <MobileSidebar items={navigationItems} />
      </div>
    </div>
  );
}
