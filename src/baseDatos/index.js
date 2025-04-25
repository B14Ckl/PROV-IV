// src/baseDatos/index.js

require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

// --- Importar DEFINICIONES de modelos del Sistema colegio (PARA POSTMAN OJO)
const defineEstudiante = require('../modelos/estudiante');
const defineProfesor = require('../modelos/profesor');
const defineMateria = require('../modelos/materia');
const defineInscripcion = require('../modelos/inscripcion');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // meloo asi
  }
);

// --- modelos del Sistema colegio
const Estudiante = defineEstudiante(sequelize, DataTypes);
const Profesor = defineProfesor(sequelize, DataTypes);
const Materia = defineMateria(sequelize, DataTypes);
const Inscripcion = defineInscripcion(sequelize, DataTypes);

// --- Modelo Entidad-Relación (MER) (lo que pide el profe si sae)

// Relación Profesor <-> Materia (Uno a Muchos)
Profesor.hasMany(Materia, {
    foreignKey: 'profesorId',
    as: 'materiasDictadas'
});
Materia.belongsTo(Profesor, {
    foreignKey: 'profesorId',
    as: 'profesorAsignado'
});

// Relación Estudiante <-> Materia (Muchos a Muchos a través de Inscripcion)
Estudiante.belongsToMany(Materia, {
    through: Inscripcion,
    foreignKey: 'estudianteId',
    otherKey: 'materiaId',
    as: 'materiasInscritas'
});
Materia.belongsToMany(Estudiante, {
    through: Inscripcion,
    foreignKey: 'materiaId',
    otherKey: 'estudianteId',
    as: 'estudiantesInscritos'
});

// ACA SE DEJA COMO MAS COMPLETA LA VUELTA ----> relaciones directas con Inscripcion para acceder a datos de la tabla intermedia directamente
// Estudiante.hasMany(Inscripcion, { foreignKey: 'estudianteId', as: 'inscripciones' });
// Inscripcion.belongsTo(Estudiante, { foreignKey: 'estudianteId' });
// Materia.hasMany(Inscripcion, { foreignKey: 'materiaId', as: 'inscripciones' });
// Inscripcion.belongsTo(Materia, { foreignKey: 'materiaId' });
//EN OTRAS PALABRAS DECIDIR QUIEN ES CLAVE FORANEA Y CLAVE PRIMARIA PARA ACCEDER Y ATRAER DATOS, pero pues se deja como comentario porque no veo la necesidad de poner eso ya que se pide que almacene los datos y se muestren de manera funcional

// --- autenticacion y sincronizacion 
sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos.'))
  .catch(err => console.error('Pailas, No se pudo conectar a la base de datos:', err));

sequelize.sync({ alter: true }) // O { force: false }
  .then(() => console.log('Sincronización de modelos completada.'))
  .catch(err => console.error('Error en la sincronización:', err));

// --- mostrar/exportar ÚNICAMENTE los modelos del Sistema colegio y sequelize 
module.exports = {
  sequelize,
  Estudiante,
  Profesor,
  Materia,
  Inscripcion
};