const Joi = require('joi');
// importamos los modelos profesor y materia
const { Profesor, Materia } = require('../baseDatos'); 

// --- Esquema de Validacion con Joi 

// estructura/esquema para validar los datos al registrar un profesor
const schemaRegistroProfesor = Joi.object({
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
    especialidad: Joi.string().max(100).allow(null, '').messages({ 
        'string.base': 'La especialidad debe ser texto.',
        'string.max': 'La especialidad no puede tener más de {#limit} caracteres.'
    })
});

// Esquema para validar los datos al actualizar un profesor
const schemaActualizacionProfesor = schemaRegistroProfesor;

// --- Funciones del Controlador 

/**
 * @function registrarProfesor
 * @description Registra un nuevo profesor en la base de datos
 * @param {Object} req - Objeto de solicitud express
 * @param {Object} res - Objeto de respuesta express
 */
const registrarProfesor = async (req, res) => {
    try {
        const { error, value } = schemaRegistroProfesor.validate(req.body, { abortEarly: false });

        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            console.error('Error de validación:', mensajesErrores);
            return res.status(400).json({
                mensaje: 'Datos de entrada inválidos.',
                errores: mensajesErrores,
                resultado: null
            });
        }

        const { nombre, apellido, especialidad } = value;
        const nuevoProfesor = await Profesor.create({
            nombre,
            apellido,
            especialidad
        });

        res.status(201).json({
            mensaje: 'Profesor registrado exitosamente.',
            resultado: nuevoProfesor
        });

    } catch (error) {
        console.error('Error al registrar profesor:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({
                mensaje: 'Error al registrar profesor: Ya existe un recurso con esos identificadores únicos.',
                error: error.message,
                resultado: null
             });
        }
        res.status(500).json({
            mensaje: 'Ocurrió un error interno en el servidor al registrar el profesor.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function listarProfesores
 * @description Obtiene una lista de todos los profesores
 * @param {Object} req - Objeto de solicitud express
 * @param {Object} res - Objeto de respuesta express
 */
const listarProfesores = async (req, res) => {
    try {
        const profesores = await Profesor.findAll({
             order: [['apellido', 'ASC'], ['nombre', 'ASC']]
        });
        res.status(200).json({
            mensaje: 'Lista de profesores obtenida.',
            resultado: profesores
        });

    } catch (error) {
        console.error('Error al listar profesores:', error);
        res.status(500).json({
            mensaje: 'Error interno al obtener la lista de profesores.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function obtenerProfesorPorId
 * @description Obtiene un profesor especifico por su ID (OJO PAI solo datos del profesor)
 * @param {Object} req - Objeto de solicitud express (req.params.id)
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerProfesorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const profesor = await Profesor.findByPk(id);

        if (!profesor) {
            return res.status(404).json({
                mensaje: 'Profesor no encontrado.',
                resultado: null
            });
        }
        res.status(200).json({
            mensaje: 'Profesor encontrado.',
            resultado: profesor
        });

    } catch (error) {
        console.error(`Error al obtener profesor por ID ${req.params.id}:`, error);
        res.status(500).json({
            mensaje: 'Error interno al obtener el profesor.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function actualizarProfesor
 * @description Actualiza los datos de un profesor existente por su ID.
 * @param {Object} req - Objeto de solicitud express (req.params.id, req.body)
 * @param {Object} res - Objeto de respuesta express
 */
const actualizarProfesor = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = schemaActualizacionProfesor.validate(req.body, { abortEarly: false });

        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            console.error('Error de validación al actualizar:', mensajesErrores);
            return res.status(400).json({
                mensaje: 'Datos de entrada inválidos para la actualización.',
                errores: mensajesErrores,
                resultado: null
            });
        }

        const profesor = await Profesor.findByPk(id);
        if (!profesor) {
            return res.status(404).json({
                mensaje: 'Profesor no encontrado para actualizar.',
                resultado: null
            });
        }

        const [numFilasActualizadas] = await Profesor.update(value, {
            where: { id: id }
        });

        if (numFilasActualizadas > 0) {
             const profesorActualizado = await Profesor.findByPk(id);
             res.status(200).json({
                 mensaje: 'Profesor actualizado exitosamente.',
                 resultado: profesorActualizado
             });
        } else {
             res.status(200).json({
                mensaje: 'Profesor encontrado, pero no se realizaron cambios (datos iguales?).',
                resultado: profesor
            });
        }

    } catch (error) {
        console.error(`Error al actualizar profesor ID ${req.params.id}:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({
                mensaje: 'Error al actualizar: Ya existe otro recurso con esos identificadores únicos.',
                error: error.message,
                resultado: null
             });
        }
        res.status(500).json({
            mensaje: 'Error interno al actualizar el profesor.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function eliminarProfesor
 * @description Elimina un profesor por su ID
 * @param {Object} req - Objeto de solicitud Express (req.params.id)
 * @param {Object} res - Objeto de respuesta Express
 */
const eliminarProfesor = async (req, res) => {
    try {
        const { id } = req.params;
        const profesor = await Profesor.findByPk(id);
        if (!profesor) {
            return res.status(404).json({
                mensaje: 'Profesor no encontrado para eliminar.',
                resultado: null
            });
        }

        const numFilasEliminadas = await Profesor.destroy({
            where: { id: id }
        });

        if (numFilasEliminadas > 0) {
            res.status(200).json({
                mensaje: 'Profesor eliminado exitosamente.',
                resultado: { id: id }
            });
        } else {
             res.status(404).json({
                 mensaje: 'Profesor no encontrado o ya había sido eliminado.',
                 resultado: null
             });
        }

    } catch (error) {
        console.error(`Error al eliminar profesor ID ${req.params.id}:`, error);
         if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el profesor porque está asignado a una o más materias.',
                error: error.message,
                resultado: null
            });
        }
        res.status(500).json({
            mensaje: 'Error interno al eliminar el profesor.',
            error: error.message,
            resultado: null
        });
    }
};

/**
 * @function obtenerMateriasDictadas
 * @description Obtiene la lista de materias dictadas por un profesor especifico
 * @param {Object} req - Objeto de solicitud express (req.params.id)
 * @param {Object} res - Objeto de respuesta express
 */
const obtenerMateriasDictadas = async (req, res) => {
    try {
        const { id } = req.params;
        const profesorConMaterias = await Profesor.findByPk(id, {
            include: [{
                model: Materia,
                as: 'materiasDictadas', // Alias definido en baseDatos/index.js
                attributes: ['id', 'nombre', 'descripcion'] 
            }],
            
        });

        if (!profesorConMaterias) {
            return res.status(404).json({
                mensaje: 'Profesor no encontrado.',
                resultado: null
            });
        }

        res.status(200).json({
            mensaje: `Materias dictadas por el profesor ${profesorConMaterias.nombre} ${profesorConMaterias.apellido}.`,
            resultado: profesorConMaterias.materiasDictadas 
        });

    } catch (error) {
        console.error(`Error al obtener materias del profesor ID ${req.params.id}:`, error);
        res.status(500).json({
            mensaje: 'Error interno al obtener las materias del profesor.',
            error: error.message,
            resultado: null
        });
    }
};


// --- Exportar
module.exports = {
    registrarProfesor,
    listarProfesores,
    obtenerProfesorPorId, 
    actualizarProfesor,
    eliminarProfesor,
    obtenerMateriasDictadas 
};