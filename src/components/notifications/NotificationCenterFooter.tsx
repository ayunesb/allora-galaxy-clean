
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const NotificationCenterFooter: React.FC = () => {
  return (
    <DropdownMenuItem className="flex items-center justify-center cursor-pointer h-10">
      <Button variant="ghost" size="sm" asChild className="w-full">
        <a href="/settings/notifications" className="flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </a>
      </Button>
    </DropdownMenuItem>
  );
};

export default NotificationCenterFooter;
