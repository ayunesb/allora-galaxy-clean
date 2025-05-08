import React, { useState, useEffect } from 'react';
import { KpiSection } from '@/components/dashboard/KpiSection';
import StrategyCard from '@/components/strategy/StrategyCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageHelmet from '@/components/PageHelmet';
import { Strategy } from '@/types';

const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [isLoadingKPIs, setIsLoadingKPIs] = useState<boolean>(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchKPIs = async () => {
      if (!user) return;

      setIsLoadingKPIs(true);
      try {
        const { data, error } = await supabase
          .from('kpis')
          .select('*')
          .eq('tenant_id', user.id)
          .limit(3);

        if (error) {
          console.error('Error fetching KPIs:', error);
        }

        setKpiData(data || []);
      } finally {
        setIsLoadingKPIs(false);
      }
    };

    const fetchStrategies = async () => {
      if (!user) return;

      setIsLoadingStrategies(true);
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', user.id)
          .limit(3);

        if (error) {
          console.error('Error fetching strategies:', error);
        }

        setStrategies(data || []);
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    fetchKPIs();
    fetchStrategies();
  }, [user]);
  
  return (
    <>
      <PageHelmet 
        title="Dashboard"
        description="Overview of your Allora OS workspace"
      />
      
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* KPI Overview Section */}
        <div className="mt-8">
          <KpiSection 
            title="Key Performance Indicators"
            kpiData={kpiData} 
            isLoading={isLoadingKPIs} 
          />
        </div>
        
        {/* Strategy Cards Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Strategies</h2>
          {isLoadingStrategies ? (
            <p>Loading strategies...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategies.map(strategy => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p>No recent activity to display.</p>
        </div>
        
      </div>
    </>
  );
};

export default Dashboard;
