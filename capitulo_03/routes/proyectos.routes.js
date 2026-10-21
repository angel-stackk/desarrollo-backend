import { Router } from 'express';

const router = Router();

const proyectos = [
  { id: '1', nombre: 'Sistema de Gestión PMS', estado: 'Activo' },
  { id: '2', nombre: 'Migración a AWS Cloud', estado: 'Planificado' }
];

// GET /api/v1/proyectos - Obtener todos los proyectos
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    resultados: proyectos.length,
    data: proyectos
  });
});

// POST /api/v1/proyectos - Crear un nuevo proyecto
router.post('/', (req, res) => {
  const { nombre, estado } = req.body;
  if (!nombre) {
    return res.status(400).json({
      status: 'fail',
      error: 'El nombre del proyecto es obligatorio'
    });
  }

  const nuevoProyecto = {
    id: String(proyectos.length + 1),
    nombre,
    estado: estado || 'Planificado'
  };

  proyectos.push(nuevoProyecto);
  res.status(201).json({ status: 'success', data: nuevoProyecto });
});

export default router;