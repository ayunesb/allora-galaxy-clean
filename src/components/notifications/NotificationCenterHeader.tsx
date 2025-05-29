import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationCenterHeaderProps {
  onClose: () => void;
  markAllAsRead: () => Promise<void>;
}

const NotificationCenterHeader: React.FC<NotificationCenterHeaderProps> = ({
  onClose,
  markAllAsRead,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h2 className="font-semibold text-lg">Notifications</h2>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="text-xs h-8"
        >
          Mark all as read
        </Button>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenterHeader;
