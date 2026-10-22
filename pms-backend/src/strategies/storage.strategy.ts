import fs from 'node:fs/promises';
import path from 'node:path';

export interface StorageStrategy {
  saveFile(buffer: Buffer, fileName: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
}

export class LocalStorageStrategy implements StorageStrategy {
  constructor(private uploadDir: string) {}

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    const destination = path.join(this.uploadDir, fileName);
    await fs.writeFile(destination, buffer);
    return `/uploads/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    console.log(`[LocalStorage] Eliminando recurso ${filePath}`);
  }
}

export class CloudStorageStrategy implements StorageStrategy {
  constructor(private containerName: string) {}

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    console.log(`[CloudStorage] Almacenando ${fileName} en el contenedor ${this.containerName}`);
    return `/cloud-storage/${this.containerName}/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    console.log(`[CloudStorage] Removiendo recurso ${filePath}`);
  }
}

export class AttachmentService {
  constructor(private strategy: StorageStrategy) {}

  public setStrategy(newStrategy: StorageStrategy): void {
    this.strategy = newStrategy;
  }

  public async processAttachment(buffer: Buffer, name: string): Promise<string> {
    return await this.strategy.saveFile(buffer, name);
  }
}
