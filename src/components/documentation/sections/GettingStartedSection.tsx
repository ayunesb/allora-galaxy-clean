
import React from 'react';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Terminal } from 'lucide-react';

const GettingStartedSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="Getting Started" 
      description="Setting up your environment and first steps"
      icon={<Terminal className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-6">
        <DocumentationSection title="Installation">
          <div className="bg-muted p-4 rounded-md font-mono text-sm">
            <p># Clone the repository</p>
            <p>git clone git@github.com:yourorg/allora-galaxy.git</p>
            <p className="mt-2"># Install dependencies</p>
            <p>npm install</p>
            <p className="mt-2"># Set up environment variables</p>
            <p>cp .env.example .env.local</p>
          </div>
        </DocumentationSection>
        
        <DocumentationSection title="Environment Setup">
          <p>Required environment variables:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code>: Your Supabase project URL</li>
            <li><code>SUPABASE_SERVICE_ROLE_KEY</code>: Service role key for admin operations</li>
            <li><code>OPENAI_API_KEY</code>: API key for OpenAI integration</li>
          </ul>
          <p className="mt-2">Optional environment variables:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><code>NEXT_PUBLIC_APP_NAME</code>: Custom application name</li>
            <li><code>NEXT_PUBLIC_DEBUG_MODE</code>: Enable detailed logging (true/false)</li>
          </ul>
        </DocumentationSection>
        
        <DocumentationSection title="First Steps">
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Create an account</strong>: Navigate to the login page and sign up for a new account.
            </li>
            <li>
              <strong>Create a workspace</strong>: Set up your organization's workspace with the onboarding wizard.
            </li>
            <li>
              <strong>Explore the dashboard</strong>: Familiarize yourself with the main dashboard and navigation.
            </li>
            <li>
              <strong>Create your first strategy</strong>: Use the Strategy Builder to create your first AI strategy.
            </li>
          </ol>
        </DocumentationSection>
      </div>
    </DocumentationCard>
  );
};

export default GettingStartedSection;
