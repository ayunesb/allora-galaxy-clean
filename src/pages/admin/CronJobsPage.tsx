import React from "react";
import PageHelmet from "@/components/PageHelmet";
import CronJobsMonitoring from "@/components/admin/cron/CronJobsMonitoring";

const CronJobsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <PageHelmet
        title="CRON Jobs"
        description="Manage and monitor scheduled CRON jobs"
      />

      <h1 className="text-2xl font-bold">CRON Jobs</h1>
      <p className="text-muted-foreground">
        Monitor and control scheduled jobs running in the system.
      </p>

      <div className="mt-6">
        <CronJobsMonitoring />
      </div>
    </div>
  );
};

export default CronJobsPage;
