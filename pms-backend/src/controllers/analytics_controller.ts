// src/controllers/analytics_controller.ts
import { Request, Response } from 'express';
import path from 'node:path';
import { WorkerPool } from '../utils/worker_pool';

// Inicializamos un pool de 4 hilos apuntando al archivo del worker
const pool = new WorkerPool(path.join(__dirname, '../workers/analytics_worker.js'), 4);

export class AnalyticsController {
  public static async getProjectMetricsHandler(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Delegamos el cómputo intensivo al pool de Worker Threads
      const metrics = await pool.runTask({ projectId, sampleSize: 50000 });

      res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error procesando analíticas del proyecto',
        error: error.message
      });
    }
  }
}
