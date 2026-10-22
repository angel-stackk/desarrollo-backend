// Uso de child_process.fork() para cómputo en un proceso hijo
// src/services/heavy_calc_process.ts
process.on('message', (data: { numero: number }) => {
  let resultado = 0;
  for (let i = 0; i < data.numero; i++) {
    resultado += Math.sqrt(i);
  }

  // Enviamos el resultado de vuelta al proceso padre por IPC
  if (process.send) {
    process.send({ resultado });
  }
});
