
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Loader2, User, Users, Clock, Building } from 'lucide-react';
import { DataStateHandler } from '@/components/ui/data-state-handler';
import type { SystemLog } from '@/types/logs';

interface ErrorImpactAnalysisProps {
  logs: SystemLog[];
  isLoading: boolean;
}

const ErrorImpactAnalysis: React.FC<ErrorImpactAnalysisProps> = ({
  logs,
  isLoading,
}) => {
  const userImpactData = React.useMemo(() => {
    const userFacingErrors = logs.filter(log => log.user_facing === true).length;
    const systemErrors = logs.length - userFacingErrors;
    
    return [
      { name: 'User Facing', value: userFacingErrors },
      { name: 'System Only', value: systemErrors },
    ];
  }, [logs]);
  
  const userScopeData = React.useMemo(() => {
    const multiUserErrors = logs.filter(log => log.affects_multiple_users === true).length;
    const singleUserErrors = logs.length - multiUserErrors;
    
    return [
      { name: 'Multiple Users', value: multiUserErrors },
      { name: 'Single User', value: singleUserErrors },
    ];
  }, [logs]);
  
  // Get top 5 affected tenants
  const tenantImpactData = React.useMemo(() => {
    const tenantCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.tenant_id) {
        tenantCounts[log.tenant_id] = (tenantCounts[log.tenant_id] || 0) + 1;
      }
    });
    
    return Object.entries(tenantCounts)
      .map(([tenant, count]) => ({ name: tenant, errors: count }))
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 5);
  }, [logs]);
  
  // Modules with most errors
  const moduleImpactData = React.useMemo(() => {
    const moduleCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.module) {
        moduleCounts[log.module] = (moduleCounts[log.module] || 0) + 1;
      }
    });
    
    return Object.entries(moduleCounts)
      .map(([module, count]) => ({ name: module, errors: count }))
      .sort((a, b) => b.errors - a.errors);
  }, [logs]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <DataStateHandler
      isLoading={isLoading}
      isError={false}
      data={logs}
      loadingComponent={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      {() => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> 
                User Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userImpactData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userImpactData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> 
                Error Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userScopeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userScopeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> 
                Top Affected Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tenantImpactData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> 
                Error Distribution by Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={moduleImpactData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DataStateHandler>
  );
};

export default ErrorImpactAnalysis;
