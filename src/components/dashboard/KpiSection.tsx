
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface KpiSectionProps {
  title: string;
  children?: React.ReactNode;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ title, children }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children || (
          <p className="text-sm text-muted-foreground">No KPI data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiSection;
