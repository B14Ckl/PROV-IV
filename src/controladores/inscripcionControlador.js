const Joi = require('joi');
// aqui se importan los modelos que pide ud profe
const { Inscripcion, Estudiante, Materia } = require('../baseDatos');

// --- estructura/esquema de Validacion con Joi
const schemaInscribir = Joi.object({
    estudianteId: Joi.number().integer().positive().required().messages({
        'any.required': 'El ID del estudiante es obligatorio.',
        'number.base': 'El ID del estudiante debe ser un número.',
        'number.integer': 'El ID del estudiante debe ser un entero.',
        'number.positive': 'El ID del estudiante debe ser positivo.'
    }),
    materiaId: Joi.number().integer().positive().required().messages({
        'any.required': 'El ID de la materia es obligatorio.',
        'number.base': 'El ID de la materia debe ser un número.',
        'number.integer': 'El ID de la materia debe ser un entero.',
        'number.positive': 'El ID de la materia debe ser positivo.'
    })
});

// --- Funciones del Controlador

/**
 * @function inscribirEstudiante
 * @description Crea un registro de inscripcion para un estudiante en una materia
 * @param {Object} req - Objeto de solicitud express (OJOOO PARCERO req.body debe contener estudianteId y materiaId)
 * @param {Object} res - Objeto de respuesta express.
 */
const inscribirEstudiante = async (req, res) => {
    try {
        // 1. Validar el body de la peticion
        const { error, value } = schemaInscribir.validate(req.body, { abortEarly: false });
        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            return res.status(400).json({
                mensaje: 'Datos de entrada inválidos.',
                errores: mensajesErrores,
                resultado: null
            });
        }

        const { estudianteId, materiaId } = value;

        // 2. Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({
                mensaje: `Estudiante con ID ${estudianteId} no encontrado.`,
                resultado: null
            });
        }

        // 3. Verificar que la materia existe
        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            return res.status(404).json({
                mensaje: `Materia con ID ${materiaId} no encontrada.`,
                resultado: null
            });
        }

        // 4. Verificar si ya existe esta inscripción
        const inscripcionExistente = await Inscripcion.findOne({
            where: {
                estudianteId: estudianteId,
                materiaId: materiaId
            }
        });
        if (inscripcionExistente) {
            return res.status(409).json({
                mensaje: `El estudiante ${estudiante.nombre} ${estudiante.apellido} ya está inscrito en la materia ${materia.nombre}.`,
                resultado: inscripcionExistente 
            });
        }

        // 5. Crear la nueva inscripcion
        const nuevaInscripcion = await Inscripcion.create({
            estudianteId: estudianteId,
            materiaId: materiaId
            // fecha_inscripcion se va a establecer por defecto, ya si se pide que se la cambie, la cambio y solucionado si sae
        });

        // 6. Devolver respuesta exitosa :D
        res.status(201).json({
            mensaje: `Estudiante ${estudiante.nombre} inscrito exitosamente en ${materia.nombre}.`,
            resultado: nuevaInscripcion
        });

    } catch (error) {
        // 7. Manejar errores inesperados porque no falta que no funcione
        console.error('Error al inscribir estudiante:', error);
        // Podrian ser errores de bd si las validaciones fallan o hay problemas de conexion, cosa que es poco probable pero es mejor dejarlo indicado pa saber el error
        res.status(500).json({
            mensaje: 'Error interno al procesar la inscripción.',
            error: error.message,
            resultado: null
        });
    }
};

// --- Exportar 
module.exports = {
    inscribirEstudiante
    // mas adelante añadire dependiendo de la necesidad "cancelarInscripcion", CONSULTAR CON EL PROFE (RECORDATORIO)
};