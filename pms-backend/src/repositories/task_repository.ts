export interface TaskEntity {
  task_id: string;
  name: string;
  description: string;
}

export interface ITaskRepository {
  create(task: TaskEntity): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
}
