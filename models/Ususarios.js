import { DataTypes } from "sequelize"; 
import bcrypt from "bcrypt";

import db from "../config/db.js";

const Usuarios = db.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    confirmado: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    token: {
        type: DataTypes.STRING
    },
    expiracion: {
        type: DataTypes.DATE
    }
},
{
    hooks: {
        //Hashing password before creating a new user
        beforeCreate: async function(usuario){
            usuario.password = await bcrypt.hashSync(usuario.password, await bcrypt.genSaltSync(10));
        }  
    }
});

//Métodos personalizados
Usuarios.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

export default Usuarios;