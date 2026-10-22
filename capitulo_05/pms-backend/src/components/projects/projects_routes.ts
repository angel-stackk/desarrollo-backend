import { Express } from 'express';
import { ProjectController } from './project_controller';

export class ProjectRoutes {
  private baseEndPoint = '/api/projects';

  constructor(app: Express) {
    const controller = new ProjectController();

    app.route(this.baseEndPoint)
      .get(controller.getAllHandler)
      .post(controller.addHandler);

    app.route(`${this.baseEndPoint}/:id`)
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}

