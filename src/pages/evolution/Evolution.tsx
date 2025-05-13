
import React from 'react';
import { useParams } from 'react-router-dom';
import EvolutionDashboard from '@/components/evolution/EvolutionDashboard';

const Evolution: React.FC = () => {
  // Rename type to evolutionType to avoid confusion with the typescript 'type' keyword
  const { type: _ } = useParams<{ type?: string }>();
  
  return <EvolutionDashboard />;
};

export default Evolution;
