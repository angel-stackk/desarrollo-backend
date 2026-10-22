import { RabbitMQConnection } from './rabbitmq_connection';
import { TaskCreatedEvent } from './event_publisher';

export async function startNotificationConsumer(): Promise<void> {
  const rabbit = RabbitMQConnection.getInstance();
  const channel = await rabbit.connect();
  const queueName = 'notification_service_queue';

  await channel.assertQueue(queueName, { durable: true });
  // Enlace por patrón de clave de enrutamiento (Binding)
  await channel.bindQueue(queueName, rabbit.EXCHANGE_NAME, 'task.event.*');

  // Garantizamos procesamiento uno a uno (Prefetch = 1)
  await channel.prefetch(1);
  console.log(`[NotificationWorker] Escuchando eventos en la cola '${queueName}'...`);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const event: TaskCreatedEvent = JSON.parse(msg.content.toString());
      console.log(`[NotificationWorker] Enviando correo a ${event.assignedToEmail} por tarea '${event.title}'`);

      // Simulación de envío de correo
      await new Promise(res => setTimeout(res, 500));

      // Confirmación de recepción exitosa
      channel.ack(msg);
      console.log('[OK] Mensaje procesado y confirmado con ACK por NotificationWorker.');
    } catch (err) {
      console.error('[NotificationWorker] Error al procesar mensaje:', err);
      // Rechazamos y reencolamos para reintento (nack con requeue: true)
      channel.nack(msg, false, true);
    }
  }, { noAck: false });
}
