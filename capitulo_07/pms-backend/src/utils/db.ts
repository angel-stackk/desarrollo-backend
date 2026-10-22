// src/utils/db.ts
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { IServerConfig } from './config';
import config from '../../server_config.json';
import { Roles } from '../components/roles/roles_entity';
import { Users } from '../components/users/users_entity';
import { Projects } from '../components/projects/projects_entity';
import { Tasks } from '../components/tasks/tasks_entity';
import { Comments } from '../components/comments/comments_entity';

export class DatabaseUtil {
  public server_config: IServerConfig = config;
  private static dataSource: DataSource;

  constructor() {
    this.connectDatabase();
  }

  private connectDatabase(): void {
    if (DatabaseUtil.dataSource && DatabaseUtil.dataSource.isInitialized) {
      return;
    }
    const db_config = this.server_config.db_config;
    DatabaseUtil.dataSource = new DataSource({
      type: 'postgres',
      host: db_config.host,
      port: db_config.port,
      username: db_config.username,
      password: db_config.password,
      database: db_config.dbname,
      entities: [Roles, Users, Projects, Tasks, Comments],
      synchronize: true,
      logging: false
    });

    DatabaseUtil.dataSource.initialize()
      .then(() => {
        console.log('Connected to the database with all entities synchronized');
      })
      .catch((error) => console.log('Error connecting to database:', error));
  }

  public getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
    return DatabaseUtil.dataSource.getRepository(entity);
  }
}