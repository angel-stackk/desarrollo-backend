import { Level } from 'level';

export class ActivityLoggerService {
  private db: Level<string, string>;

  constructor(dbPath: string) {
    // LevelDB utiliza internamente un LSM-Tree (SSTables) para escrituras de alta velocidad
    this.db = new Level<string, string>(dbPath, { valueEncoding: 'utf8' });
  }

  public async logEvent(taskId: string, userId: string, action: string): Promise<void> {
    const timestamp = new Date().toISOString();
    // Clave estructurada ordenada por tiempo para consultas eficientes por rango
    const key = `event:${taskId}:${timestamp}`;
    const value = JSON.stringify({ userId, action, timestamp });
    // Escritura ultra rápida en Memtable y WAL
    await this.db.put(key, value);
  }

  public async getTaskHistory(taskId: string): Promise<Array<any>> {
    const events: Array<any> = [];
    // Las SSTables ordenadas permiten iterar secuencialmente el rango de claves
    for await (const [key, value] of this.db.iterator({
      gte: `event:${taskId}:`,
      lte: `event:${taskId}:ÿ`
    })) {
      events.push(JSON.parse(value));
    }
    return events;
  }
}
