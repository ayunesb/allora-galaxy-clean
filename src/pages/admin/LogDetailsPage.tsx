
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHelmet from '@/components/PageHelmet';
import LogTransformationDialog from '@/components/evolution/LogTransformationDialog';
import { useLogDetails } from '@/hooks/admin/useLogDetails';
import { LogDetailView } from '@/components/admin/logs';
import { JsonView } from '@/components/ui/json-view';

// Loading skeleton component
const LogLoadingSkeleton = () => (
  <div className="container py-8">
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  </div>
);

// Not found component
const LogNotFoundCard = ({ onBack }: { onBack: () => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Log Not Found</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        The requested log could not be found. It may have been deleted or you may not have permission to view it.
      </p>
      <Button onClick={onBack} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
    </CardContent>
  </Card>
);

// Actions bar component
const LogActionsBar = ({ 
  onBack, 
  onRefresh,
  onTransform
}: { 
  onBack: () => void, 
  onRefresh: () => void,
  onTransform: () => void
}) => (
  <div className="mb-6 flex justify-between items-center">
    <Button variant="outline" onClick={onBack}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
    
    <div className="space-x-2">
      <Button 
        variant="outline" 
        onClick={onRefresh}
      >
        <RotateCw className="mr-2 h-4 w-4" /> Refresh
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onTransform}
      >
        Transform Log
      </Button>
    </div>
  </div>
);

// Main component
const LogDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    logData,
    logType,
    isLoading,
    error,
    refetch,
    currentView,
    toggleView,
    transformDialogOpen,
    openTransformDialog,
    closeTransformDialog
  } = useLogDetails(id);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return <LogLoadingSkeleton />;
  }
  
  if (!logData) {
    return (
      <div className="container py-8">
        <LogNotFoundCard onBack={handleBack} />
      </div>
    );
  }
  
  return (
    <>
      <PageHelmet
        title={`Log Details: ${logData.id}`}
        description="View detailed information about this log entry"
      />
      
      <div className="container py-8">
        <LogActionsBar 
          onBack={handleBack} 
          onRefresh={() => refetch()} 
          onTransform={openTransformDialog}
        />
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Log Details
              </CardTitle>
              
              <Tabs value={currentView} onValueChange={(v) => toggleView(v as 'details' | 'raw')}>
                <TabsList>
                  <TabsTrigger value="details">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {currentView === 'details' ? (
              <LogDetailView log={logData} />
            ) : (
              <div className="border rounded-md p-4 bg-muted/20">
                <JsonView data={logData} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {logData && logType && (
        <LogTransformationDialog
          open={transformDialogOpen}
          onOpenChange={closeTransformDialog}
          log={logData}
          type={logType}
        />
      )}
    </>
  );
};

export default LogDetailsPage;
