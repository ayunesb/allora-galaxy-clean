
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface StrategyCardProps {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'archived';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  createdBy?: 'ai' | 'human' | null;
  completionPercentage?: number;
  onLaunch?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const StrategyCard: React.FC<StrategyCardProps> = ({
  id,
  title,
  description,
  status,
  priority = 'medium',
  tags = [],
  dueDate,
  createdBy,
  completionPercentage = 0,
  onLaunch
}) => {
  const navigate = useNavigate();
  
  const truncateDescription = (text: string, maxLength: number = 120) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleClick = () => {
    navigate(`/strategies/${id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-2">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {createdBy === 'ai' && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-blue-700">
                AI Generated
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <p className="text-gray-600 mb-4 line-clamp-3">{truncateDescription(description)}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline">+{tags.length - 3} more</Badge>
          )}
        </div>
        
        {completionPercentage > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 flex justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          {priority && (
            <Badge variant="outline" className={`mr-2 ${getPriorityColor(priority)}`}>
              {priority}
            </Badge>
          )}
          {dueDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(new Date(dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
        
        {status === 'pending' && onLaunch && (
          <Button size="sm" onClick={() => onLaunch(id)}>
            Launch
          </Button>
        )}
        {status !== 'pending' && (
          <Button variant="outline" size="sm" onClick={handleClick}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StrategyCard;
