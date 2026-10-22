// src/utils/worker_pool.ts
import { Worker } from 'node:worker_threads';
import EventEmitter from 'node:events';

interface PoolTask {
  taskData: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class WorkerPool extends EventEmitter {
  private workerFilePath: string;
  private numberOfThreads: number;
  private workers: Worker[] = [];
  private freeWorkers: Worker[] = [];
  private taskQueue: PoolTask[] = [];

  constructor(workerFilePath: string, numberOfThreads: number) {
    super();
    this.workerFilePath = workerFilePath;
    this.numberOfThreads = numberOfThreads;

    for (let i = 0; i < numberOfThreads; i++) {
      this.addWorker();
    }
  }

  private addWorker(): void {
    const worker = new Worker(this.workerFilePath);

    worker.on('message', (result) => {
      const task = (worker as any).currentTask as PoolTask;
      if (task) {
        task.resolve(result);
        (worker as any).currentTask = null;
      }
      this.freeWorkers.push(worker);
      this.processNextTask();
    });

    worker.on('error', (err) => {
      const task = (worker as any).currentTask as PoolTask;
      if (task) {
        task.reject(err);
        (worker as any).currentTask = null;
      }
      this.workers = this.workers.filter((w) => w !== worker);
      this.addWorker();
    });

    this.workers.push(worker);
    this.freeWorkers.push(worker);
  }

  public runTask(taskData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ taskData, resolve, reject });
      this.processNextTask();
    });
  }

  private processNextTask(): void {
    if (this.freeWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = this.freeWorkers.pop()!;
      const task = this.taskQueue.shift()!;
      (worker as any).currentTask = task;
      worker.postMessage(task.taskData);
    }
  }
}
