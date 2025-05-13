
import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { Button } from './button';
import { useCopy } from '@/hooks/useCopy';

interface JsonViewProps {
  data: any;
  initialExpanded?: boolean;
  maxDepth?: number;
}

export const JsonView = ({ data, initialExpanded = true, maxDepth = 2 }: JsonViewProps) => {
  const { copyToClipboard } = useCopy();
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});
  
  const isExpanded = (path: string): boolean => {
    if (expandedState[path] !== undefined) {
      return expandedState[path];
    }
    // Automatically expand the first few levels
    const depth = (path.match(/\./g) || []).length;
    return depth < maxDepth;
  };
  
  const toggleExpand = (path: string) => {
    setExpandedState(prev => ({
      ...prev,
      [path]: !isExpanded(path)
    }));
  };
  
  const handleCopy = (value: any) => {
    const stringValue = typeof value === 'object' 
      ? JSON.stringify(value, null, 2) 
      : String(value);
    copyToClipboard(stringValue);
  };
  
  const renderValue = (value: any, path: string, depth: number = 0): JSX.Element => {
    if (value === null) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (value === undefined) {
      return <span className="text-muted-foreground italic">undefined</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-blue-500">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-500">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-500">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">[]</span>;
      }
      
      const expanded = isExpanded(path);
      
      return (
        <div className="ml-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => toggleExpand(path)}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <span>Array[{value.length}]</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-2"
              onClick={() => handleCopy(value)}
            >
              <Copy size={12} />
            </Button>
          </div>
          
          {expanded && (
            <div className="ml-4 border-l-2 border-muted pl-4">
              {value.map((item, index) => (
                <div key={`${path}.${index}`} className="my-1">
                  <span className="text-muted-foreground mr-2">{index}:</span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        return <span className="text-muted-foreground">{"{}"}</span>;
      }
      
      const expanded = isExpanded(path);
      
      return (
        <div className="ml-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => toggleExpand(path)}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <span>Object</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-2"
              onClick={() => handleCopy(value)}
            >
              <Copy size={12} />
            </Button>
          </div>
          
          {expanded && (
            <div className="ml-4 border-l-2 border-muted pl-4">
              {keys.map(key => (
                <div key={`${path}.${key}`} className="my-1">
                  <span className="text-amber-500 mr-2">{key}:</span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };
  
  return (
    <div className="font-mono text-sm bg-muted/30 p-4 rounded-md overflow-x-auto">
      {renderValue(data, 'root')}
    </div>
  );
};
