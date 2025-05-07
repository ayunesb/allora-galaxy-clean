
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHelmet from '@/components/PageHelmet';

const StrategyEngine: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the StrategyBuilder page
    navigate('/launch/builder');
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="Strategy Engine"
        description="Create and manage AI-driven business strategies"
      />
      <div className="mt-8 p-12 text-center border border-dashed rounded-lg">
        <h2 className="text-xl">Redirecting to Strategy Builder...</h2>
        <p className="mt-2 text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
};

export default StrategyEngine;
