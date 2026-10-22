import { RabbitMQConnection } from './rabbitmq_connection';

export async function startAuditConsumer(): Promise<void> {
  const rabbit = RabbitMQConnection.getInstance();
  const channel = await rabbit.connect();
  const queueName = 'audit_service_queue';

  await channel.assertQueue(queueName, { durable: true });
  // Escucha absolutamente todos los eventos del sistema (# wildcard)
  await channel.bindQueue(queueName, rabbit.EXCHANGE_NAME, '#');
  console.log(`[AuditWorker] Escuchando todos los eventos en la cola '${queueName}'...`);

  channel.consume(queueName, (msg) => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const body = msg.content.toString();
    console.log(`[AuditWorker] [LOG - ${routingKey}]: ${body}`);
    channel.ack(msg);
  }, { noAck: false });
}
