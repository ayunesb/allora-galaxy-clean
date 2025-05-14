
import React from 'react';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Settings } from 'lucide-react';

const StrategiesSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="Strategies" 
      description="Creating and managing business strategies"
      icon={<Settings className="h-5 w-5 text-primary" />}
    >
      <DocumentationSection title="Strategy Overview">
        <p>
          Strategies are AI-assisted plans that incorporate business goals, target metrics, 
          and execution steps. They leverage plugins and agents to implement business logic
          and track performance over time.
        </p>
      </DocumentationSection>
      
      <DocumentationSection title="Creating a Strategy">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Navigate to the Strategy Builder</li>
          <li>Define your business objective</li>
          <li>Select relevant KPIs to track</li>
          <li>Choose plugins to integrate</li>
          <li>Configure execution parameters</li>
          <li>Review and launch your strategy</li>
        </ol>
      </DocumentationSection>
      
      <DocumentationSection title="Strategy Evolution">
        <p>
          Strategies evolve over time based on performance data and feedback.
          The Evolution Dashboard provides insights into strategy performance
          and suggests optimizations to improve results.
        </p>
        <p className="mt-2">
          Key metrics tracked include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-1">
          <li>Execution success rate</li>
          <li>Average run time</li>
          <li>Target KPI impact</li>
          <li>Resource utilization</li>
        </ul>
      </DocumentationSection>
    </DocumentationCard>
  );
};

export default StrategiesSection;
