
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Star, TrendingUp } from 'lucide-react';
import { Plugin } from '@/types/plugin';

interface PluginCardProps {
  plugin: Plugin;
}

export const PluginCard = ({ plugin }: PluginCardProps) => {
  const navigate = useNavigate();

  const handlePluginClick = () => {
    navigate(`/plugins/${plugin.id}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
      onClick={handlePluginClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plugin.name}</CardTitle>
          {plugin.status === 'active' ? (
            <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
        {plugin.category && (
          <CardDescription>
            <Badge variant="outline" className="mt-1">
              {plugin.category}
            </Badge>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {plugin.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{plugin.xp || 0} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">{plugin.roi || 0}% ROI</span>
        </div>
        <Button size="sm" variant="ghost" className="ml-auto">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
