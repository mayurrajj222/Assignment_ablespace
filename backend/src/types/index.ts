import { User, Task, Priority, Status } from '@prisma/client';

export interface AuthenticatedUser extends Omit<User, 'password'> {}

export interface TaskWithRelations extends Task {
  creator: AuthenticatedUser;
  assignedTo: AuthenticatedUser | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export { Priority, Status };