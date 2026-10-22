import { Repository } from 'typeorm';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Task, TaskStatus } from '../../domain/entities/Task';
import { Tasks, Status } from '../../components/tasks/tasks_entity';

const STATUS_TO_ORM: Record<TaskStatus, Status> = {
  PENDING: Status.NotStarted,
  IN_PROGRESS: Status.InProgress,
  COMPLETED: Status.Completed
};

const STATUS_TO_DOMAIN: Record<Status, TaskStatus> = {
  [Status.NotStarted]: 'PENDING',
  [Status.InProgress]: 'IN_PROGRESS',
  [Status.Completed]: 'COMPLETED'
};

export class TypeORMTaskRepository implements ITaskRepository {
  constructor(private readonly typeOrmRepo: Repository<Tasks>) {}

  async save(task: Task): Promise<void> {
    const ormEntity = this.typeOrmRepo.create({
      task_id: task.id,
      name: task.title,
      status: STATUS_TO_ORM[task.status],
      created_at: task.createdAt,
      project: { project_id: task.projectId },
      assignedUser: { user_id: task.assignedUserId }
    });
    await this.typeOrmRepo.save(ormEntity);
  }

  async findById(id: string): Promise<Task | null> {
    const found = await this.typeOrmRepo.findOneBy({ task_id: id });
    if (!found) return null;
    return this.toDomain(found);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const list = await this.typeOrmRepo.find({
      where: { project: { project_id: projectId } },
      relations: ['project', 'assignedUser']
    });
    return list.map((item) => this.toDomain(item));
  }

  private toDomain(entity: Tasks): Task {
    return new Task(
      entity.task_id,
      entity.name,
      (entity.project as any)?.project_id,
      (entity.assignedUser as any)?.user_id,
      STATUS_TO_DOMAIN[entity.status],
      entity.created_at
    );
  }
}
