
import React from 'react';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Code } from 'lucide-react';

const PluginsSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="Plugins" 
      description="Extending functionality with plugins"
      icon={<Code className="h-5 w-5 text-primary" />}
    >
      <DocumentationSection title="Plugin System">
        <p>
          Plugins are modular components that extend the Allora OS platform
          with additional functionality. They can integrate external services,
          implement business logic, or provide specialized analytics.
        </p>
      </DocumentationSection>
      
      <DocumentationSection title="Installing Plugins">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Navigate to the Plugin Marketplace</li>
          <li>Browse available plugins</li>
          <li>Select a plugin to install</li>
          <li>Configure plugin settings</li>
          <li>Activate the plugin for your workspace</li>
        </ol>
      </DocumentationSection>
      
      <DocumentationSection title="Developing Custom Plugins">
        <p>
          Developers can create custom plugins using the Plugin SDK:
        </p>
        <div className="bg-muted p-4 rounded-md font-mono text-sm mt-2">
          <p>import {"{createPlugin}"} from '@allora/plugin-sdk';</p>
          <p className="mt-2">const myPlugin = createPlugin({"{"}</p>
          <p>  name: 'My Custom Plugin',</p>
          <p>  version: '1.0.0',</p>
          <p>  description: 'A custom plugin for Allora OS',</p>
          <p>  execute: async (context) => {"{"}</p>
          <p>    // Plugin implementation</p>
          <p>    return {"{"} success: true, data: {"{"} result: 'Hello world' {"}"} {"}"};</p>
          <p>  {"}"},</p>
          <p>{"}"})</p>
        </div>
        <p className="mt-2">
          Refer to the Plugin SDK documentation for detailed API reference.
        </p>
      </DocumentationSection>
    </DocumentationCard>
  );
};

export default PluginsSection;
