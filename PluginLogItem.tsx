import React from 'react';
import { PluginLogItem } from './types';

interface Props {
  logItem: PluginLogItem;
}

const LogItemComponent: React.FC<Props> = ({ logItem }) => {
  switch (logItem.status) {
    case 'success':
      return <div>Success: {logItem.message}</div>;
    case 'failure':
    case 'error':
      return <div>Error: {logItem.message}</div>;
    default:
      return <div>Unknown status</div>;
  }
};

export default LogItemComponent;