import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Tasks, Status } from './tasks_entity';
import { Projects } from '../projects/projects_entity';
import { Users } from '../users/users_entity';

export class TaskService extends BaseService<Tasks> {
  private taskRepo: Repository<Tasks>;

  constructor() {
    const dbUtil = new DatabaseUtil();
    const repository = dbUtil.getRepository(Tasks);
    super(repository, 'task_id');
    this.taskRepo = repository;
  }

  public async createTask(taskData: Partial<Tasks>, projectId: string, assignedUserId: string): Promise<Tasks> {
    const task = this.taskRepo.create({
      ...taskData,
      project: { project_id: projectId } as Projects,
      assignedUser: { user_id: assignedUserId } as Users
    });
    return await this.taskRepo.save(task);
  }

  public async updateTaskStatus(taskId: string, status: string): Promise<Tasks | null> {
    const task = await this.taskRepo.findOneBy({ task_id: taskId });
    if (!task) return null;
    task.status = status as Status;
    return await this.taskRepo.save(task);
  }
}
