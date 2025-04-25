const Joi = require('joi');
// Importamos los modelos necesarios desde baseDatos/index.js
const { Materia, Profesor, Estudiante, Inscripcion } = require('../baseDatos');
const { Op } = require('sequelize'); 

// --- estruttura/esquema de validacion con Joi 

const schemaMateriaBase = {
    nombre: Joi.string().min(3).max(100).required().messages({
        'string.base': 'El nombre debe ser texto.',
        'string.empty': 'El nombre es obligatorio.',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre no puede tener más de {#limit} caracteres.',
        'any.required': 'El nombre es obligatorio.'
    }),
    descripcion: Joi.string().max(500).allow(null, '').messages({
        'string.base': 'La descripción debe ser texto.',
        'string.max': 'La descripción no puede tener más de {#limit} caracteres.'
    }),
    
    profesorId: Joi.number().integer().positive().allow(null).messages({
        'number.base': 'El ID del profesor debe ser un número.',
        'number.integer': 'El ID del profesor debe ser un número entero.',
        'number.positive': 'El ID del profesor debe ser un número positivo.'
    })
};

const schemaCrearMateria = Joi.object(schemaMateriaBase);

// Para actualizar, hacemos todos los campos opcionales y tin para que tan
const schemaActualizarMateria = Joi.object({
    nombre: schemaMateriaBase.nombre.optional(),
    descripcion: schemaMateriaBase.descripcion.optional(),
    profesorId: schemaMateriaBase.profesorId.optional()
});

// esquema especifico para asignar profesor
const schemaAsignarProfesor = Joi.object({
    profesorId: Joi.number().integer().positive().required().messages({ 
        'any.required': 'El ID del profesor es obligatorio para la asignación.',
        'number.base': 'El ID del profesor debe ser un número.',
        'number.integer': 'El ID del profesor debe ser un número entero.',
        'number.positive': 'El ID del profesor debe ser un número positivo.'
    })
});


// --- Funciones del Controlador 

/**
 * @function crearMateria
 * @description Crea una nueva materia
 */
const crearMateria = async (req, res) => {
    try {
        // 1. Validar entrada
        const { error, value } = schemaCrearMateria.validate(req.body, { abortEarly: false });
        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            return res.status(400).json({ mensaje: 'Datos de entrada inválidos.', errores: mensajesErrores, resultado: null });
        }

        // 2. Verificar unicidad del nombre
        const nombreExistente = await Materia.findOne({ where: { nombre: value.nombre } });
        if (nombreExistente) {
            return res.status(409).json({ mensaje: 'Ya existe una materia con ese nombre.', resultado: null });
        }

        // 3. Verificar si el profesorId proporcionado existe, pa tenerlo presente
        if (value.profesorId) {
            const profesorExiste = await Profesor.findByPk(value.profesorId);
            if (!profesorExiste) {
                return res.status(404).json({ mensaje: `El profesor con ID ${value.profesorId} no existe. No se puede asignar.`, resultado: null });
            }
        }

        // 4. Crear materia
        const nuevaMateria = await Materia.create(value); 

        // 5. Devolver respuesta
        res.status(201).json({ mensaje: 'Materia creada exitosamente.', resultado: nuevaMateria });

    } catch (error) {
        console.error('Error al crear materia:', error);
        // Manejar otros errores (bd, etc.)
        if (error.name === 'SequelizeUniqueConstraintError') { // Por si acaso
             return res.status(409).json({ mensaje: 'Error al crear: El nombre de la materia ya existe.', error: error.message, resultado: null });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') { // Si el profesorId es invalido y no se valido antes
             return res.status(400).json({ mensaje: 'Error de clave foránea: El profesor especificado no existe.', error: error.message, resultado: null });
         }
        res.status(500).json({ mensaje: 'Error interno al crear la materia.', error: error.message, resultado: null });
    }
};

/**
 * @function listarMaterias
 * @description Obtiene la lista de todas las materias, incluyendo el profesor asignado
 */
