import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { IServerConfig } from './utils/config';
import config from '../server_config.json';
import { Routes } from './routes';
import { DatabaseUtil } from './utils/db';

export class ExpressServer {
  public static server: any = null;
  public app: Express;
  public server_config: IServerConfig = config;

  constructor() {
    const port = Number(process.env.PORT) || this.server_config.port || 3000;
    const app: Express = express();
    this.app = app;

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/ping', (req: Request, res: Response) => {
      res.send('pong');
    });

    // Conectar rutas centralizadas
    const routes = new Routes(app);
    if (routes) {
      console.log('Server Routes started for server');
    }

    // Manejo centralizado de errores
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(`[ERROR CRÍTICO] ${err.stack}`);
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        statusCode,
        status: 'error',
        message: err.message || 'Error Interno del Servidor'
      });
    });

    // Conectar base de datos
    new DatabaseUtil();

    ExpressServer.server = app.listen(port, () => {
      console.log(`Server is running on port ${port} with pid = ${process.pid}`);
    });
  }

  public closeServer(): void {
    if (ExpressServer.server) {
      ExpressServer.server.close(() => {
        console.log('Server closed gracefully');
        process.exit(0);
      });
    }
  }
}
