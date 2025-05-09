
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  BarChart, 
  Users, 
  Settings,
  GanttChart,
  Globe,
  Plug,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTenantRole } from '@/hooks/useTenantRole';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-secondary',
          isActive ? 'bg-secondary text-primary font-medium' : 'text-muted-foreground'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { role } = useTenantRole();
  
  const isAdmin = role === 'admin' || role === 'owner';

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Allora OS</h2>
        </div>
        
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            <SidebarLink to="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" end />
            <SidebarLink to="/launch" icon={<Layers className="h-4 w-4" />} label="Launch" />
            <SidebarLink to="/galaxy" icon={<Globe className="h-4 w-4" />} label="Galaxy" />
            <SidebarLink to="/plugins" icon={<Plug className="h-4 w-4" />} label="Plugins" />
            <SidebarLink to="/evolution" icon={<Activity className="h-4 w-4" />} label="Evolution" />
            <SidebarLink to="/agents/performance" icon={<GanttChart className="h-4 w-4" />} label="Agent Performance" />
            <SidebarLink to="/insights/kpis" icon={<BarChart className="h-4 w-4" />} label="KPI Dashboard" />
            
            {isAdmin && (
              <>
                <div className="my-2 px-3">
                  <h3 className="mb-1 text-xs font-medium text-muted-foreground">Admin</h3>
                  <SidebarLink to="/admin/dashboard" icon={<ShieldAlert className="h-4 w-4" />} label="Admin Dashboard" />
                  <SidebarLink to="/admin/users" icon={<Users className="h-4 w-4" />} label="User Management" />
                  <SidebarLink to="/admin/system-logs" icon={<Activity className="h-4 w-4" />} label="System Logs" />
                </div>
              </>
            )}
            
            <div className="mt-auto pt-4">
              <SidebarLink to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
            </div>
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
