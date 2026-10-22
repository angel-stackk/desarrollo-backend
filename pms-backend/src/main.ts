import 'dotenv/config';
import 'reflect-metadata';
import cluster from 'cluster';
import os from 'os';
import { ExpressServer } from './express_server';
import { DatabaseUtil } from './utils/db';
import { DDLUtil } from './utils/ddl_util';
import { CacheUtil } from './utils/cache_util';
import { NotificationUtil } from './utils/notification_util';
import { QueueWorkerWithFailures } from './workers/queue_worker';
import { UsersUtil } from './components/users/users_controller';

const initFlag = process.argv.includes('--init');

if (cluster.isPrimary) {
  if (initFlag) {
    console.log(`Proceso Maestro PID: ${process.pid}`);

    new DatabaseUtil();

    DatabaseUtil.waitForConnection().then(async (connected) => {
      if (!connected) {
        console.log('No se pudo conectar a la base de datos');
        process.exit(1);
      }

      const roleId = await DDLUtil.addDefaultRole();
      if (roleId) {
        await DDLUtil.addDefaultUser(roleId);
      }

      process.exit(0);
    });
  } else {
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running. Forking for ${numCPUs} CPUs...`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker process ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  }
} else {
  const server = new ExpressServer();

  // Inicializar el cliente de almacenamiento en caché
  new CacheUtil();

  // Inicializar el transporte de correo y el trabajador de la cola
  new NotificationUtil({
    smtp_host: process.env.MAIL_HOST,
    smtp_port: Number(process.env.MAIL_PORT) || 587,
    smtp_user: process.env.MAIL_USER,
    smtp_pass: process.env.MAIL_PASS
  });
  new QueueWorkerWithFailures().beginProcessing();

  // Ejecutar precarga de caché diferida a los 10 segundos del arranque
  setTimeout(() => {
    UsersUtil.putAllUsersInCache();
  }, 10000);

  process.on('uncaughtException', (error: Error) => {
    console.error(`Uncaught exception in worker process ${process.pid}:`, error);
    server.closeServer();
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing worker process...');
    server.closeServer();
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Closing worker process...');
    server.closeServer();
  });
}
