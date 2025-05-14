
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { NavigationItem } from '@/types/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface MobileSidebarProps {
  items: NavigationItem[];
  onItemClick?: () => void; // Add this optional prop
}

export default function MobileSidebar({ items, onItemClick }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleItemClick = () => {
    setOpen(false);
    // Call the passed onItemClick handler if it exists
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-2 mt-4">
          {items.map((item, index) => (
            <Button 
              key={index}
              variant="ghost" 
              className="justify-start"
              asChild
              onClick={handleItemClick}
            >
              <a href={item.href}>
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
              </a>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
