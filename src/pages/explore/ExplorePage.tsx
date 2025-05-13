
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

const ExplorePage = () => {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Explore"
        description="Discover new strategies, plugins, and integrations"
      />
      
      <Card className="mt-8">
        <EmptyState
          icon={<Rocket className="h-12 w-12 text-muted-foreground" />}
          title="Explore New Features"
          description="This section is under development. Check back soon for new features and integrations."
          actions={
            <Button variant="default">
              Learn More
            </Button>
          }
        />
      </Card>
    </div>
  );
};

export default ExplorePage;
