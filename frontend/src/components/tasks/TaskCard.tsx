import React from 'react';
import { Calendar, User, Edit, Trash2, Clock } from 'lucide-react';
import { Task } from '@/types';
import { 
  formatDate, 
  isOverdue, 
  getPriorityColor, 
  getStatusColor, 
  getPriorityLabel, 
  getStatusLabel,
  getInitials 
} from '@/lib/utils';
import Button from '@/components/ui/Button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showActions?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const isDue = task.dueDate && isOverdue(task.dueDate);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {task.title}
          </h3>
          
          {/* Status and Priority Badges */}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 ${isDue ? 'text-red-600' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>{formatDate(task.dueDate)}</span>
              {isDue && <Clock className="h-4 w-4" />}
            </div>
          )}

          {/* Assignee */}
          {task.assignedTo && (
            <div className="flex items-center space-x-1">
              <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {getInitials(task.assignedTo.name)}
              </div>
              <span>{task.assignedTo.name}</span>
            </div>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center space-x-1">
          <User className="h-4 w-4" />
          <span>by {task.creator.name}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;