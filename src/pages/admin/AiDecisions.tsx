import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAiDecisionsData } from '@/hooks/admin/useAiDecisions';

const AiDecisionsPage: React.FC = () => {
  const { decisions, isLoading } = useAiDecisionsData();

  return (
    <AdminLayout>
      <div className="container py-6">
        <PageHeader
          title="AI Decisions"
          description="Track and audit automated decisions made by the AI"
        />

        <Card className="mt-6">
          <CardContent className="p-6">
            {isLoading ? (
              <p>Loading AI decisions...</p>
            ) : decisions.length > 0 ? (
              <div>
                {/* AI Decisions content will be displayed here */}
                <p>Found {decisions.length} AI decisions.</p>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No AI decisions logged yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AiDecisionsPage;
