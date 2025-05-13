import React from 'react';
import { PageHeader } from '@/components/ui/page-header';

const Dashboard: React.FC = () => {
  return (
    <div className="container py-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your workspace"
      />
      
      {/* Dashboard content will be implemented in next phase */}
    </div>
  );
};

export default Dashboard;
