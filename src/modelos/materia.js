const defineMateria = (sequelize, DataTypes) => {
    // Define el modelo "Materia" que corresponde a la tabla "materias" en la bd
    const Materia = sequelize.define('Materia', {
      // Atributo "id": tipo INTEGER, clave primaria, autoincremental
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Atributo "nombre": tipo STRING, no puede ser nulo y debe ser unico
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'nombre_materia_unique_constraint' // Asegura nombres de materia unicos
      },
      // Atributo "descripcion": tipo TEXT, puede ser nulo
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Atributo "profesorId": tipo INTEGER, clave foranea que referencia a la tabla "profesores"
      // La relacion se establecera explicitamente en baseDatos/index.js
      profesorId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: 'profesores', 
          key: 'id'        
        },
        onUpdate: 'CASCADE', 
        onDelete: 'SET NULL' 

      }
    }, {
      // Opciones del modelo:
      tableName: 'materias', 
      timestamps: true 
    });
  
    return Materia;
  };
  
  // exporta la funcions
  module.exports = defineMateria;