const express = require('express');
const materiaControlador = require('../controladores/materiaControlador');

const enrutador = express.Router();

// --- Definicion de Rutas para Materias

// POST /api/materias/crear (Cumple POST /materias del PDF)
enrutador.post('/crear', materiaControlador.crearMateria);

// GET /api/materias/listar (Ruta adicional útil)
enrutador.get('/listar', materiaControlador.listarMaterias);

// GET /api/materias/:id (Cumple GET /materias/:id del PDF)
enrutador.get('/:id', materiaControlador.obtenerDetallesMateria);

// PUT /api/materias/actualizar/:id (Ruta CRUD estándar)
enrutador.put('/actualizar/:id', materiaControlador.actualizarMateria);

// DELETE /api/materias/eliminar/:id (Ruta CRUD estándar)
enrutador.delete('/eliminar/:id', materiaControlador.eliminarMateria);

// POST /api/materias/:id/asignar-profesor
// Requiere el ID de la materia en la URL y el ID del profesor en el body "profesorId": X 
enrutador.post('/:id/asignar-profesor', materiaControlador.asignarProfesor);

// --- Rutas pendientes 
// POST /api/materias/:id/inscribir-estudiante (para POST /inscribir-estudiante)


// exportamos el enrutador
module.exports = enrutador;