
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  LineChart,
  BarChart3,
  RefreshCcw,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';

// Mock data for KPI charts
const revenueData = [
  { month: 'Jan', mrr: 12000, revenue: 15000 },
  { month: 'Feb', mrr: 13500, revenue: 16800 },
  { month: 'Mar', mrr: 14200, revenue: 17500 },
  { month: 'Apr', mrr: 15600, revenue: 19200 },
  { month: 'May', mrr: 17000, revenue: 21000 },
  { month: 'Jun', mrr: 19500, revenue: 24000 },
  { month: 'Jul', mrr: 21000, revenue: 26000 },
];

const trafficData = [
  { month: 'Jan', organic: 5200, referral: 2100, direct: 3200 },
  { month: 'Feb', organic: 5800, referral: 2300, direct: 3500 },
  { month: 'Mar', organic: 6500, referral: 2600, direct: 3800 },
  { month: 'Apr', organic: 7200, referral: 2900, direct: 4000 },
  { month: 'May', organic: 8000, referral: 3100, direct: 4300 },
  { month: 'Jun', organic: 8800, referral: 3400, direct: 4600 },
  { month: 'Jul', organic: 9500, referral: 3700, direct: 5000 },
];

const leadData = [
  { month: 'Jan', mql: 180, sql: 70, converted: 28 },
  { month: 'Feb', mql: 210, sql: 85, converted: 34 },
  { month: 'Mar', mql: 240, sql: 95, converted: 38 },
  { month: 'Apr', mql: 280, sql: 110, converted: 44 },
  { month: 'May', mql: 320, sql: 128, converted: 51 },
  { month: 'Jun', mql: 350, sql: 140, converted: 56 },
  { month: 'Jul', mql: 390, sql: 155, converted: 62 },
];

const channelData = [
  { name: 'Organic Search', value: 40 },
  { name: 'Social Media', value: 25 },
  { name: 'Email', value: 15 },
  { name: 'Direct', value: 12 },
  { name: 'Referral', value: 8 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#10b981'];

const KpiDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-full effect-glow bg-gradient-to-r from-galaxy-blue to-galaxy-indigo flex items-center justify-center">
          <BarChart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">KPI Dashboard</h1>
          <p className="text-muted-foreground">Track key business metrics at a glance</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh KPIs
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Recurring Revenue</p>
                <h3 className="text-2xl font-bold">$21,000</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+7.7% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Website Traffic</p>
                <h3 className="text-2xl font-bold">18,200</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <LineChart className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.0% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Marketing Qualified Leads</p>
                <h3 className="text-2xl font-bold">390</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+11.4% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <h3 className="text-2xl font-bold">3.8%</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-teal-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-red-500">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-0.3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main dashboard content */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Funnel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly recurring revenue and total revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Area type="monotone" dataKey="mrr" name="MRR" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMrr)" />
                    <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="traffic">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription>
                  Traffic by source over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                      <defs>
                        <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="organic" name="Organic Search" stroke="#10b981" fillOpacity={1} fill="url(#colorOrganic)" />
                      <Area type="monotone" dataKey="referral" name="Referral" stroke="#6366f1" fillOpacity={1} fill="url(#colorReferral)" />
                      <Area type="monotone" dataKey="direct" name="Direct" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDirect)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>
                  Distribution by channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Funnel</CardTitle>
              <CardDescription>
                MQLs, SQLs, and conversions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={leadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mql" name="MQLs" fill="#8b5cf6" />
                    <Bar dataKey="sql" name="SQLs" fill="#3b82f6" />
                    <Bar dataKey="converted" name="Conversions" fill="#10b981" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Integration status cards */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Connected Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Stripe</CardTitle>
                <CardDescription>Financial data</CardDescription>
              </div>
              <Badge className="bg-green-500">Connected</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last sync: Today at 08:15 AM
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Stripe
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Google Analytics 4</CardTitle>
                <CardDescription>Traffic metrics</CardDescription>
              </div>
              <Badge className="bg-green-500">Connected</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last sync: Today at 06:30 AM
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in GA4
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>HubSpot</CardTitle>
                <CardDescription>Marketing CRM</CardDescription>
              </div>
              <Badge className="bg-green-500">Connected</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last sync: Today at 07:45 AM
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in HubSpot
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KpiDashboard;
