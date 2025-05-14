
import React from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NavigationItem } from '@/types/shared/types';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  items: NavigationItem[];
}

export default function MobileSidebar({ items }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <nav className="flex flex-col gap-4 mt-6">
          {items.map((item, index) => {
            const isActive = item.href === location.pathname;

            return (
              <a
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon && (
                  <item.icon className={cn("h-5 w-5")} />
                )}
                <span>{item.title}</span>
              </a>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
