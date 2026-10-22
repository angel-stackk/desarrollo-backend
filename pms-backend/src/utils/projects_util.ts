import { In } from 'typeorm';
import { DatabaseUtil } from './db';
import { Projects } from '../components/projects/projects_entity';
import { Users } from '../components/users/users_entity';

export class ProjectsUtil {
  public static async getProjectMemberEmails(projectId: string): Promise<string[]> {
    const dbUtil = new DatabaseUtil();
    const projectRepo = dbUtil.getRepository(Projects);
    const userRepo = dbUtil.getRepository(Users);

    const project = await projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['owner']
    });

    if (!project) return [];

    const emails = new Set<string>();
    if (project.owner) emails.add(project.owner.email);

    if (project.user_ids && project.user_ids.length > 0) {
      const members = await userRepo.find({ where: { user_id: In(project.user_ids) } });
      members.forEach((user) => emails.add(user.email));
    }

    return Array.from(emails);
  }
}
