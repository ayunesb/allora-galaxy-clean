
import React from 'react';
import { useParams } from 'react-router-dom';

const PluginEvolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-2xl font-bold">Plugin Evolution</h1>
      <p className="text-muted-foreground">Evolution history for plugin #{id}</p>
    </div>
  );
};

export default PluginEvolutionPage;
