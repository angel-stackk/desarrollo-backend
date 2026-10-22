// src/workers/analytics_worker.js
// Worker Thread que ejecuta el cómputo intensivo de analíticas fuera del hilo principal.
const { parentPort } = require('worker_threads');

// Análisis simulado sobre una muestra de tareas del proyecto (uso intensivo de CPU)
function analizarMuestra(sampleSize) {
  let acumulado = 0;
  let cargasAltas = 0;
  for (let i = 0; i < sampleSize; i++) {
    const valor = Math.sqrt(i) * Math.sin(i);
    acumulado += valor;
    if (valor > 0.9) cargasAltas++;
  }
  return { acumulado, cargasAltas };
}

parentPort.on('message', (taskData) => {
  const inicio = Date.now();
  const { projectId, sampleSize } = taskData;

  const { acumulado, cargasAltas } = analizarMuestra(sampleSize);

  parentPort.postMessage({
    projectId,
    sampleSize,
    cargasAltasDetectadas: cargasAltas,
    indiceActividad: Number(acumulado.toFixed(4)),
    duracionMs: Date.now() - inicio
  });
});
