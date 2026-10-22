import path from 'node:path';
import fs from 'node:fs';

export interface IStorageService {
  uploadFile(localPath: string, remotePath: string): Promise<string>;
}

export class DiskStorageService implements IStorageService {
  private uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir;
  }

  public async uploadFile(localPath: string, remotePath: string): Promise<string> {
    const targetPath = path.join(this.uploadDir, remotePath);
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.promises.copyFile(localPath, targetPath);
    return targetPath;
  }
}

export class S3StorageService implements IStorageService {
  private bucket: string;
  private region: string;

  constructor(bucket: string, region: string) {
    this.bucket = bucket;
    this.region = region;
  }

  public async uploadFile(localPath: string, remotePath: string): Promise<string> {
    // La subida real requiere el AWS SDK (@aws-sdk/client-s3); aquí queda como stub de laboratorio
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${remotePath}`;
  }
}
