// server.js - Servidor Express.js Básico
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear cuerpos de peticiones en formato JSON
app.use(express.json({ limit: '10mb' }));

// Ruta principal GET /
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: '¡Bienvenido a la API RESTful con Express.js!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta con parámetros de ruta (req.params)
app.get('/api/v1/usuarios/:id', (req, res) => {
  const usuarioId = req.params.id;
  res.status(200).json({
    status: 'success',
    data: {
      id: usuarioId,
      nombre: 'Usuario Ejemplo',
      rol: 'Developer'
    }
  });
});

// Iniciar la escucha del servidor HTTP
app.listen(PORT, () => {
  console.log(`[OK] Servidor Express corriendo en http://localhost:${PORT}`);
});