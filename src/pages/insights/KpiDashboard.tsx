
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiSection } from '@/components/dashboard/KpiSection';

const KpiDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">KPI Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <KpiSection title="Revenue Metrics" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Detailed performance analysis will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiDashboard;
