const defineInscripcion = (sequelize, DataTypes) => {
    // Define el modelo "Inscripcion" que corresponde a la tabla "inscripciones" en la bd
    const Inscripcion = sequelize.define('Inscripcion', {
      // Atributo "id": tipo INTEGER, clave primaria, autoincremental
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Atributo "estudianteId": tipo INTEGER, clave foranea que referencia a "estudiantes"
      estudianteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiantes', 
          key: 'id'          
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra un estudiante, se borran sus inscripciones de una vex
      },
      // Atributo "materiaId": tipo INTEGER, clave foranea que referencia a "materias"
      materiaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'materias', 
          key: 'id'         
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra una materia, se borran sus inscripciones de una vez
      },
      // Atributo "fecha_inscripcion": tipo DATE, guarda cuando se hizo la inscripcion
      fecha_inscripcion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Valor por defecto: la fecha y hora actual jejeje
      }
      // Se podria añadir un campo "calificacion", pero entonces mas adelante
    }, {
      // Opciones del modelo:
      tableName: 'inscripciones', 
      timestamps: true, // Añade createdAt y updatedAt pa ver cuando se modifico
  
      // indices para mejorar rendimiento y asegurar que sea unico de pares
      indexes: [
          {
              unique: true, // Un estudiante no puede inscribirse dos veces en la misma materia
              fields: ['estudianteId', 'materiaId']
          }
      ]
    });
  
    return Inscripcion;
  };
  
  // exporta la funcion
  module.exports = defineInscripcion;