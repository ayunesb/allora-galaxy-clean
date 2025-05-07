
import React, { useState, useEffect } from 'react';
import { PageHelmet } from "@/components/PageHelmet";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import KPICardSkeleton from "@/components/skeletons/KPICardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number;
  date: string;
  category?: string;
  source?: string;
}

interface KPITrendData {
  date: string;
  value: number;
}

const KpiDashboard: React.FC = () => {
  const { t } = useTranslation();
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<KPITrendData[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch KPIs
  useEffect(() => {
    const fetchKPIs = async () => {
      if (!tenantId) return;

      try {
        const { data, error } = await supabase
          .from('kpis')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('date', new Date().toISOString().split('T')[0]);
          
        if (error) throw error;
        
        setKpis(data || []);
        
        // Set the first KPI as selected if available
        if (data && data.length > 0 && !selectedKpi) {
          setSelectedKpi(data[0].name);
        }
      } catch (error: any) {
        console.error('Error fetching KPIs:', error);
        toast({
          title: "Failed to load KPIs",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKPIs();
  }, [tenantId]);

  // Fetch trend data whenever selected KPI changes
  useEffect(() => {
    const fetchTrendData = async () => {
      if (!tenantId || !selectedKpi) return;
      
      try {
        setLoading(true);
        
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        if (period === '7d') {
          startDate.setDate(endDate.getDate() - 7);
        } else if (period === '30d') {
          startDate.setDate(endDate.getDate() - 30);
        } else {
          startDate.setDate(endDate.getDate() - 90);
        }
        
        const { data, error } = await supabase
          .from('kpis')
          .select('name, value, date')
          .eq('tenant_id', tenantId)
          .eq('name', selectedKpi)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        // Format data for chart
        const formattedData = (data || []).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          value: item.value
        }));
        
        setTrendData(formattedData);
      } catch (error: any) {
        console.error('Error fetching KPI trend data:', error);
        toast({
          title: "Failed to load trend data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendData();
  }, [tenantId, selectedKpi, period]);

  // Generate unique KPI names for the selector
  const kpiNames = Array.from(new Set(kpis.map(kpi => kpi.name)));

  return (
    <>
      <PageHelmet title={t('insights.kpi.title')} />
      
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{t('insights.kpi.title')}</h1>
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : kpis.length > 0 ? (
            kpis.map((kpi) => (
              <KPICard
                key={kpi.id}
                title={kpi.name}
                value={kpi.value}
                previousValue={kpi.previous_value}
                category={kpi.category}
                source={kpi.source}
              />
            ))
          ) : (
            <div className="col-span-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {t('insights.kpi.noData')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* KPI Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>KPI Trend Analysis</CardTitle>
            <CardDescription>Track your KPI performance over time</CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select 
                value={selectedKpi || ''} 
                onValueChange={(value) => setSelectedKpi(value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent>
                  {kpiNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant={period === '7d' ? 'default' : 'outline'} 
                  onClick={() => setPeriod('7d')}
                >
                  7d
                </Button>
                <Button 
                  variant={period === '30d' ? 'default' : 'outline'} 
                  onClick={() => setPeriod('30d')}
                >
                  30d
                </Button>
                <Button 
                  variant={period === '90d' ? 'default' : 'outline'} 
                  onClick={() => setPeriod('90d')}
                >
                  90d
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : trendData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={selectedKpi || 'Value'}
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mb-2" />
                <p>No trend data available for the selected KPI</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default KpiDashboard;
