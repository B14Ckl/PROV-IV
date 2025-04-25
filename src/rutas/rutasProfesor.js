const express = require('express');
// Importamos las funciones del controlador de profesores
const profesorControlador = require('../controladores/profesorControlador');

// Creamos una instancia del router de express
const enrutador = express.Router();

// --- Definición de Rutas para Profesores 

// Ruta para registrar un nuevo profesor
// POST /api/profesores/registrar
enrutador.post('/registrar', profesorControlador.registrarProfesor);

// Ruta para obtener la lista de todos los profesores
// GET /api/profesores/listar
enrutador.get('/listar', profesorControlador.listarProfesores);

// Ruta para obtener un profesor especifico por su ID
// GET /api/profesores/:id  (Ej: /api/profesores/5)
enrutador.get('/:id', profesorControlador.obtenerProfesorPorId);

// Ruta para actualizar un profesor existente por su ID
// PUT /api/profesores/actualizar/:id (Ej: /api/profesores/actualizar/5)
enrutador.put('/actualizar/:id', profesorControlador.actualizarProfesor);

// Ruta para eliminar un profesor por su ID
// DELETE /api/profesores/eliminar/:id (Ej: /api/profesores/eliminar/5)
enrutador.delete('/eliminar/:id', profesorControlador.eliminarProfesor);

// --- Aquí añadiremos más rutas después ---

// Ruta para obtener las materias dictadas por un profesor especifico
// GET /api/profesores/:id/materias (Cumple con el requisito GET /profesores/:id del PDF)
enrutador.get('/:id/materias', profesorControlador.obtenerMateriasDictadas); 

// Por ejemplo, para obtener las materias que dicta un profesor:
// enrutador.get('/:id/materias', profesorControlador.obtenerMateriasDictadas);


// Exportamos el enrutador para que pueda ser usado en app.js pa que quede melo socito
module.exports = enrutador;