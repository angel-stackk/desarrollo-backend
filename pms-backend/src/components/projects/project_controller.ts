import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project_service';
import { Rights } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';

export class ProjectController {
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.GET_ALL)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar proyectos' });
      return;
    }

    const projectService = new ProjectService();
    const projects = await projectService.getAllProjectsCustom(req.query);
    res.status(200).json({ statusCode: 200, status: 'success', data: projects });
  }

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.GET_DETAILS)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para consultar el proyecto' });
      return;
    }

    const projectService = new ProjectService();
    const project = await projectService.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ statusCode: 404, status: 'error', message: 'Proyecto no encontrado' });
      return;
    }

    res.status(200).json({ statusCode: 200, status: 'success', data: project });
  }

  public async addHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.ADD)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para crear proyectos' });
      return;
    }

    try {
      const ownerId = req.user?.user_id || '';
      const projectService = new ProjectService();
      const newProject = await projectService.createProject(req.body, ownerId);
      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Proyecto creado exitosamente',
        data: newProject
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: Ya existe un proyecto registrado con ese nombre'
        });
        return;
      }
      next(error);
    }
  }

  public async addTransactionalHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.ADD)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para crear proyectos' });
      return;
    }

    try {
      const ownerId = req.user?.user_id || '';
      const projectService = new ProjectService();
      const newProject = await projectService.createProjectWithDefaultTask(req.body, ownerId);
      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Proyecto y tarea inicial creados atómicamente',
        data: newProject
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: Ya existe un proyecto registrado con ese nombre'
        });
        return;
      }
      next(error);
    }
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.EDIT)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para actualizar proyectos' });
      return;
    }

    const projectService = new ProjectService();
    const result = await projectService.update(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  }

  public async deleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!hasPermission(req.user?.rights, Rights.PROJECTS.DELETE)) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'No tiene permisos para eliminar proyectos' });
      return;
    }

    try {
      const projectService = new ProjectService();
      const deleted = await projectService.deleteProject(req.params.id);

      if (!deleted) {
        res.status(404).json({ statusCode: 404, status: 'error', message: 'Proyecto no encontrado para eliminar' });
        return;
      }

      res.status(200).json({ statusCode: 200, status: 'success', message: 'Registro eliminado exitosamente' });
    } catch (error: any) {
      if (error.code === '23503') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: El proyecto tiene tareas asociadas'
        });
        return;
      }
      next(error);
    }
  }
}
