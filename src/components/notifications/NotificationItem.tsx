
import React from "react";
import { Check, Bell, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NotificationContent } from "@/types/notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationType } from "@/types/shared";

interface NotificationItemProps {
  notification: NotificationContent;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const { id, title, message, type, timestamp, read } = notification;
  
  const getIconForType = () => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const timeAgo = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 transition-colors",
        read ? "bg-background" : "bg-muted/30",
        "border-b last:border-b-0"
      )}
    >
      <div className="mt-1">{getIconForType()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium", !read && "text-foreground")}>{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <time className="text-xs text-muted-foreground">{timeAgo}</time>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => onDelete(id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {!read && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2"
            onClick={() => onMarkAsRead(id)}
          >
            <Check className="mr-1 h-3 w-3" />
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;