const listarMaterias = async (req, res) => {
    try {
        const materias = await Materia.findAll({
            include: [{ // informacion del profesor asociado
                model: Profesor,
                as: 'profesorAsignado', // Usar el alias 
                attributes: ['id', 'nombre', 'apellido', 'especialidad'] // Seleccionar que campos del profesor se quieren traer
            }],
            order: [['nombre', 'ASC']]
        });
        res.status(200).json({ mensaje: 'Lista de materias obtenida.', resultado: materias });
    } catch (error) {
        console.error('Error al listar materias:', error);
        res.status(500).json({ mensaje: 'Error interno al obtener la lista de materias.', error: error.message, resultado: null });
    }
};

/**
 * @function obtenerDetallesMateria // renombrado para cumplir requisito del PDF (GET /materias/:id)
 * @description Obtiene detalles de una materia por ID, incluyendo profesor y estudiantes inscritos
 */
const obtenerDetallesMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const materia = await Materia.findByPk(id, {
            include: [
                { // Incluir profesor
                    model: Profesor,
                    as: 'profesorAsignado',
                    attributes: ['id', 'nombre', 'apellido', 'especialidad']
                },
                { // Incluir estudiantes inscritos
                    model: Estudiante,
                    as: 'estudiantesInscritos', // Alias de la relación N:M
                    attributes: ['id', 'nombre', 'apellido', 'email'], // Campos del estudiante a mostrar
                    through: { // para no traer info de la tabla intermedia (Inscripcion)
                        attributes: [] // no traer ninguna columna de la tabla Inscripcion
                    }
                }
            ]
        });

        if (!materia) {
            return res.status(404).json({ mensaje: 'Materia no encontrada.', resultado: null });
        }

        res.status(200).json({ mensaje: 'Detalles de la materia obtenidos.', resultado: materia });
    } catch (error) {
        console.error(`Error al obtener detalles de materia ID ${req.params.id}:`, error);
        res.status(500).json({ mensaje: 'Error interno al obtener los detalles de la materia.', error: error.message, resultado: null });
    }
};


/**
 * @function actualizarMateria
 * @description Actualiza una materia por su ID. Puede incluir la actualizacion del profesor
 */
const actualizarMateria = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validar entrada (permite actualizar nombre, descripcion, profesorId)
        const { error, value } = schemaActualizarMateria.validate(req.body, { abortEarly: false });
        if (error) {
            const mensajesErrores = error.details.map(det => det.message).join('. ');
            return res.status(400).json({ mensaje: 'Datos de entrada inválidos.', errores: mensajesErrores, resultado: null });
        }

        // Si no hay datos para actualizar, devolver error o no hacer nathing 
        if (Object.keys(value).length === 0) {
            return res.status(400).json({ mensaje: 'No se proporcionaron datos para actualizar.', resultado: null });
        }

        // 2. Buscar materia actual
        const materia = await Materia.findByPk(id);
        if (!materia) {
            return res.status(404).json({ mensaje: 'Materia no encontrada para actualizar.', resultado: null });
        }

        // 3. Verificar que sea unico si se esta cambiando el nombre
        if (value.nombre && value.nombre !== materia.nombre) {
            const nombreExistente = await Materia.findOne({ where: { nombre: value.nombre, id: { [Op.ne]: id } } }); // Buscar nombre en otras materias
            if (nombreExistente) {
                return res.status(409).json({ mensaje: `Ya existe otra materia con el nombre '${value.nombre}'.`, resultado: null });
            }
        }

        // 4. Verificar si el profesorId proporcionado existe (si se está cambiando/asignando)
        if (value.profesorId && value.profesorId !== materia.profesorId) {
             const profesorExiste = await Profesor.findByPk(value.profesorId);
             if (!profesorExiste) {
                 return res.status(404).json({ mensaje: `El profesor con ID ${value.profesorId} no existe. No se puede asignar.`, resultado: null });
             }
        }
         // Si se quiere desasignar un profesor (profesorId: null)
         if (value.hasOwnProperty('profesorId') && value.profesorId === null && materia.profesorId !== null) {
             // Permitir poner profesorId a null (ya validado por Joi 'allow(null)')
         }


        // 5. Actualizar materia
        const [numFilasActualizadas] = await Materia.update(value, { where: { id: id } });

        // 6. Devolver respuesta
        if (numFilasActualizadas > 0) {
            const materiaActualizada = await Materia.findByPk(id, { include: [{ model: Profesor, as: 'profesorAsignado', attributes: ['id', 'nombre', 'apellido'] }] }); // Obtener datos actualisheishons con profesor
            res.status(200).json({ mensaje: 'Materia actualizada exitosamente.', resultado: materiaActualizada });
        } else {
            res.status(200).json({ mensaje: 'No se realizaron cambios (datos iguales?).', resultado: materia });
        }

    } catch (error) {
        console.error(`Error al actualizar materia ID ${req.params.id}:`, error);
         if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({ mensaje: 'Error al actualizar: El nombre de la materia ya existe.', error: error.message, resultado: null });
         }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ mensaje: 'Error de clave foránea: El profesor especificado no existe.', error: error.message, resultado: null });
         }
        res.status(500).json({ mensaje: 'Error interno al actualizar la materia.', error: error.message, resultado: null });
    }
};

