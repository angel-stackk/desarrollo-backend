// Ejemplo de sincronización de memoria compartida con SharedArrayBuffer y Atomics
import { Worker, isMainThread, workerData } from 'node:worker_threads';

if (isMainThread) {
  // Creamos un búfer compartido de 4 bytes (1 entero de 32 bits)
  const sharedBuffer = new SharedArrayBuffer(4);
  const typedArray = new Int32Array(sharedBuffer);
  typedArray[0] = 100; // Valor inicial

  // Bajo ts-node el propio archivo es .ts: el hilo necesita el cargador de TypeScript
  const workerOptions: any = { workerData: { buffer: sharedBuffer } };
  if (__filename.endsWith('.ts')) {
    workerOptions.execArgv = ['-r', 'ts-node/register'];
  }

  const worker = new Worker(__filename, workerOptions);
  worker.on('exit', () => {
    console.log(`Valor final en hilo principal tras Worker: ${typedArray[0]}`);
  });
} else {
  const typedArray = new Int32Array(workerData.buffer);
  // Incrementamos el valor de forma atómica e hilo-segura
  Atomics.add(typedArray, 0, 50);
  process.exit(0);
}
