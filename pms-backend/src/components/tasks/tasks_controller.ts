import { Request, Response, NextFunction } from 'express';
import { TaskService } from './tasks_service';
import { Rights } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';

export class TaskController {
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.GET_ALL)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar tareas' });
      return;
    }

    const taskService = new TaskService();
    const result = await taskService.findAll(req.query);
    res.status(result.statusCode).json(result);
  }

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.GET_DETAILS)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar la tarea' });
      return;
    }

    const taskService = new TaskService();
    const result = await taskService.findOne(req.params.id);
    res.status(result.statusCode).json(result);
  }

  public async addHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.ADD)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para crear tareas' });
      return;
    }

    try {
      const { project_id, user_id, ...taskData } = req.body;
      const taskService = new TaskService();
      const newTask = await taskService.createTask(taskData, project_id, user_id);
      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Tarea creada exitosamente',
        data: newTask
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: Ya existe una tarea registrada con ese nombre'
        });
        return;
      }
      next(error);
    }
  }

  public async updateStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.EDIT)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para actualizar tareas' });
      return;
    }

    try {
      const taskService = new TaskService();
      const task = await taskService.updateTaskStatus(req.params.id, req.body.status);

      if (!task) {
        res.status(404).json({ statusCode: 404, status: 'error', message: 'Tarea no encontrada' });
        return;
      }

      res.status(200).json({ statusCode: 200, status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.EDIT)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para actualizar tareas' });
      return;
    }

    const taskService = new TaskService();
    const result = await taskService.update(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.TASKS.DELETE)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para eliminar tareas' });
      return;
    }

    const taskService = new TaskService();
    const result = await taskService.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}
