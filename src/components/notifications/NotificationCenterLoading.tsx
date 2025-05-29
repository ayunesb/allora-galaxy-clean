import React from "react";
import { Loader2 } from "lucide-react";

const NotificationCenterLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <h3 className="font-medium">Loading notifications</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Please wait while we fetch your notifications
      </p>
    </div>
  );
};

export default NotificationCenterLoading;
