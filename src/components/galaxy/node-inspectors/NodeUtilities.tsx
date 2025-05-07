
import React from "react";

export function getNodeTitle(node: any): string {
  if (!node) return 'Details';
  
  switch (node.type) {
    case 'strategy':
      return node.title || 'Strategy Details';
    case 'plugin':
      return node.name || 'Plugin Details';
    case 'agent': 
      return `Agent Version ${node.version}` || 'Agent Details';
    default:
      return 'Node Details';
  }
}

export function getNodeType(node: any): string {
  if (!node?.type) return '';
  return node.type.charAt(0).toUpperCase() + node.type.slice(1);
}
