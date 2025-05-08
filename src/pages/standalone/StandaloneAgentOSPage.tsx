
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Box, Boxes, Brain, Code, Database, Download, FileJson, 
  FileText, GitPullRequest, Globe, Package, PlugZap, 
  Server, Settings, Share2
} from 'lucide-react';

const StandaloneAgentOSPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleGenerateToken = () => {
    toast({
      title: "Deployment Token Generated",
      description: "Your standalone deployment token has been generated and copied to clipboard."
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data Export Initiated",
      description: "Your data export is being prepared. You'll be notified when it's ready to download."
    });
  };
  
  const handleDeploymentStart = () => {
    toast({
      title: "Deployment Started",
      description: "Your standalone Allora instance is being prepared. This may take a few minutes."
    });
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Standalone Agent OS</h1>
        <p className="text-muted-foreground">
          Deploy Allora as a self-contained, white-labeled SaaS brain for your organization
        </p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="data">Data & Export</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allora Standalone Agent OS</CardTitle>
              <CardDescription>
                A full-stack, modular AI operating system for business execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  Deploy Allora as a self-contained, white-labeled SaaS brain. 
                  The Standalone Agent OS provides all the power of Allora in a dedicated environment 
                  that you control.
                </p>
                
                <h3 className="text-lg font-bold mt-6 mb-3">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex gap-3">
                    <Brain className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Strategy Generator</h4>
                      <p className="text-sm text-muted-foreground">AI-powered business strategy creation and optimization</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Box className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Agent Executor</h4>
                      <p className="text-sm text-muted-foreground">Run intelligent AI agents to execute your strategies</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <PlugZap className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Plugin Runner</h4>
                      <p className="text-sm text-muted-foreground">Extensible plugin architecture for custom workflows</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">KPI Tracker</h4>
                      <p className="text-sm text-muted-foreground">Monitor and optimize your business metrics</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mt-6 mb-3">No Code Required</h3>
                <p>
                  Standalone Agent OS requires no coding knowledge to deploy or operate. 
                  Simply configure your instance through our management interface and get started.
                </p>
                
                <h3 className="text-lg font-bold mt-6 mb-3">Deployment Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Private Cloud</CardTitle>
                      <CardDescription>Dedicated managed instance</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Fully managed by Allora</li>
                        <li>Dedicated instance</li>
                        <li>Custom domain</li>
                        <li>Enterprise SLA</li>
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recommended</Badge>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Self-Hosted</CardTitle>
                      <CardDescription>Your infrastructure</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Run on your own servers</li>
                        <li>Full data sovereignty</li>
                        <li>Custom integrations</li>
                        <li>Docker containers</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Embedded</CardTitle>
                      <CardDescription>SDK integration</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Add to existing apps</li>
                        <li>React component library</li>
                        <li>API-first architecture</li>
                        <li>Custom UX</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-lg font-bold mt-6 mb-3">Ideal For</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-2">
                    <h4 className="font-medium flex items-center">
                      <Boxes className="h-4 w-4 mr-2" /> Internal Growth Teams
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Empower your growth team with AI-native tools to accelerate campaigns and optimize strategies.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-2">
                    <h4 className="font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-2" /> Agencies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Provide AI-powered operations for your clients while maintaining your brand.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-2">
                    <h4 className="font-medium flex items-center">
                      <GitPullRequest className="h-4 w-4 mr-2" /> Accelerators
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Run multiple startups with consistent strategy execution and shared insights.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-2">
                    <h4 className="font-medium flex items-center">
                      <Package className="h-4 w-4 mr-2" /> SaaS Platforms
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Embed Allora as a co-pilot within your existing software platform.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.open('/standalone?tab=deployment', '_self')}>
                Get Started with Standalone
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Options</CardTitle>
              <CardDescription>
                Choose how you want to deploy your standalone Allora instance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Private Cloud</CardTitle>
                        <CardDescription>Fully managed dedicated instance</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recommended</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Dedicated hardware</li>
                      <li>Custom domain</li>
                      <li>Enterprise SLA</li>
                      <li>Managed updates</li>
                      <li>24/7 monitoring</li>
                      <li>Enterprise SSO</li>
                    </ul>
                    <Separator />
                    <div className="pt-2">
                      <p className="font-medium">Deployment Time:</p>
                      <p className="text-sm text-muted-foreground">2-3 business days</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleDeploymentStart} className="w-full">Deploy Private Cloud</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Self-Hosted</CardTitle>
                    <CardDescription>Run on your infrastructure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Docker containers</li>
                      <li>Kubernetes manifests</li>
                      <li>Full data control</li>
                      <li>On-premise capable</li>
                      <li>VPC/private network</li>
                      <li>Custom integrations</li>
                    </ul>
                    <Separator />
                    <div className="pt-2">
                      <p className="font-medium">Requirements:</p>
                      <p className="text-sm text-muted-foreground">Docker, 8GB RAM, 4 CPU cores</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => handleGenerateToken()} className="w-full">
                      <Download className="mr-2 h-4 w-4" /> Get Deployment Token
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Embedded SDK</CardTitle>
                    <CardDescription>Integrate with your app</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>React components</li>
                      <li>REST API access</li>
                      <li>Custom styling</li>
                      <li>White labeled</li>
                      <li>Seamless auth</li>
                      <li>Usage analytics</li>
                    </ul>
                    <Separator />
                    <div className="pt-2">
                      <p className="font-medium">SDK Support:</p>
                      <p className="text-sm text-muted-foreground">React, Vue, Angular, REST</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => window.open('#', '_blank')} className="w-full">
                      <Code className="mr-2 h-4 w-4" /> View SDK Documentation
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-md font-medium flex items-center mb-2">
                  <Server className="h-4 w-4 text-blue-500 mr-2" />
                  Enterprise Deployment
                </h3>
                <p className="text-sm">
                  Need custom deployment options, special compliance requirements, or enterprise-grade SLAs?
                  Our team can work with you to create a tailored deployment plan.
                </p>
                <Button variant="link" className="px-0 mt-2">
                  Contact Enterprise Sales
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Deployment Checklist</CardTitle>
              <CardDescription>
                Prepare for your standalone deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input type="checkbox" id="domain" className="rounded mr-2" />
                  <label htmlFor="domain" className="text-sm">Prepare custom domain (optional)</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="whitelist" className="rounded mr-2" checked disabled />
                  <label htmlFor="whitelist" className="text-sm">IP/domain whitelisting configured</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="branding" className="rounded mr-2" />
                  <label htmlFor="branding" className="text-sm">Upload custom branding assets</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="sso" className="rounded mr-2" />
                  <label htmlFor="sso" className="text-sm">Configure SSO (Enterprise only)</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="data" className="rounded mr-2" checked disabled />
                  <label htmlFor="data" className="text-sm">Data migration plan</label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleDeploymentStart} className="w-full">
                Begin Deployment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export & Migration</CardTitle>
              <CardDescription>
                Export your data for standalone deployment or backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2">Export Options</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="strategies" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="strategies" className="text-sm font-medium">Strategies</label>
                      <p className="text-xs text-muted-foreground">All strategy data including executions and versions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="agents" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="agents" className="text-sm font-medium">Agents</label>
                      <p className="text-xs text-muted-foreground">Agent versions, prompts, and performance data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="plugins" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="plugins" className="text-sm font-medium">Plugins</label>
                      <p className="text-xs text-muted-foreground">Plugin configurations, execution history, and XP data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="kpis" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="kpis" className="text-sm font-medium">KPIs & Metrics</label>
                      <p className="text-xs text-muted-foreground">Historical performance data and KPI tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="users" className="rounded mt-1" />
                    <div>
                      <label htmlFor="users" className="text-sm font-medium">User Accounts</label>
                      <p className="text-xs text-muted-foreground">User profiles, roles, and permissions (excludes passwords)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" id="audit" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="audit" className="text-sm font-medium">Audit Logs</label>
                      <p className="text-xs text-muted-foreground">System audit trail and operational logs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Export Format</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input type="radio" id="json" name="format" className="mr-2" checked />
                    <label htmlFor="json" className="text-sm flex items-center">
                      <FileJson className="h-4 w-4 mr-1" /> JSON
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="sql" name="format" className="mr-2" />
                    <label htmlFor="sql" className="text-sm flex items-center">
                      <Database className="h-4 w-4 mr-1" /> SQL Dump
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Schedule Regular Exports
              </Button>
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>No Vendor Lock-In</CardTitle>
              <CardDescription>
                Your data remains portable and accessible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  Allora is committed to data portability and avoiding vendor lock-in. 
                  Your data always remains yours, and we provide comprehensive export options 
                  to ensure you can migrate between deployment options or to other systems if needed.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Data Sovereignty</h3>
                <p>
                  With standalone deployment options, you maintain full control over where your data resides.
                  Self-hosted deployments give you complete data sovereignty, while our managed options 
                  provide regional deployment choices to meet compliance requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>White Labeling</CardTitle>
              <CardDescription>
                Customize the standalone deployment for your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium mb-1">Brand Name</label>
                <Input id="brandName" placeholder="Your Brand Name" />
              </div>
              
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input type="color" id="primaryColor" value="#4f46e5" className="h-9 w-9 rounded" />
                  <Input defaultValue="#4f46e5" className="flex-1" />
                </div>
              </div>
              
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input type="color" id="secondaryColor" value="#10b981" className="h-9 w-9 rounded" />
                  <Input defaultValue="#10b981" className="flex-1" />
                </div>
              </div>
              
              <div>
                <label htmlFor="logoUpload" className="block text-sm font-medium mb-1">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
              </div>
              
              <div>
                <label htmlFor="favicon" className="block text-sm font-medium mb-1">Favicon</label>
                <Button variant="outline" size="sm">Upload Favicon</Button>
              </div>
              
              <div>
                <label htmlFor="customDomain" className="block text-sm font-medium mb-1">Custom Domain</label>
                <div className="flex gap-2">
                  <Input placeholder="your-brand" />
                  <div className="flex items-center text-muted-foreground px-2">.allora-brain.com</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save White Label Settings</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Features & Modules</CardTitle>
              <CardDescription>
                Enable or disable specific features for your standalone deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="galaxy" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="galaxy" className="text-sm font-medium">Galaxy View</label>
                      <p className="text-xs text-muted-foreground">Graph visualization of strategies and plugins</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="kpiTracker" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="kpiTracker" className="text-sm font-medium">KPI Tracker</label>
                      <p className="text-xs text-muted-foreground">Metrics dashboard and performance tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="evolution" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="evolution" className="text-sm font-medium">Evolution Engine</label>
                      <p className="text-xs text-muted-foreground">AI agent and strategy evolution capabilities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="audit" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="audit" className="text-sm font-medium">Audit Layer</label>
                      <p className="text-xs text-muted-foreground">SOC2-style traceability for AI decisions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="userManager" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="userManager" className="text-sm font-medium">User Management</label>
                      <p className="text-xs text-muted-foreground">User roles, permissions, and invitations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="api" className="rounded mt-1" checked />
                    <div>
                      <label htmlFor="api" className="text-sm font-medium">API Access</label>
                      <p className="text-xs text-muted-foreground">External API access and key management</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Feature Configuration</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Options</CardTitle>
              <CardDescription>
                Configure third-party integrations for your standalone deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="slack" className="rounded mt-1" />
                    <div>
                      <label htmlFor="slack" className="text-sm font-medium">Slack</label>
                      <p className="text-xs text-muted-foreground">Connect to Slack workspace for notifications and commands</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="notion" className="rounded mt-1" />
                    <div>
                      <label htmlFor="notion" className="text-sm font-medium">Notion</label>
                      <p className="text-xs text-muted-foreground">Sync strategies and documentation with Notion</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="hubspot" className="rounded mt-1" />
                    <div>
                      <label htmlFor="hubspot" className="text-sm font-medium">HubSpot</label>
                      <p className="text-xs text-muted-foreground">Sync contacts, deals, and marketing campaigns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="stripe" className="rounded mt-1" />
                    <div>
                      <label htmlFor="stripe" className="text-sm font-medium">Stripe</label>
                      <p className="text-xs text-muted-foreground">Sync revenue metrics and subscription data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="linear" className="rounded mt-1" />
                    <div>
                      <label htmlFor="linear" className="text-sm font-medium">Linear</label>
                      <p className="text-xs text-muted-foreground">Create and track tasks from strategies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" id="ga" className="rounded mt-1" />
                    <div>
                      <label htmlFor="ga" className="text-sm font-medium">Google Analytics</label>
                      <p className="text-xs text-muted-foreground">Sync website metrics and campaign performance</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="mt-2">
                  <Settings className="h-4 w-4 mr-2" /> Configure Integrations
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
              <CardDescription>
                Save your standalone deployment configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Export your complete standalone configuration to save or share with your team.
                This file can be used to quickly deploy identical instances or backup your setup.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => toast({
                title: "Configuration Imported",
                description: "Your standalone configuration has been imported successfully."
              })}>
                <Share2 className="mr-2 h-4 w-4" /> Import Configuration
              </Button>
              <Button onClick={() => toast({
                title: "Configuration Exported",
                description: "Your standalone configuration file has been downloaded."
              })}>
                <Download className="mr-2 h-4 w-4" /> Export Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(StandaloneAgentOSPage, { roles: ['admin', 'owner'] });
