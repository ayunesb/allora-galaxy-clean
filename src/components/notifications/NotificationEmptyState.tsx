import React from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationEmptyStateProps {
  filter: string;
  onRefresh: () => Promise<void>;
}

const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
  filter,
  onRefresh,
}) => {
  const getMessage = () => {
    switch (filter) {
      case "unread":
        return "You have no unread notifications";
      case "system":
        return "No system notifications";
      case "alerts":
        return "No alert notifications";
      default:
        return "No notifications yet";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{getMessage()}</h3>
      <p className="text-muted-foreground mb-6">
        {filter === "all"
          ? "Notifications will appear here when you receive them."
          : "Check back later or try a different filter."}
      </p>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default NotificationEmptyState;
