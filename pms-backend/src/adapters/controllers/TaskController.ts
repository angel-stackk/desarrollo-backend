import { Request, Response } from 'express';
import { CreateTaskUseCase } from '../../use-cases/CreateTaskUseCase';

export class TaskController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, projectId, assignedUserId } = req.body;
      const createdTask = await this.createTaskUseCase.execute({ title, projectId, assignedUserId });
      res.status(201).json({
        success: true,
        data: createdTask
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al procesar la solicitud'
      });
    }
  }
}
