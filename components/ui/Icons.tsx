import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Bookmark,
  Bug,
  CheckSquare,
  Zap
} from 'lucide-react';
import { Priority, IssueType, Status } from '../../types';

export const PriorityIcon: React.FC<{ priority: Priority; className?: string }> = ({ priority, className }) => {
  switch (priority) {
    case 'Highest': return <ArrowUp className={`text-red-600 ${className}`} />;
    case 'High': return <ArrowUp className={`text-red-400 ${className}`} />;
    case 'Medium': return <ArrowUp className={`text-orange-400 ${className}`} />;
    case 'Low': return <ArrowDown className={`text-green-500 ${className}`} />;
    case 'Lowest': return <ArrowDown className={`text-blue-500 ${className}`} />;
    default: return <Minus className={`text-gray-400 ${className}`} />;
  }
};

export const TypeIcon: React.FC<{ type: IssueType; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'Bug': return <Bug className={`text-red-500 ${className}`} />;
    case 'Story': return <Bookmark className={`text-green-600 ${className}`} fill="currentColor" />;
    case 'Task': return <CheckSquare className={`text-blue-500 ${className}`} />;
    case 'Epic': return <Zap className={`text-purple-500 ${className}`} fill="currentColor" />;
    default: return <Circle className={`text-gray-400 ${className}`} />;
  }
};

export const StatusIcon: React.FC<{ status: Status; className?: string }> = ({ status, className }) => {
  // Mostly used for lists, not the board columns
  switch (status) {
    case 'Done': return <CheckCircle2 className={`text-green-600 ${className}`} />;
    case 'In Progress': return <Clock className={`text-blue-600 ${className}`} />;
    case 'In Review': return <AlertCircle className={`text-purple-600 ${className}`} />;
    default: return <Circle className={`text-slate-400 ${className}`} />;
  }
};