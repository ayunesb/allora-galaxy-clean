
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface NotificationCenterFooterProps {
  onMarkAllAsRead: () => Promise<void>;
}

const NotificationCenterFooter: React.FC<NotificationCenterFooterProps> = ({ onMarkAllAsRead }) => {
  return (
    <div className="border-t p-3 flex justify-between items-center">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onMarkAllAsRead()}
      >
        Mark all as read
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link to="/notifications" className="flex items-center">
          <span>View all</span>
          <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
};

export default NotificationCenterFooter;
