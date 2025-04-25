const defineEstudiante = (sequelize, DataTypes) => {
    // Define el modelo "Estudiante" que corresponde a la tabla "estudiantes" en la bd
    const Estudiante = sequelize.define('Estudiante', {
      // Atributo "id": tipo INTEGER, clave primaria, autoincremental
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Atributo "nombre": tipo STRING (VARCHAR(255)), no puede ser nulo
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Atributo "apellido": tipo STRING, no puede ser nulo
      apellido: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Atributo "email": tipo STRING, no puede ser nulo y debe ser unico
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'email_unique_constraint', // Nombre restriccion pa que sea unico y dejen de ser copiones
        validate: {
          isEmail: true 
        }
      },
      //Atributo "direccion": Tipo STRING, no puede ser nulo, porque ?  porque es mi codigo y hago lo que yo quiero, si sae pa? no mentiras porque quiero asi profe
      direccion: {
        type: DataTypes.STRING,
        allowNull: false 
      }
    }, {
      // Opciones del modelo:
      tableName: 'estudiantes', // Nombre de la tabla en la base de datos
      timestamps: true // Sequelize añadira createdAt y updatedAt automaticamente pa alimentar la pereza un poquito
    });
  
    return Estudiante;
  };
  
  // exporta la funcion para que pueda ser usada en otros lugares (como en baseDatos/index.js)
  module.exports = defineEstudiante;