import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority, Status } from '@/types';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate: string | Date): boolean {
  return new Date(dueDate) < new Date();
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.URGENT:
      return 'bg-red-100 text-red-800 border-red-200';
    case Priority.HIGH:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case Priority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case Priority.LOW:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get status color classes
 */
export function getStatusColor(status: Status): string {
  switch (status) {
    case Status.TODO:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case Status.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case Status.REVIEW:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case Status.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get priority display name
 */
export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.URGENT:
      return 'Urgent';
    case Priority.HIGH:
      return 'High';
    case Priority.MEDIUM:
      return 'Medium';
    case Priority.LOW:
      return 'Low';
    default:
      return 'Unknown';
  }
}

/**
 * Get status display name
 */
export function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.TODO:
      return 'To Do';
    case Status.IN_PROGRESS:
      return 'In Progress';
    case Status.REVIEW:
      return 'Review';
    case Status.COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}