
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Layers } from 'lucide-react';

const OverviewSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="What is Allora OS?" 
      description="A multi-tenant strategy-and-agent orchestration dashboard"
      icon={<Layers className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-6">
        <DocumentationSection title="Project Overview">
          <p>
            Allora OS is a comprehensive AI-native business management platform 
            built on React, Shadcn-UI, Tailwind, Supabase, and Vercel. It provides 
            tools for strategy generation, plugin management, and business intelligence 
            through an intuitive user interface.
          </p>
          <p className="mt-2">
            The platform enables organizations to build, deploy, and evolve agent-based strategies
            with end-to-end tenant isolation and robust security policies.
          </p>
        </DocumentationSection>
        
        <DocumentationSection title="Key Features">
          <ul className="list-disc pl-6 space-y-2">
            <li>Multi-tenant architecture with robust RLS policies</li>
            <li>AI-assisted strategy generation and optimization</li>
            <li>Plugin ecosystem for extending functionality</li>
            <li>Agent evolution and performance tracking</li>
            <li>Galaxy explorer for visualizing connections</li>
            <li>Unified admin console for system management</li>
            <li>Real-time KPI tracking and visualization</li>
          </ul>
        </DocumentationSection>
        
        <DocumentationSection title="Architecture">
          <div className="border rounded-md p-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Frontend</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>React + TypeScript</li>
                    <li>Tailwind CSS</li>
                    <li>Shadcn UI Component Library</li>
                    <li>React Query for data fetching</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Backend</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Supabase for auth and database</li>
                    <li>Edge Functions for serverless compute</li>
                    <li>Row-Level Security policies</li>
                    <li>Postgres database</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deployment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Vercel for hosting</li>
                    <li>CI/CD workflow integration</li>
                    <li>Environment management</li>
                    <li>Performance monitoring</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </DocumentationSection>
      </div>
    </DocumentationCard>
  );
};

export default OverviewSection;
