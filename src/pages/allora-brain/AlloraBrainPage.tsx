
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink, FileCode, Terminal } from 'lucide-react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import ApiKeyDisplay from './components/ApiKeyDisplay';
import BrainPlayground from './components/BrainPlayground';
import CodeExamples from './components/CodeExamples';

const AlloraBrainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Allora-as-a-Brain (AaaB)</h1>
          <p className="text-muted-foreground">
            Expose Allora agents to external teams and applications through the API
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/allora-brain/docs">
              <FileCode className="mr-2 h-4 w-4" />
              API Docs
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/api-keys">
              <Terminal className="mr-2 h-4 w-4" />
              Manage API Keys
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ApiKeyDisplay />
          
          <Card>
            <CardHeader>
              <CardTitle>What is Allora-as-a-Brain?</CardTitle>
              <CardDescription>
                Expose Allora's strategic capabilities to external applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Allora-as-a-Brain (AaaB) lets you use Allora's strategic intelligence directly from any application.
                Just send natural language queries to the API, and get actionable insights and execution results in return.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Key Features</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Natural language interface to business workflows</li>
                    <li>Integrate with existing tools like Slack, Notion, Linear</li>
                    <li>Execute strategies programmatically via API</li>
                    <li>Direct access to all your Allora plugins</li>
                    <li>Secure, tenant-scoped API keys</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Use Cases</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Add strategic intelligence to your Slack workspace</li>
                    <li>Create a Shopify app that optimizes store performance</li>
                    <li>Build a HubSpot integration for smart campaign creation</li>
                    <li>Add Allora intelligence to your internal dashboard</li>
                    <li>Automate workflows in Trello, Linear, or ClickUp</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab('playground')}>
                Try it in the playground
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simple REST API</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  A straightforward REST API that accepts natural language queries and returns structured results.
                  No complex prompt engineering required.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0" asChild>
                  <Link to="/allora-brain/docs">
                    View API documentation <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Secure API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Create and manage API keys with tenant-level isolation. Each key has an automatic expiry for security.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0" asChild>
                  <Link to="/admin/api-keys">
                    Manage your API keys <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SDK Libraries</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Coming soon: Official client libraries for JavaScript, Python, Ruby, and more for easier integration.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0" disabled>
                  Coming soon <Code className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="playground">
          <BrainPlayground />
        </TabsContent>
        
        <TabsContent value="integration">
          <CodeExamples />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(AlloraBrainPage, { roles: ['owner', 'admin'] });
