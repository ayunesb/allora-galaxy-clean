import { useState } from "react";
import PageHelmet from "@/components/PageHelmet";
import NotificationsContainer from "@/components/notifications/NotificationsContainer";

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet
        title="Notifications"
        description="View and manage your notifications"
      />

      <NotificationsContainer filter={filter} setFilter={handleFilterChange} />
    </div>
  );
};

export default NotificationsPage;
