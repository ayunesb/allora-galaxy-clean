
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  CalendarDays, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  GitCommitHorizontal 
} from 'lucide-react';

export const StrategyEvolutionTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Evolution Overview</CardTitle>
          <CardDescription>
            Track how strategies evolve over time based on execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Strategy Count</span>
                  <div className="text-2xl font-bold">24</div>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <GitCommitHorizontal className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    18 Active
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    4 Draft
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    2 Archived
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Evolution Rate</span>
                  <div className="text-2xl font-bold">+12.5%</div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Time to Evolution</span>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Average 14.3 days</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Success Rate</span>
                  <div className="text-2xl font-bold">86%</div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Last Update</span>
                <div className="flex items-center mt-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Today at 10:45 AM</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="evolution">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="evolution">Evolution Metrics</TabsTrigger>
          <TabsTrigger value="history">Strategy History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evolution" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolution Triggers</CardTitle>
                <CardDescription>What causes strategies to evolve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Poor Performance</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <Progress value={42} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>New Business Goals</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <Progress value={28} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Market Changes</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <Progress value={18} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Technical Improvements</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <Progress value={12} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">KPI Improvements</CardTitle>
                <CardDescription>Average improvement after strategy evolution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Acquisition</span>
                    <span className="font-medium text-green-600">+24%</span>
                  </div>
                  <Progress value={24} className="bg-muted-foreground/20" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span className="font-medium text-green-600">+18%</span>
                  </div>
                  <Progress value={18} className="bg-muted-foreground/20" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Retention</span>
                    <span className="font-medium text-green-600">+15%</span>
                  </div>
                  <Progress value={15} className="bg-muted-foreground/20" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue Growth</span>
                    <span className="font-medium text-green-600">+22%</span>
                  </div>
                  <Progress value={22} className="bg-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Strategy Evolution Timeline</CardTitle>
                  <CardDescription>How strategy performance improves over time</CardDescription>
                </div>
                <BarChart className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/40 rounded-md">
                <span className="text-muted-foreground">
                  [Strategy Performance Chart]
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Evolution History</CardTitle>
              <CardDescription>Recent strategy changes and improvements</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  {
                    id: "1",
                    name: "Q2 Marketing Campaign",
                    version: "3.0",
                    date: "2023-04-10",
                    changes: "Target audience refinement, Ad copy optimization",
                    improvement: "+18% click-through rate"
                  },
                  {
                    id: "2",
                    name: "Customer Retention Program",
                    version: "2.5",
                    date: "2023-04-05",
                    changes: "New loyalty incentives, Enhanced email sequence",
                    improvement: "+12% retention rate"
                  },
                  {
                    id: "3",
                    name: "Product Launch Strategy",
                    version: "1.2",
                    date: "2023-03-28",
                    changes: "Adjusted pricing strategy, New distribution channels",
                    improvement: "+24% pre-orders"
                  },
                  {
                    id: "4",
                    name: "Lead Generation Funnel",
                    version: "4.1",
                    date: "2023-03-15",
                    changes: "New landing page variants, Streamlined form fields",
                    improvement: "+15% conversion rate"
                  },
                  {
                    id: "5",
                    name: "Content Marketing Strategy",
                    version: "2.0",
                    date: "2023-03-10",
                    changes: "New keywords targeting, Content calendar restructuring",
                    improvement: "+30% organic traffic"
                  }
                ].map((strategy) => (
                  <div key={strategy.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Updated on {strategy.date}
                        </div>
                      </div>
                      <Badge>v{strategy.version}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="text-sm font-medium">Changes</span>
                        <p className="text-sm mt-1">{strategy.changes}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Impact</span>
                        <p className="text-sm mt-1 text-green-600">{strategy.improvement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