/**
 * @function asignarProfesor // para el requisito POST /asignar-profesor
 * @description Asigna un profesor existente a una materia existente
 */
const asignarProfesor = async (req, res) => {
    try {
        
        const { id: materiaId } = req.params;

        // 1. Validar body 
        const { error, value } = schemaAsignarProfesor.validate(req.body);
         if (error) {
             return res.status(400).json({ mensaje: 'Datos de entrada inválidos.', errores: error.details[0].message, resultado: null });
         }
         const { profesorId } = value;

        // 2. Buscar la materia
        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            return res.status(404).json({ mensaje: `Materia con ID ${materiaId} no encontrada.`, resultado: null });
        }

        // 3. Buscar el profesor
        const profesor = await Profesor.findByPk(profesorId);
         if (!profesor) {
             return res.status(404).json({ mensaje: `Profesor con ID ${profesorId} no encontrado.`, resultado: null });
         }

        // 4. Asignar el profesor actualizando la materia
        materia.profesorId = profesorId;
        await materia.save(); 

        // 5. Devolver respuesta con la materia actualizada
         const materiaActualizada = await Materia.findByPk(materiaId, { include: [{ model: Profesor, as: 'profesorAsignado', attributes: ['id', 'nombre', 'apellido'] }] });
        res.status(200).json({ mensaje: `Profesor ${profesor.nombre} ${profesor.apellido} asignado a la materia ${materia.nombre}.`, resultado: materiaActualizada });

    } catch(error) {
        console.error(`Error al asignar profesor ${req.body?.profesorId} a materia ${req.params.id}:`, error);
        // Podria haber errores de FK si los ids no son validos, aunque ya los validamos pero es mejor dejarlo indicado por si las flyes.
        res.status(500).json({ mensaje: 'Error interno al asignar el profesor.', error: error.message, resultado: null });
    }
}


/**
 * @function eliminarMateria
 * @description Elimina una materia por su ID
 */
const eliminarMateria = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar materia
        const materia = await Materia.findByPk(id);
        if (!materia) {
            return res.status(404).json({ mensaje: 'Materia no encontrada para eliminar.', resultado: null });
        }

        // 2. Considerar inscripciones (RECORDATORIO)
        // -----------

        // 3. Eliminar materia
        const numFilasEliminadas = await Materia.destroy({ where: { id: id } });

        // 4. Devolver respuesta
        if (numFilasEliminadas > 0) {
            res.status(200).json({ mensaje: 'Materia eliminada exitosamente.', resultado: { id: id } });
        } else {
             res.status(404).json({ mensaje: 'Materia no encontrada o ya había sido eliminada.', resultado: null });
        }

    } catch (error) {
        console.error(`Error al eliminar materia ID ${req.params.id}:`, error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ mensaje: 'No se puede eliminar la materia, tiene registros asociados.', error: error.message, resultado: null });
        }
        res.status(500).json({ mensaje: 'Error interno al eliminar la materia.', error: error.message, resultado: null });
    }
};

// --- exportar
module.exports = {
    crearMateria,
    listarMaterias,
    obtenerDetallesMateria, 
    actualizarMateria,
    eliminarMateria,
    asignarProfesor 
};