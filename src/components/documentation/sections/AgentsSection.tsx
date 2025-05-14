
import React from 'react';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Users } from 'lucide-react';

const AgentsSection: React.FC = () => {
  return (
    <DocumentationCard 
      title="Agents" 
      description="AI agents and automation"
      icon={<Users className="h-5 w-5 text-primary" />}
    >
      <DocumentationSection title="Agent Overview">
        <p>
          Agents are autonomous AI entities that perform specific tasks within
          the Allora OS ecosystem. They can interact with plugins, execute
          strategies, and learn from performance data to improve over time.
        </p>
      </DocumentationSection>
      
      <DocumentationSection title="Agent Types">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Task Agents</strong>: Perform specific, well-defined tasks
            such as data analysis or content generation.
          </li>
          <li>
            <strong>Strategy Agents</strong>: Monitor and execute parts of a
            business strategy, making decisions based on real-time data.
          </li>
          <li>
            <strong>Assistant Agents</strong>: Provide support and insights to
            users, answering questions and guiding decision-making.
          </li>
        </ul>
      </DocumentationSection>
      
      <DocumentationSection title="Agent Evolution">
        <p>
          Agents evolve through a performance-based system:
        </p>
        <ol className="list-decimal pl-6 space-y-1 mt-2">
          <li>Performance data is collected from agent executions</li>
          <li>User feedback is incorporated through voting</li>
          <li>The system identifies improvement opportunities</li>
          <li>New agent versions are generated with optimizations</li>
          <li>A/B testing verifies performance improvements</li>
          <li>Successful evolutions become the new standard</li>
        </ol>
        <p className="mt-2">
          Agent evolution is tracked in the Agent Performance dashboard, showing
          XP gained, success rates, and version history.
        </p>
      </DocumentationSection>
    </DocumentationCard>
  );
};

export default AgentsSection;
