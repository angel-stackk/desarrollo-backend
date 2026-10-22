export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public projectId: string,
    public assignedUserId: string,
    public status: TaskStatus = 'PENDING',
    public createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error("El título de la tarea debe poseer al menos 3 caracteres.");
    }
    if (!this.projectId) {
      throw new Error("La tarea debe estar asociada a un proyecto válido.");
    }
  }

  public complete(): void {
    this.status = 'COMPLETED';
  }
}
