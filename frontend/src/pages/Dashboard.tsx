import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, User, CheckCircle } from 'lucide-react';
import { useDashboard } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import TaskCard from '@/components/tasks/TaskCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const { assignedTasks = [], createdTasks = [], overdueTasks = [] } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your tasks</p>
        </div>
        <Link to="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned to Me</p>
              <p className="text-2xl font-bold text-gray-900">{assignedTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created by Me</p>
              <p className="text-2xl font-bold text-gray-900">{createdTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-red-600 mr-2" />
              Overdue Tasks
            </h2>
            <Link to="/tasks?overdue=true">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {overdueTasks.slice(0, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                onDelete={() => {}}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Assigned Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tasks Assigned to Me
          </h2>
          <Link to="/tasks?assigned=me">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {assignedTasks.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks assigned to you yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignedTasks.slice(0, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                onDelete={() => {}}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Created Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tasks Created by Me
          </h2>
          <Link to="/tasks?created=me">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {createdTasks.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">You haven't created any tasks yet</p>
            <Link to="/tasks/new" className="mt-4 inline-block">
              <Button>Create Your First Task</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {createdTasks.slice(0, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                onDelete={() => {}}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;