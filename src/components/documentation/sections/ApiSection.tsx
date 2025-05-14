
import React from 'react';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Code } from 'lucide-react';

const ApiSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="API Reference" 
      description="Integrating with Allora OS via API"
      icon={<Code className="h-5 w-5 text-primary" />}
    >
      <DocumentationSection title="Authentication">
        <p>
          All API requests require authentication using an API key, which can be
          generated in the Admin panel. Include the key in the Authorization header:
        </p>
        <div className="bg-muted p-4 rounded-md font-mono text-sm mt-2">
          <p>Authorization: Bearer YOUR_API_KEY</p>
        </div>
      </DocumentationSection>
      
      <DocumentationSection title="API Endpoints">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Strategy Execution</h4>
            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
              <p>POST /api/executeStrategy</p>
              <p className="mt-1">{"{"}</p>
              <p>  "strategyId": "string",</p>
              <p>  "params": {"{"} /* Optional parameters */ {"}"}</p>
              <p>{"}"}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium">Plugin Management</h4>
            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
              <p>GET /api/plugins</p>
              <p>GET /api/plugins/:id</p>
              <p>POST /api/plugins/:id/execute</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium">KPI Data</h4>
            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
              <p>GET /api/kpis</p>
              <p>GET /api/kpis/:id/trends</p>
              <p>POST /api/kpis/:id/update</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm">
          For complete API documentation, see the API Reference Guide.
        </p>
      </DocumentationSection>
      
      <DocumentationSection title="Rate Limiting">
        <p>
          API requests are subject to rate limiting based on your plan. Rate limit
          information is returned in the following headers:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
          <li><code>X-RateLimit-Limit</code>: Maximum requests per hour</li>
          <li><code>X-RateLimit-Remaining</code>: Remaining requests in current period</li>
          <li><code>X-RateLimit-Reset</code>: Time until rate limit resets (in seconds)</li>
        </ul>
      </DocumentationSection>
    </DocumentationCard>
  );
};

export default ApiSection;
