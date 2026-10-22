import cluster from 'cluster';
import { DataSource } from 'typeorm';
import { IServerConfig } from './config';
import config from '../../server_config.json';
import { Roles } from '../components/roles/roles_entity';
import { Users } from '../components/users/users_entity';
import { Projects } from '../components/projects/projects_entity';
import { Tasks } from '../components/tasks/tasks_entity';
import { Comments } from '../components/comments/comments_entity';

export class DatabaseUtil {
  public server_config: IServerConfig = config;

  constructor() {
    this.connectDatabase();
  }

  private connectDatabase(): void {
    const db_config = this.server_config.db_config;
    const AppDataSource = new DataSource({
      type: 'postgres',
      host: db_config.host,
      port: db_config.port,
      username: db_config.username,
      password: db_config.password,
      database: db_config.dbname,
      entities: [Roles, Users, Projects, Tasks, Comments],
      // Sincroniza esquemas físicamente en PostgreSQL. Solo el worker 1 lo hace
      // para evitar condiciones de carrera entre los workers del cluster.
      synchronize: !cluster.worker || cluster.worker.id === 1,
      logging: false
    });

    AppDataSource.initialize()
      .then(() => {
        console.log('Connected to the database with all entities synchronized');
      })
      .catch((error) => console.log('Error connecting to database:', error));
  }
}

