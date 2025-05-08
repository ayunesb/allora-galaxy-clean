
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
// Replace the problematic import with the components directly
import { NotificationsContainer } from '@/components/notifications/NotificationsContainer';
import { NotificationsPageHeader } from '@/components/notifications/NotificationsPageHeader';

// Define internal type for notification filtering
export type NotificationType = 'all' | 'unread' | 'system' | 'alerts';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="bg-background rounded-lg border shadow-sm">
        <NotificationsPageHeader 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <NotificationsContainer filter={activeFilter} />
      </div>
    </div>
  );
}
