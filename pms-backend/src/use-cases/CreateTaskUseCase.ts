import { Task, TaskStatus } from '../domain/entities/Task';
import { ITaskRepository } from '../domain/repositories/ITaskRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTaskDTO {
  title: string;
  projectId: string;
  assignedUserId: string;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDTO): Promise<Task> {
    const taskId = uuidv4();
    const task = new Task(
      taskId,
      dto.title,
      dto.projectId,
      dto.assignedUserId,
      'PENDING'
    );
    await this.taskRepository.save(task);
    return task;
  }
}
