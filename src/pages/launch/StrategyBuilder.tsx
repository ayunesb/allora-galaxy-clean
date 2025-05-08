
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTenantId } from '@/hooks/useTenantId';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const StrategyBuilder = () => {
  const { tenant } = useWorkspace();
  const { tenantId } = useTenantId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (!tenantId) {
      toast({
        title: 'Error',
        description: 'No active workspace found',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Here we would submit the strategy to the API
      // For now, let's just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Strategy created successfully',
      });
      
      navigate('/launch');
    } catch (error: any) {
      console.error('Error creating strategy:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create strategy',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/launch');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Strategy</h1>
          <p className="text-muted-foreground">Define a new strategy for execution</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Strategy Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide a detailed description of this strategy"
                className="mt-1 min-h-[120px]"
                required
              />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Plugins</h2>
          <p className="text-muted-foreground mb-4">
            Select plugins to include in this strategy. Plugins will be executed in the order listed.
          </p>
          
          <div className="py-4 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No plugins added yet</p>
            <Button variant="outline" className="mt-2">
              Add Plugin
            </Button>
          </div>
        </Card>
        
        <Separator />
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Strategy'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StrategyBuilder;
