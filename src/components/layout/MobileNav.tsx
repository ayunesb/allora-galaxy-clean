
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/WorkspaceContext';

// Add your navigation items here
const navigationItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Strategies', path: '/launch' },
  { name: 'Plugins', path: '/plugins' },
  { name: 'Galaxy Explorer', path: '/explore' },
  { name: 'Agent Performance', path: '/agents/performance' },
  { name: 'KPI Dashboard', path: '/insights/kpis' },
];

const adminItems = [
  { name: 'AI Decisions', path: '/admin/ai-decisions' },
  { name: 'Plugin Logs', path: '/admin/plugin-logs' },
  { name: 'System Logs', path: '/admin/system-logs' },
  { name: 'User Management', path: '/admin/users' },
];

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTenant } = useWorkspace();
  const [open, setOpen] = React.useState(false);
  
  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle>
            {currentTenant?.name || 'Navigation'}
          </SheetTitle>
        </SheetHeader>
        <div className="pt-6 pb-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  location.pathname === item.path && 'bg-secondary'
                )}
                onClick={() => handleNavigate(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </div>

          <Separator className="my-4" />
          
          <div className="pt-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            <div className="mt-2 space-y-1">
              {adminItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    location.pathname === item.path && 'bg-secondary'
                  )}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
