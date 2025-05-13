
import React, { useState } from 'react';
import { Button } from './button';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonViewProps {
  data: any;
  initialExpanded?: boolean;
  maxDepth?: number;
}

export const JsonView: React.FC<JsonViewProps> = ({ 
  data, 
  initialExpanded = false, 
  maxDepth = 2 
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const isExpanded = (path: string) => {
    return expanded[path] ?? initialExpanded;
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value: any, path: string, depth: number): JSX.Element => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined) return <span className="text-gray-500">undefined</span>;
    
    if (typeof value === 'boolean') {
      return <span className="text-yellow-600">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (depth >= maxDepth) {
        return <span className="text-gray-500">[...]</span>;
      }
      
      const isNodeExpanded = isExpanded(path);
      
      return (
        <div>
          <div 
            className="inline-flex items-center cursor-pointer" 
            onClick={() => toggleExpand(path)}
          >
            {isNodeExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span>Array[{value.length}]</span>
          </div>
          
          {isNodeExpanded && (
            <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500">{index}: </span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      if (depth >= maxDepth) {
        return <span className="text-gray-500">{'{...}'}</span>;
      }
      
      const keys = Object.keys(value);
      const isNodeExpanded = isExpanded(path);
      
      return (
        <div>
          <div 
            className="inline-flex items-center cursor-pointer" 
            onClick={() => toggleExpand(path)}
          >
            {isNodeExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span>Object{'{'}keys: {keys.length}{'}'}</span>
          </div>
          
          {isNodeExpanded && (
            <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
              {keys.map(key => (
                <div key={key} className="my-1">
                  <span className="text-purple-600">{key}: </span>
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
    <div className="font-mono text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyClick}
          className="h-8 px-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        {renderValue(data, 'root', 0)}
      </div>
    </div>
  );
};

export default JsonView;
