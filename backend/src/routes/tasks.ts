import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dtos/task.dto';

const router = Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD operations
router.post('/', validate(CreateTaskDto), taskController.createTask);
router.get('/', validate(TaskQueryDto, 'query'), taskController.getTasks);
router.get('/dashboard', taskController.getDashboard);
router.get('/users', taskController.getUsers);
router.get('/:id', taskController.getTask);
router.put('/:id', validate(UpdateTaskDto), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;