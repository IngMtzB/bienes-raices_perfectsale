import { check, validationResult } from "express-validator";

import Usuarios from "../models/Ususarios.js";
import { generateID } from "../utilities/tokens.js";
import { emailRegistro } from "../utilities/emails.js";
import { generateToken } from "../index.js";


const numberOfDaysToAdd = 3;

const formularioLogin = (req,res)=>{
    res.render('auth/login',{
        pagina: 'Iniciar sesión',
        autenticado : false
    })
}

const formularioRegistro = (req,res)=>{
    const tokenGenerated = generateToken(req, res);
    res.render('auth/registro',{
        pagina: 'Crear cuenta',
        csrfToken: tokenGenerated
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

    //Used to sen email registry
    const emailSended = emailRegistro({
        nombre: usuario.nombre,
        correo: usuario.correo,
        token: usuario.token
    });
    if(!emailSended){
        return res.render('auth/registro',{
            pagina: 'Error al enviar correo',
            errores: [{msg:'Tuvimos problemas para enviar el correo de registro, por favor, contacta a un administrador'}],
            usuario: {
                nombre: nombre,
                correo: correo 
            }
        });
    }


    res.render('templates/mensaje',{
        pagina: 'Cuenta creada exitosamente',
        mensaje: 'Hemos enviado un enlace de confirmación, revisa tu correo para activar tu cuenta'
    });
    
}

const confirmarCorreo = async (req,res)=>{
    const {token} = req.params
    //Verificar token válido
    const usuario = await Usuarios.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmarCuenta',{
            pagina: 'Error al confirmar cuenta',
            mensaje: 'Error al validar token, si el problema persiste, contacta a tu administrador',
            error: true
        })
    }
    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = 1;
    //guarda cambios en la base de datos
    await usuario.save();
    res.render('auth/confirmarCuenta',{
        pagina: 'Confirmada correctamente',
        mensaje: '¡Cuenta confirmada exitosamente!'
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
    confirmarCorreo,
    formularioRecuperarPassword
    
};