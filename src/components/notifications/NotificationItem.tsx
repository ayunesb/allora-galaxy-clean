
import React from 'react';
import { format } from 'date-fns';
import { X, Check, Bell, CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types/shared';

export interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { id, title, message, type, timestamp, read, actionUrl, actionLabel } = notification;
  
  const typeStyles = {
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    success: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    system: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
  };

  const iconMap = {
    info: <InfoIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    success: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    system: <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />
  };

  const date = new Date(timestamp);
  const formattedTime = format(date, 'MMM d, h:mm a');

  return (
    <div 
      className={cn(
        'relative flex items-start p-4 mb-2 rounded-md border',
        typeStyles[type],
        read ? 'opacity-70' : ''
      )}
    >
      <div className="mr-4 mt-0.5">
        {iconMap[type]}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        
        {actionUrl && actionLabel && (
          <div className="mt-2">
            <a 
              href={actionUrl} 
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              {actionLabel}
            </a>
          </div>
        )}
      </div>
      
      <div className="flex ml-2">
        {!read && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full"
            onClick={() => onMarkAsRead(id)}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 rounded-full"
          onClick={() => onDelete(id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
