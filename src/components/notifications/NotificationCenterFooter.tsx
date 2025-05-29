import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationCenterFooterProps {
  onMarkAllAsRead?: () => Promise<void>;
}

const NotificationCenterFooter: React.FC<NotificationCenterFooterProps> = ({
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/notifications");
  };

  return (
    <div className="p-3 border-t flex justify-between">
      {onMarkAllAsRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="text-sm"
        >
          Mark all as read
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewAll}
        className="text-sm ml-auto"
      >
        View all
      </Button>
    </div>
  );
};

export default NotificationCenterFooter;
