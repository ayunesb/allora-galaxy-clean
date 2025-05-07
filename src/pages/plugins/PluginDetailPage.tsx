
import React from 'react';
import { useParams } from 'react-router-dom';

const PluginDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-2xl font-bold">Plugin Details</h1>
      <p className="text-muted-foreground">Details for plugin #{id}</p>
    </div>
  );
};

export default PluginDetailPage;
