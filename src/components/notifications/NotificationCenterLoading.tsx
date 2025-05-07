
import React from 'react';

const NotificationCenterLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
};

export default NotificationCenterLoading;
