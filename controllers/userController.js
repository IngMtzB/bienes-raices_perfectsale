import { check, validationResult } from "express-validator";

import Usuarios from "../models/Ususarios.js";
import { generateID } from "../utilities/tokens.js";

const numberOfDaysToAdd = 3;

const formularioLogin = (req,res)=>{
    res.render('auth/login',{
        pagina: 'Iniciar sesión',
        autenticado : false
    })
}

const formularioRegistro = (req,res)=>{
    res.render('auth/registro',{
        pagina: 'Crear cuenta',
    })
}
// ORM register
const registrar = async (req,res)=>{
    //Validate data
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('correo').isEmail().withMessage('Formato de email inválido').run(req);
    await check('password').isLength({min:6}).withMessage('La contraseña debe de contener al menos 6 carácteres').run(req);
    await check('password').not().equals('password2').withMessage('Las contraseñas deben de ser iguales').run(req);

    const resultadoValdiacion = validationResult(req);
    const {nombre, correo} = req.body;

    //Verify void results  to skip insert on bd
    if(!resultadoValdiacion.isEmpty()){
        res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultadoValdiacion.array(),
            usuario: {
                nombre: nombre,
                correo: correo 
            }
        });
        return;
    }

    //Handilng date
    try{
        let todayDate = new Date();
        const expiraCorreo = todayDate.setDate(todayDate.getDate() + numberOfDaysToAdd);
        req.body.expiracion = expiraCorreo;
    }catch(error){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg:`Error en la definición de fecha expira -- ${error}`}],
            usuario: {
                nombre: nombre,
                correo: correo 
            }
        });
    }

    //Verify that user is not already registered
    const existeUsuario = await Usuarios.findOne({where:{correo:correo}});
    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg:'El correo ya está registrado'}],
            usuario: {
                nombre: nombre,
                correo: correo 
            }
        });
    }

    req.body.token = generateID();

    const usuario = await Usuarios.create(req.body);

    res.render('templates/mensaje',{
        pagina: 'Cuenta creada exitosamente',
        mensaje: 'Hemos enviado un enlace de confirmación, revisa tu correo para activar tu cuenta'
    });
    
}

const formularioRecuperarPassword = (req,res)=>{
    res.render('auth/recuperarCuenta',{
        pagin : 'Recuperar cuenta',
    })
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioRecuperarPassword
};