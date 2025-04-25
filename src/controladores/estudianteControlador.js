const Joi = require('joi');

// aqui importamos estudiante, materia e inscripcion
const { Estudiante, Materia, Inscripcion } = require('../baseDatos');
const { Op } = require('sequelize'); // Para operaciones como 'no es igual'

// --- estructura/esquema de validacion con Joi (No cagarla cuando añada los campos para cada cosa)

const schemaEstudiante = Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
        'string.base': 'El nombre debe ser texto.',
        'string.empty': 'El nombre es obligatorio.',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre no puede tener más de {#limit} caracteres.',
        'any.required': 'El nombre es obligatorio.'
    }),
    apellido: Joi.string().min(2).max(50).required().messages({
        'string.base': 'El apellido debe ser texto.',
        'string.empty': 'El apellido es obligatorio.',
        'string.min': 'El apellido debe tener al menos {#limit} caracteres.',
        'string.max': 'El apellido no puede tener más de {#limit} caracteres.',
        'any.required': 'El apellido es obligatorio.'
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'El email debe ser texto.',
        'string.empty': 'El email es obligatorio.',
        'string.email': 'Debe proporcionar un email válido.',
        'any.required': 'El email es obligatorio.'
    }),
    // Dentro de schemaEstudiante:
direccion: Joi.string() 
.min(5)        
.max(255)      
.required()   //esta vuelta es pa que sea obligatorio llenar el campo
.messages({
   'string.base': 'La dirección debe ser texto.',
   'string.empty': 'La dirección es obligatoria.',
   'string.min': 'La dirección debe tener al menos {#limit} caracteres.',
   'string.max': 'La dirección no puede tener más de {#limit} caracteres.',
   'any.required': 'La dirección es obligatoria.'
})
});

// --- funciones del Controlador

/**
 * @function registrarEstudiante
 * @description Registra un nuevo estudiante.
 */
