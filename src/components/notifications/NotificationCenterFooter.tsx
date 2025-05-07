
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationCenterFooter: React.FC = () => {
  return (
    <div className="p-3 flex justify-center">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full" 
        asChild
      >
        <Link to="/notifications">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          View All Notifications
        </Link>
      </Button>
    </div>
  );
};

export default NotificationCenterFooter;
