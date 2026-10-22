import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Projects } from './projects_entity';
import { Tasks, Status, Priority } from '../tasks/tasks_entity';
import { Users } from '../users/users_entity';

export class ProjectService extends BaseService<Projects> {
  private projectRepo: Repository<Projects>;

  constructor() {
    const dbUtil = new DatabaseUtil();
    const repository = dbUtil.getRepository(Projects);
    super(repository, 'project_id');
    this.projectRepo = repository;
  }

  public async createProject(projectData: Partial<Projects>, ownerId: string): Promise<Projects> {
    const project = this.projectRepo.create({
      ...projectData,
      owner: { user_id: ownerId } as Users
    });
    return await this.projectRepo.save(project);
  }

  public async getProjectById(projectId: string): Promise<Projects | null> {
    return await this.projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['owner', 'tasks']
    });
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    const result = await this.projectRepo.delete(projectId);
    return (result.affected ?? 0) > 0;
  }

  public async getAllProjectsCustom(queryParams: any): Promise<Projects[]> {
    const qb = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.tasks', 'task')
      .select([
        'project.project_id',
        'project.name',
        'project.description',
        'project.created_at',
        'owner.user_id',
        'owner.username',
        'owner.email',
        'task.task_id',
        'task.name',
        'task.status'
      ]);

    if (queryParams.status) {
      qb.andWhere('project.status = :status', { status: queryParams.status });
    }
    if (queryParams.search) {
      qb.andWhere('project.name ILIKE :search', { search: `%${queryParams.search}%` });
    }

    qb.orderBy('project.created_at', 'DESC');
    return await qb.getMany();
  }

  public async createProjectWithDefaultTask(projectData: any, ownerId: string): Promise<Projects> {
    const queryRunner = this.projectRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = queryRunner.manager.create(Projects, {
        ...projectData,
        owner: { user_id: ownerId }
      });
      const savedProject = await queryRunner.manager.save(project);

      const defaultTask = queryRunner.manager.create(Tasks, {
        name: 'Planificación Inicial e Configuración',
        description: 'Tarea generada automáticamente al crear el proyecto',
        status: Status.NotStarted,
        priority: Priority.High,
        project: savedProject,
        assignedUser: { user_id: ownerId }
      });
      await queryRunner.manager.save(defaultTask);

      await queryRunner.commitTransaction();
      return savedProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
