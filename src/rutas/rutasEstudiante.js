const express = require('express');
const estudianteControlador = require('../controladores/estudianteControlador');

const enrutador = express.Router();

// --- Definicion de Rutas para Estudiantes 

// POST /api/estudiantes/registrar
enrutador.post('/registrar', estudianteControlador.registrarEstudiante);

// GET /api/estudiantes/listar
enrutador.get('/listar', estudianteControlador.listarEstudiantes);

// GET /api/estudiantes/:id
enrutador.get('/:id', estudianteControlador.obtenerEstudiantePorId);

// PUT /api/estudiantes/actualizar/:id
enrutador.put('/actualizar/:id', estudianteControlador.actualizarEstudiante);

// DELETE /api/estudiantes/eliminar/:id
enrutador.delete('/eliminar/:id', estudianteControlador.eliminarEstudiante);

//------------------

// Ruta para obtener las materias en las que esta inscrito un estudiante especifico
// GET /api/estudiantes/:id/materias 
enrutador.get('/:id/materias', estudianteControlador.obtenerMateriasInscritas);

// GET /api/estudiantes/:id/materias

// Exportamos el enrutadorcito
module.exports = enrutador;