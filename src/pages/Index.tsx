
import React from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHelmet from '@/components/PageHelmet';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StrategyGrid from '@/components/dashboard/StrategyGrid';
import KpiSection from '@/components/dashboard/KpiSection';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <PageHelmet title="Dashboard" description="Allora OS Dashboard" />
      
      <WelcomeSection />
      
      <KpiSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StrategyGrid />
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/launch')}
              >
                Create New Strategy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/plugins')}
              >
                Manage Plugins
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/documentation')}
              >
                View Documentation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/evolution')}
              >
                Evolution Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
