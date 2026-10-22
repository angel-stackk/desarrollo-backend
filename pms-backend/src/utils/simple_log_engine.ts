import * as fs from 'fs';

export class SimpleLogEngine {
  private index = new Map<string, number>();
  private fileOffset = 0;
  private fd: number;

  constructor(private filepath: string) {
    this.fd = fs.openSync(filepath, 'a+');
  }

  public async set(key: string, value: string): Promise<void> {
    const entry = JSON.stringify({ key, value }) + '\n';
    const buffer = Buffer.from(entry, 'utf-8');
    // Escritura secuencial al final del archivo (append-only)
    fs.writeSync(this.fd, buffer, 0, buffer.length, this.fileOffset);
    // Actualizar índice en memoria con el offset exacto
    this.index.set(key, this.fileOffset);
    this.fileOffset += buffer.length;
  }

  public async get(key: string): Promise<string | null> {
    const offset = this.index.get(key);
    if (offset === undefined) return null;
    const buffer = Buffer.alloc(1024);
    fs.readSync(this.fd, buffer, 0, buffer.length, offset);
    const line = buffer.toString('utf-8').split('\n')[0];
    const parsed = JSON.parse(line);
    return parsed.value;
  }
}
