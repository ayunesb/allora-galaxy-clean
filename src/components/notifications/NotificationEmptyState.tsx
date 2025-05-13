
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Bell className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-1">No notifications found</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        There are no notifications matching your current filters. Try adjusting your filters or check back later.
      </p>
    </div>
  );
};

export default NotificationEmptyState;
