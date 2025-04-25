require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

// --- Importar ÚNICAMENTE las rutas del Sistema Escolar --- recordatorio pa no cagarla despues
const profesorRutas = require('./rutas/rutasProfesor');
const estudianteRutas = require('./rutas/rutasEstudiante');
const materiaRutas = require('./rutas/rutasMateria');

// --- Importar Controladores para rutas específicas (RECORDATORIO)
const inscripcionControlador = require('./controladores/inscripcionControlador');

// --- Middlewares ---
app.use(express.json());
app.use(cors());


// --- ÚNICAMENTE las rutas del Sistema colegio (RECORDATORIO)
app.use('/api/profesores', profesorRutas);
app.use('/api/estudiantes', estudianteRutas);
app.use('/api/materias', materiaRutas);


// POST /inscribir-estudiante
app.post('/api/inscribir-estudiante', inscripcionControlador.inscribirEstudiante);

// --- Iniciar el servidor --- (RUTA PARA POSTMAN OJO PUES)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});

// --- Manejo de errores (PA CUANDO PONGAN COSAS QUE NO VAN ACORDE DE LA VUELTA)
app.use((req, res, next) => {
    res.status(404).json({ mensaje: 'Endpoint no encontrado.' });
});

app.use((error, req, res, next) => {
    console.error("Error global:", error);
    res.status(error.status || 500).json({
        mensaje: error.message || 'Error interno del servidor.',
    });
});