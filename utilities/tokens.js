import jwt from "jsonwebtoken";

const generateJWT = userData => jwt.sign({
    id: userData.id, 
    nombre: userData.nombre,
    correo: userData.correo,
}, process.env.JWT_SECRET, {
    expiresIn: '3h'
});


const generateID = () => Math.random().toString(32).substr(2) + '-'+ Date.now().toString(32) + '-' + '-' + Math.random().toString(36).substr(2) + Date.now().toString(36) ;

export  {
    generateID,
    generateJWT
};