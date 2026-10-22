import { Pipeline, Context } from '../core/middleware-pipeline';
import { TaskEntity } from '../domain/task-state.entity';
import { CloudStorageStrategy, AttachmentService } from '../strategies/storage.strategy';

const pipeline = new Pipeline();

pipeline.use(async (ctx: Context, next) => {
  console.log('[Session Middleware] Validando sesión de usuario...');
  ctx.user = { id: 'usr-100', role: 'Developer' };
  await next();
});

pipeline.use(async (ctx: Context, next) => {
  const start = Date.now();
  await next();
  console.log(`[Logger Middleware] Petición ${ctx.path} procesada en ${Date.now() - start}ms`);
});

pipeline.use(async (ctx: Context) => {
  console.log('[Controller] Ejecutando cambio de estado en la tarea...');
  const task = new TaskEntity(ctx.taskId);
  task.startWork();

  if (ctx.file) {
    const storage = new AttachmentService(new CloudStorageStrategy('pms-bucket'));
    const fileUrl = await storage.processAttachment(ctx.file.buffer, ctx.file.name);
    console.log(`[Controller] Archivo adjunto guardado en: ${fileUrl}`);
  }

  ctx.response = {
    statusCode: 200,
    body: { taskId: task.getTaskId(), newStatus: task.getStatus() }
  };
});

export async function runPMSDemo(): Promise<void> {
  const ctx: Context = {
    path: '/tasks/tsk-101/start',
    taskId: 'tsk-101',
    file: { buffer: Buffer.from('PDF_DATA'), name: 'doc.pdf' }
  };

  await pipeline.execute(ctx);
  console.log('[PMS Response]', ctx.response);
}
