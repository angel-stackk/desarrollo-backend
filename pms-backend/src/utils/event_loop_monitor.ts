import { performance } from 'node:perf_hooks';

// Medición del nivel de utilización del event loop (ELU): 0 = inactivo, 1 = saturado.
// Se mide a través de un turno del event loop (setImmediate) para que el bloqueo
// síncrono quede registrado como tiempo activo (Active).
export function measureEventLoopUtilization(blockMs = 200): Promise<void> {
  const eluInicial = performance.eventLoopUtilization();

  return new Promise((resolve) => {
    setImmediate(() => {
      // Simulamos una tarea intensiva en CPU
      const inicio = Date.now();
      while (Date.now() - inicio < blockMs) {
        // Bloqueo síncrono deliberado
      }

      setImmediate(() => {
        const eluFinal = performance.eventLoopUtilization(eluInicial);
        console.log(`Utilización del Event Loop: ${(eluFinal.utilization * 100).toFixed(2)}%`);
        console.log(`Tiempo activo (Active): ${eluFinal.active.toFixed(2)} ms`);
        console.log(`Tiempo inactivo (Idle): ${eluFinal.idle.toFixed(2)} ms`);
        resolve();
      });
    });
  });
}

if (require.main === module) {
  measureEventLoopUtilization(200);
}