const registrarEstudiante = async (req, res) => {
    try {
        // 1. Validar entrada
        const { error, value } = schemaEstudiante.validate(req.body, { abortEarly: false });
        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            console.error('Error de validación:', mensajesErrores);
            return res.status(400).json({
                mensaje: 'Datos de entrada inválidos.',
                errores: mensajesErrores,
                resultado: null
            });
        }
        

        // 2. Verificar si el email ya existe y si si, creese uno nuevo deje la pereza pa
        const emailExistente = await Estudiante.findOne({ where: { email: value.email } });
        if (emailExistente) {
            return res.status(409).json({
                mensaje: 'El email proporcionado ya está registrado.',
                resultado: null
            });
        }

        // 3. Crear estudiante 
        const nuevoEstudiante = await Estudiante.create(value);

        // 4. Devolver respuesta
        res.status(201).json({
            mensaje: 'Estudiante registrado exitosamente.',
            resultado: nuevoEstudiante 
        });

    } catch (error) {
        // 5. Manejar errores
        console.error('Error al registrar estudiante:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({
                mensaje: 'Error al registrar: El email ya existe.',
                error: error.message,
                resultado: null
             });
        }
        res.status(500).json({
            mensaje: 'Error interno al registrar el estudiante.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function listarEstudiantes
 * @description Obtiene la lista de todos los estudiantes
 */
const listarEstudiantes = async (req, res) => {
    try {
        const estudiantes = await Estudiante.findAll({
             order: [['apellido', 'ASC'], ['nombre', 'ASC']]
            
        });
        res.status(200).json({
            mensaje: 'Lista de estudiantes obtenida.',
            resultado: estudiantes
        });
    } catch (error) {
        console.error('Error al listar estudiantes:', error);
        res.status(500).json({
            mensaje: 'Error interno al obtener la lista de estudiantes.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function obtenerEstudiantePorId
 * @description Obtiene un estudiante por su ID (solo datos del estudiante)
 */
const obtenerEstudiantePorId = async (req, res) => {
    try {
        const { id } = req.params;
       
        const estudiante = await Estudiante.findByPk(id);

        if (!estudiante) {
            return res.status(404).json({
                mensaje: 'Estudiante no encontrado.',
                resultado: null
            });
        }

        res.status(200).json({
            mensaje: 'Estudiante encontrado.',
            resultado: estudiante
        });
    } catch (error) {
        console.error(`Error al obtener estudiante por ID ${req.params.id}:`, error);
        res.status(500).json({
            mensaje: 'Error interno al obtener el estudiante.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function actualizarEstudiante
 * @description Actualiza un estudiante por su ID
 */
const actualizarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Validar entrada 
        const { error, value } = schemaEstudiante.validate(req.body, { abortEarly: false });
        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            console.error('Error de validación al actualizar:', mensajesErrores);
            return res.status(400).json({
                mensaje: 'Datos de entrada inválidos para la actualización.',
                errores: mensajesErrores,
                resultado: null
            });
        }
        

        // 2. Buscar estudiante actual
        const estudiante = await Estudiante.findByPk(id);
        if (!estudiante) {
            return res.status(404).json({
                mensaje: 'Estudiante no encontrado para actualizar.',
                resultado: null
            });
        }

        // 3. Verificar si el nuevo email ya está en uso por OTRO estudiante
        if (value.email && value.email !== estudiante.email) {
            const emailExistente = await Estudiante.findOne({ where: { email: value.email, id: { [Op.ne]: id } } });
            if (emailExistente) {
                return res.status(409).json({
                    mensaje: 'El nuevo email proporcionado ya está registrado por otro estudiante.',
                    resultado: null
                });
            }
        }

        // 4. Actualizar estudiante 
        const [numFilasActualizadas] = await Estudiante.update(value, {
            where: { id: id }
        });

        // 5. Devolver respuesta
        if (numFilasActualizadas > 0) {
            const estudianteActualizado = await Estudiante.findByPk(id); 
            res.status(200).json({
                mensaje: 'Estudiante actualizado exitosamente.',
                resultado: estudianteActualizado 
            });
        } else {
             res.status(200).json({
                mensaje: 'No se realizaron cambios (datos iguales?).',
                resultado: estudiante
            });
        }

    } catch (error) {
        // 6. Manejar errores
        console.error(`Error al actualizar estudiante ID ${req.params.id}:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({
                mensaje: 'Error al actualizar: El email ya existe.',
                error: error.message,
                resultado: null
             });
        }
        res.status(500).json({
            mensaje: 'Error interno al actualizar el estudiante.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function eliminarEstudiante
 * @description Elimina un estudiante por su ID.
 */
const eliminarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiante.findByPk(id);
        if (!estudiante) {
            return res.status(404).json({
                mensaje: 'Estudiante no encontrado para eliminar.',
                resultado: null
            });
        }

       
        const numFilasEliminadas = await Estudiante.destroy({
            where: { id: id }
        });

        if (numFilasEliminadas > 0) {
            res.status(200).json({
                mensaje: 'Estudiante eliminado exitosamente.',
                resultado: { id: id }
            });
        } else {
             res.status(404).json({
                 mensaje: 'Estudiante no encontrado o ya había sido eliminado.',
                 resultado: null
             });
        }

    } catch (error) {
        console.error(`Error al eliminar estudiante ID ${req.params.id}:`, error);
         if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el estudiante porque tiene registros asociados (inscripciones).',
                error: error.message,
                resultado: null
            });
        }
        res.status(500).json({
            mensaje: 'Error interno al eliminar el estudiante.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function obtenerMateriasInscritas
 * @description Obtiene la lista de materias en las que está inscrito X estudiante
 */
const obtenerMateriasInscritas = async (req, res) => {
    try {
        const { id } = req.params;
        const estudianteConMaterias = await Estudiante.findByPk(id, {
            include: [{
                model: Materia,
                as: 'materiasInscritas',
                attributes: ['id', 'nombre', 'descripcion'],
                through: {
                    attributes: []
                }
            }],
            
        });

        if (!estudianteConMaterias) {
            return res.status(404).json({
                mensaje: 'Estudiante no encontrado.',
                resultado: null
            });
        }

        res.status(200).json({
            mensaje: `Materias inscritas por el estudiante ${estudianteConMaterias.nombre} ${estudianteConMaterias.apellido}.`,
            resultado: estudianteConMaterias.materiasInscritas
        });

    } catch (error) {
        console.error(`Error al obtener materias del estudiante ID ${req.params.id}:`, error);
        res.status(500).json({
            mensaje: 'Error interno al obtener las materias del estudiante.',
            error: error.message,
            resultado: null
        });
    }
};


// --- exportar las funciones del controlador 
module.exports = {
    registrarEstudiante,
    listarEstudiantes,
    obtenerEstudiantePorId,
    actualizarEstudiante,
    eliminarEstudiante,
    obtenerMateriasInscritas
};