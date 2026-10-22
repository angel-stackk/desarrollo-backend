import amqp, { ChannelModel, Channel } from 'amqplib';

export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  public readonly EXCHANGE_NAME = 'pms_events_exchange';

  private constructor() {}

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  public async connect(url: string = 'amqp://localhost:5672'): Promise<Channel> {
    if (this.channel) return this.channel;

    try {
      this.connection = await amqp.connect(url);
      const channel = await this.connection.createChannel();
      // Declaramos un intercambiador de tipo 'topic' duradero
      await channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });
      this.channel = channel;
      console.log('[RabbitMQ] Conexión establecida e intercambiador declarado.');
      return channel;
    } catch (error) {
      console.error('[RabbitMQ] Error al conectar con el broker:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
