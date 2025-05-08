
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KpiSection from '@/components/dashboard/KpiSection';
import { KPI } from '@/types';

const KpiDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch KPIs here
    const mockKpis = [
      {
        id: '1',
        name: 'Monthly Recurring Revenue',
        value: 12500,
        previous_value: 10000,
        unit: 'USD',
        category: 'financial',
        period: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tenant_id: 'tenant-123',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: '2',
        name: 'User Acquisition',
        value: 235,
        previous_value: 180,
        unit: 'users',
        category: 'growth',
        period: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tenant_id: 'tenant-123',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: '3',
        name: 'Conversion Rate',
        value: 3.2,
        previous_value: 2.8,
        unit: '%',
        category: 'marketing',
        period: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tenant_id: 'tenant-123',
        date: new Date().toISOString().split('T')[0]
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setKpis(mockKpis);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <KpiSection kpis={kpis} isLoading={loading} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <p className="text-muted-foreground">Charts and trends will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;
