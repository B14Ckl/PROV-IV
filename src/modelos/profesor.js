const defineProfesor = (sequelize, DataTypes) => {
    // Define el modelo "Profesor" que corresponde a la tabla "profesores" en la BD
    const Profesor = sequelize.define('Profesor', {
      // Atributo "id": tipo INTEGER, clave primaria, autoincremental
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Atributo "nombre": tipo STRING, no puede ser nulo
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Atributo "apellido": tipo STRING, no puede ser nulo
      apellido: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Atributo "especialidad": tipo STRING, puede ser nulo
      especialidad: {
        type: DataTypes.STRING,
        allowNull: true 
      }
      // Añadir otros campos si son necesarios (ej: email, telefono, etc.)
    }, {
      // Opciones del modelo
      tableName: 'profesores', 
      timestamps: true 
    });
  
    return Profesor;
  };
  
  // Exporta la funcion
  module.exports = defineProfesor;