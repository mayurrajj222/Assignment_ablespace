import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, Priority, Status, CreateTaskData, UpdateTaskData } from '@/types';
import { createTaskSchema, updateTaskSchema, CreateTaskFormData, UpdateTaskFormData } from '@/lib/validations';
import { useUsers } from '@/hooks/useTasks';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, isLoading }) => {
  const { users, isLoading: usersLoading } = useUsers();
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateTaskFormData | UpdateTaskFormData>({
    resolver: zodResolver(isEditing ? updateTaskSchema : createTaskSchema),
    defaultValues: isEditing
      ? {
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
          priority: task.priority,
          status: task.status,
          assignedToId: task.assignedToId || '',
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          priority: Priority.MEDIUM,
          assignedToId: '',
        },
  });

  const priorityOptions = [
    { value: Priority.LOW, label: 'Low' },
    { value: Priority.MEDIUM, label: 'Medium' },
    { value: Priority.HIGH, label: 'High' },
    { value: Priority.URGENT, label: 'Urgent' },
  ];

  const statusOptions = [
    { value: Status.TODO, label: 'To Do' },
    { value: Status.IN_PROGRESS, label: 'In Progress' },
    { value: Status.REVIEW, label: 'Review' },
    { value: Status.COMPLETED, label: 'Completed' },
  ];

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(user => ({ value: user.id, label: user.name })),
  ];

  const onFormSubmit = async (data: CreateTaskFormData | UpdateTaskFormData) => {
    try {
      const submitData = {
        ...data,
        dueDate: data.dueDate || undefined,
        assignedToId: data.assignedToId || undefined,
      };
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Title */}
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Enter task title"
        />

        {/* Description */}
        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter task description (optional)"
          rows={4}
        />

        {/* Due Date */}
        <Input
          label="Due Date"
          type="datetime-local"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <Select
            label="Priority"
            {...register('priority')}
            error={errors.priority?.message}
            options={priorityOptions}
          />

          {/* Status (only for editing) */}
          {isEditing && (
            <Select
              label="Status"
              {...register('status')}
              error={errors.status?.message}
              options={statusOptions}
            />
          )}
        </div>

        {/* Assignee */}
        <Select
          label="Assign to"
          {...register('assignedToId')}
          error={errors.assignedToId?.message}
          options={userOptions}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;