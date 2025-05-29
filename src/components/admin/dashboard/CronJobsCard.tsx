import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CronJobsMonitoring from "../cron/CronJobsMonitoring";

export function CronJobsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cron Jobs Monitoring</CardTitle>
        <CardDescription>
          Monitor the status and history of scheduled tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CronJobsMonitoring />
      </CardContent>
    </Card>
  );
}
