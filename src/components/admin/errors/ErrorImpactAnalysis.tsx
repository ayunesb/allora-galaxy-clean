import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SystemEventModule } from "@/types/shared";

interface ErrorImpactAnalysisProps {
  module: SystemEventModule;
  errorCount: number;
  lastOccurred: Date | null;
  affectedTenants: number;
  renderContent: React.ReactNode;
}

const ErrorImpactAnalysis: React.FC<ErrorImpactAnalysisProps> = ({
  module,
  errorCount,
  lastOccurred,
  affectedTenants,
  renderContent
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Module</h3>
            <p className="text-muted-foreground">{module}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Error Count</h3>
            <p className="text-muted-foreground">{errorCount}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Last Occurred</h3>
            <p className="text-muted-foreground">
              {lastOccurred ? lastOccurred.toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Affected Tenants</h3>
            <p className="text-muted-foreground">{affectedTenants}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Details</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <div className="p-4">
              {renderContent}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorImpactAnalysis;
