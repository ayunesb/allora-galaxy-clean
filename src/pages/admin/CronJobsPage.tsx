
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import CronJobsMonitoring from '@/components/admin/cron/CronJobsMonitoring';
import PageHelmet from '@/components/PageHelmet';

const CronJobsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <PageHelmet 
        title="CRON Jobs Management" 
        description="Monitor and manage scheduled background tasks and automation"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CRON Jobs Management</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Monitor and manage scheduled background tasks and automation.
      </p>
      
      <CronJobsMonitoring />
    </div>
  );
};

export default withRoleCheck(CronJobsPage, { roles: ['admin', 'owner'] });
