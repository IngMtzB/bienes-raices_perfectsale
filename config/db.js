
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config({path:'.env'});



const dbconnection = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD,{
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    define:{
        timestamps:1
    },
    pool:{
        max:5,
        min:0,
        require:30000,
        idle:10000
    },
    operatorsAliases:0
});
export default dbconnection;