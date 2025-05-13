
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

const ExplorePage = () => {
  return (
    <MainLayout>
      <div className="container py-6">
        <PageHeader
          title="Explore"
          description="Discover new features and integrations"
        />
        
        <Card className="mt-6 flex justify-center items-center p-12">
          <EmptyState
            icon={<Rocket className="h-12 w-12 text-muted-foreground" />}
            title="Explore New Features"
            description="This section is under development. Check back soon for new features and integrations."
            action={
              <Button variant="default">
                Learn More
              </Button>
            }
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;
