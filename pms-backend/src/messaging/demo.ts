import { randomUUID } from 'crypto';
import { RabbitMQConnection } from './rabbitmq_connection';
import { startNotificationConsumer } from './notification_consumer';
import { startAuditConsumer } from './audit_consumer';
import { EventPublisher, TaskCreatedEvent } from './event_publisher';

/**
 * Simulación de la topología Pub/Sub del capítulo 16:
 * un intercambiador 'topic' y dos microservicios suscriptores independientes
 * (notificación con binding 'task.event.*' y auditoría con binding '#').
 */
async function runMessagingDemo(): Promise<void> {
  await startNotificationConsumer();
  await startAuditConsumer();

  // Breve espera para que el broker registre ambos bindings antes de publicar
  await new Promise((resolve) => setTimeout(resolve, 500));

  const event: TaskCreatedEvent = {
    eventId: randomUUID(),
    taskId: `task-uuid-${randomUUID().slice(0, 8)}`,
    title: 'Diseñar DER PostgreSQL',
    projectId: `prj-uuid-${randomUUID().slice(0, 8)}`,
    assignedToEmail: 'dev@empresa.com',
    createdAt: new Date().toISOString()
  };

  await EventPublisher.publishTaskCreated(event);

  // Espera a que ambos consumidores procesen y confirmen el mensaje (ACK)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('[Demo] Fin de la simulación de mensajería.');
  await RabbitMQConnection.getInstance().close();
  process.exit(0);
}

runMessagingDemo().catch((error) => {
  console.error('[Demo] Error durante la simulación:', error);
  process.exit(1);
});
