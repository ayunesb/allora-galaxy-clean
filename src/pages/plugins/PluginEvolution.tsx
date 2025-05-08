
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PluginEvolution = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Plugin Evolution</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Evolution history for plugin {id} will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolution;
