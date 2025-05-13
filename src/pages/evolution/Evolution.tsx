
import React from 'react';
import { useParams } from 'react-router-dom';
import EvolutionDashboard from '@/components/evolution/EvolutionDashboard';

const Evolution: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  
  return <EvolutionDashboard />;
};

export default Evolution;
