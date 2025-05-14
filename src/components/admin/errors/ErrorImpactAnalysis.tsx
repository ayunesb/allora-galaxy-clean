
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemLog } from '@/types/logs';
import { Loader2 } from 'lucide-react';
import ErrorState from '@/components/errors/ErrorState';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ErrorImpactAnalysisProps {
  logs: SystemLog[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ErrorImpactAnalysis: React.FC<ErrorImpactAnalysisProps> = ({ logs, isLoading }) => {
  // Analyze error impact by tenant, module, user
  const impactData = useMemo(() => {
    if (!logs || logs.length === 0) return {
      byTenant: [],
      byModule: [],
      byUserImpact: [
        { name: 'Low Impact', value: 0 },
        { name: 'Medium Impact', value: 0 },
        { name: 'High Impact', value: 0 },
      ]
    };
    
    // Count by tenant
    const tenantCounts: Record<string, number> = {};
    // Count by module
    const moduleCounts: Record<string, number> = {};
    // Analyze impact level based on context, frequency, etc.
    let lowImpact = 0, mediumImpact = 0, highImpact = 0;
    
    logs.forEach(log => {
      // Count by tenant
      const tenantId = log.tenant_id || 'unknown';
      tenantCounts[tenantId] = (tenantCounts[tenantId] || 0) + 1;
      
      // Count by module
      const module = log.module || 'unknown';
      moduleCounts[module] = (moduleCounts[module] || 0) + 1;
      
      // Analyze impact level
      const context = log.context || {};
      const isUserFacing = context.user_facing === true;
      const affectsMultipleUsers = context.affects_multiple_users === true;
      
      if (isUserFacing && affectsMultipleUsers) {
        highImpact++;
      } else if (isUserFacing) {
        mediumImpact++;
      } else {
        lowImpact++;
      }
    });
    
    // Format for charts
    const byTenant = Object.entries(tenantCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const byModule = Object.entries(moduleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const byUserImpact = [
      { name: 'Low Impact', value: lowImpact },
      { name: 'Medium Impact', value: mediumImpact },
      { name: 'High Impact', value: highImpact },
    ];
    
    return { byTenant, byModule, byUserImpact };
  }, [logs]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <ErrorState
        title="No error data"
        message="No errors have been recorded during the selected period."
        variant="default"
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Impact by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactData.byModule.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Error Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Error Impact by User Experience</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={impactData.byUserImpact}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {impactData.byUserImpact.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Error Distribution by Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactData.byTenant}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Error Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorImpactAnalysis;
