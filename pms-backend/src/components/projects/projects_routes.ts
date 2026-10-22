import { Express } from 'express';
import { ProjectController } from './project_controller';
import { validateCreateProject } from './projects_validator';
import { authorize } from '../../utils/auth_util';

export class ProjectRoutes {
  private baseEndPoint = '/api/projects';

  constructor(app: Express) {
    const controller = new ProjectController();
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAllHandler)
      .post(authorize, validateCreateProject, controller.addHandler);
    app.route(this.baseEndPoint + '/transaccion-atomica')
      .post(authorize, validateCreateProject, controller.addTransactionalHandler);
    app.route(this.baseEndPoint + '/:id')
      .get(authorize, controller.getOneHandler)
      .put(authorize, controller.updateHandler)
      .delete(authorize, controller.deleteHandler);
  }
}
