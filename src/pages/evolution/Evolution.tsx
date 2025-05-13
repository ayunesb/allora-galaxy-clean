import React from 'react';
import { useParams } from 'react-router-dom';
import EvolutionDashboard from '@/components/evolution/EvolutionDashboard';

const Evolution: React.FC = () => {
  // Keep the param in case we need it in the future, but use a different name
  const { type: evolutionType } = useParams<{ type?: string }>();
  
  return <EvolutionDashboard />;
};

export default Evolution;
