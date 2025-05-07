import React, { useState, useEffect } from 'react';
import PageHelmet from "@/components/PageHelmet";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPICard from "@/components/KPICard";
import { KPICardSkeleton } from "@/components/skeletons/KPICardSkeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";

interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value: number | null;
  category: "financial" | "marketing" | "sales" | "product";
  source: "stripe" | "ga4" | "hubspot" | "manual";
  date: string;
}

interface KPITrendData {
  date: string;
  value: number;
}

interface KPITrend {
  name: string;
  data: KPITrendData[];
}

const KpiDashboard: React.FC = () => {
  const { t } = useTranslation();
  const tenantId = useTenantId();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [trendData, setTrendData] = useState<KPITrend | null>(null);
  const [dateRange, setDateRange] = useState<string>("30");

  // Fetch KPIs for the current tenant
  useEffect(() => {
    if (!tenantId) return;
    
    const fetchKPIs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('kpis')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('date', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const typedKpis = data.map(kpi => ({
          ...kpi,
          category: kpi.category as "financial" | "marketing" | "sales" | "product",
          source: kpi.source as "stripe" | "ga4" | "hubspot" | "manual"
        }));
        
        setKpis(typedKpis);
        
        // Set default selected metric if none selected
        if (!selectedMetric && typedKpis.length > 0) {
          setSelectedMetric(typedKpis[0].name);
          fetchTrendData(typedKpis[0].name, dateRange);
        }
      } catch (err: any) {
        console.error("Error fetching KPIs:", err);
        setError(err.message || "Failed to fetch KPI data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchKPIs();
  }, [tenantId]);

  // Fetch trend data when metric or date range changes
  const fetchTrendData = async (metricName: string, days: string) => {
    if (!tenantId || !metricName) return;
    
    setLoading(true);
    
    try {
      const daysAgo = parseInt(days);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data, error } = await supabase
        .from('kpis')
        .select('name, value, date')
        .eq('tenant_id', tenantId)
        .eq('name', metricName)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Format data for recharts
      const formattedData = {
        name: metricName,
        data: data.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          value: item.value
        }))
      };
      
      setTrendData(formattedData);
    } catch (err: any) {
      console.error("Error fetching trend data:", err);
      setError(err.message || "Failed to fetch trend data");
    } finally {
      setLoading(false);
    }
  };

  // Handle metric change
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
    fetchTrendData(value, dateRange);
  };

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (selectedMetric) {
      fetchTrendData(selectedMetric, value);
    }
  };

  // Filter KPIs by category
  const filteredKpis = kpis.filter(kpi => 
    activeTab === "all" || kpi.category === activeTab
  );
  
  // Get unique KPI names for the select dropdown
  const uniqueMetrics = Array.from(new Set(kpis.map(kpi => kpi.name)));

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHelmet 
        title={t("insights.kpis.title")} 
        description={t("insights.kpis.description")} 
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("insights.kpis.title")}</h1>
          <p className="text-muted-foreground">{t("insights.kpis.description")}</p>
        </div>
        <Button
          variant="outline"
          className="mt-2 md:mt-0"
          onClick={() => window.location.reload()}
        >
          {t("common.refresh")}
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="financial">{t("insights.categories.financial")}</TabsTrigger>
          <TabsTrigger value="marketing">{t("insights.categories.marketing")}</TabsTrigger>
          <TabsTrigger value="sales">{t("insights.categories.sales")}</TabsTrigger>
          <TabsTrigger value="product">{t("insights.categories.product")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                {t("common.tryAgain")}
              </Button>
            </div>
          ) : loading && kpis.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <KPICardSkeleton key={i} />)}
            </div>
          ) : filteredKpis.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">{t("insights.kpis.noData")}</p>
              <Button 
                variant="default" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                {t("common.refresh")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKpis.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  name={kpi.name}
                  value={kpi.value}
                  previousValue={kpi.previous_value || 0}
                  category={kpi.category}
                  source={kpi.source}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* KPI Trend Chart Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>{t("insights.kpis.trends.title")}</CardTitle>
            <CardDescription>{t("insights.kpis.trends.description")}</CardDescription>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t("insights.kpis.trends.selectMetric")} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMetrics.map(metric => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t("insights.kpis.trends.selectDateRange")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">{t("insights.kpis.trends.lastWeek")}</SelectItem>
                  <SelectItem value="30">{t("insights.kpis.trends.lastMonth")}</SelectItem>
                  <SelectItem value="90">{t("insights.kpis.trends.lastQuarter")}</SelectItem>
                  <SelectItem value="365">{t("insights.kpis.trends.lastYear")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading && !trendData ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : !trendData || trendData.data.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">{t("insights.kpis.trends.noData")}</p>
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData.data}
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
                      name={trendData.name} 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {t("insights.kpis.trends.updatedAt", { date: new Date().toLocaleDateString() })}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;
