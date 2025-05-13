
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationCenterLoading: React.FC = () => {
  // Create an array of 5 items for skeleton loading
  const items = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="p-4 space-y-4">
      {items.map((item) => (
        <div key={item} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenterLoading;
