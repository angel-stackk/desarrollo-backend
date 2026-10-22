import { Express } from 'express';
import { TaskController } from './tasks_controller';
import { authorize } from '../../utils/auth_util';

export class TaskRoutes {
  private baseEndPoint = '/api/tasks';

  constructor(app: Express) {
    const controller = new TaskController();
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAllHandler)
      .post(authorize, controller.addHandler);
    app.route(this.baseEndPoint + '/:id/status')
      .patch(authorize, controller.updateStatusHandler);
    app.route(this.baseEndPoint + '/:id')
      .get(authorize, controller.getOneHandler)
      .put(authorize, controller.updateHandler)
      .delete(authorize, controller.deleteHandler);
  }
}
