import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";

import Usuarios from "../models/Ususarios.js";
import { generateID,generateJWT } from "../utilities/tokens.js";
import { emailRegistro,emailPasswordRecovery } from "../utilities/emails.js";

const numberOfDaysToAdd = 3;

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesión',
        csrfToken: req.csrfToken(),
        autenticado: false
    })
}

const autenticar = async (req, res) => {
    //Valdiando inputs
    await check('correo').isEmail().withMessage('Formato de email inválido').run(req);
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req);

    const resultadoValdiacion = validationResult(req);

    if (!resultadoValdiacion.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: resultadoValdiacion.array()
        });
    }

    //Verificar que el usuario exista
    const { correo, password } = req.body;
    const usuario = await Usuarios.findOne({ where: { correo } });
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no existe' }]
        });
    }

    //Verificar si el usuario está confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'La cuenta no ha sido confirmada, revisa tu correo' }]
        });
    }

    //Verificar la contraseña
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Contraseña incorrecta' }]
        });
    }

    //Autenticar usuario
    const token = generateJWT({id: usuario.id, nombre: usuario.nombre, correo: usuario.correo});

    //Almacen de cookies
    return res.cookie('_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ?? false,
        //sameSite: true,
        maxAge: 3 * 60 * 60 * 1000 //3 horas
    }).redirect('/admin');
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken(),
    })
}
// ORM register
const registrar = async (req, res) => {
    //Validate data
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('correo').isEmail().withMessage('Formato de email inválido').run(req);
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe de contener al menos 6 carácteres').run(req);
    await check('password').not().equals('password2').withMessage('Las contraseñas deben de ser iguales').run(req);

    const resultadoValdiacion = validationResult(req);
    const { nombre, correo } = req.body;

    //Verify void results  to skip insert on bd
    if (!resultadoValdiacion.isEmpty()) {
        res.render('auth/registro', {
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
    try {
        let todayDate = new Date();
        const expiraCorreo = todayDate.setDate(todayDate.getDate() + numberOfDaysToAdd);
        req.body.expiracion = expiraCorreo;
    } catch (error) {
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [{ msg: `Error en la definición de fecha expira -- ${error}` }],
            usuario: {
                nombre: nombre,
                correo: correo
            }
        });
    }

    //Verify that user is not already registered
    const existeUsuario = await Usuarios.findOne({ where: { correo } });
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El correo ya está registrado' }],
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
    if (!emailSended) {
        return res.render('auth/registro', {
            pagina: 'Error al enviar correo',
            errores: [{ msg: 'Tuvimos problemas para enviar el correo de registro, por favor, contacta a un administrador' }],
            usuario: {
                nombre: nombre,
                correo: correo
            }
        });
    }


    res.render('templates/mensaje', {
        pagina: 'Cuenta creada exitosamente',
        mensaje: 'Hemos enviado un enlace de confirmación, revisa tu correo para activar tu cuenta'
    });

}

const confirmarCorreo = async (req, res) => {
    const { token } = req.params
    //Verificar token válido
    const usuario = await Usuarios.findOne({ where: { token } })
    if (!usuario) {
        return res.render('auth/confirmarCuenta', {
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
    res.render('auth/confirmarCuenta', {
        pagina: 'Confirmada correctamente',
        mensaje: '¡Cuenta confirmada exitosamente!'
    });
}

const formularioRecuperarPassword = (req, res) => {
    res.render('auth/recuperarCuenta', {
        pagin: 'Recuperar cuenta',
        csrfToken: req.csrfToken(),
    })
}

const sendResetPassword = async (req, res) => {
    await check('correo').isEmail().withMessage('Formato de email inválido').run(req);
    const resultadoValdiacion = validationResult(req);
    const { correo } = req.body;

    //Verify void results  to skip insert on bd
    if (!resultadoValdiacion.isEmpty()) {
        return res.render('auth/recuperarCuenta', {
            pagina: 'Recupera tu cuenta',
            csrfToken: req.csrfToken(),
            errores: resultadoValdiacion.array(),
            usuario: {
                correo: correo
            }
        });
    }
    //Verify that user is not already registered
    const existeUsuario = await Usuarios.findOne({ where: { correo } });
    if (!existeUsuario) {
        return res.render('auth/recuperarCuenta', {
            pagina: 'Recupera tu cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El correo NO está registrado' }],
            usuario: {
                correo: correo
            }
        });
    }

    //Genera token 
    existeUsuario.token = generateID();
    await existeUsuario.save();

    //Envía email
    const emailSended = emailPasswordRecovery({
        correo: existeUsuario.correo,
        token: existeUsuario.token
    });

    res.render('templates/mensaje', {
        pagina: 'Recupera tu cuenta',
        mensaje: 'Hemos enviado un enlace de confirmación, revisa tu correo para activar tu cuenta'
    });
}

const comprobarTokenRecuperacion = async (req, res) => {    
    const {token} = req.params;
    const usuario = await Usuarios.findOne({where:{token}});
    if(!usuario){
        return res.render('auth/confirmarCuenta',{
            pagina: 'Error al recuperar cuenta',
            mensaje: 'Token inválido, por favor, contacta a tu administrador',
            error: true
        });  
    }

    //formulario para restablecer contraseña
    res.render('auth/cambioPassword', {
        pagina: 'Recupera tu cuenta',
        csrfToken: req.csrfToken(),
        mensaje: 'Hemos enviado un enlace de confirmación, revisa tu correo para activar tu cuenta'
    });
}

const resetPassword = async (req, res) => {    
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe de contener al menos 6 carácteres').run(req);
    
    const resultadoValdiacion = validationResult(req);
    const {token} = req.params;
    const { password } = req.body;

    if (!resultadoValdiacion.isEmpty()) {
        return res.render('auth/cambioPassword', {
            pagina: 'Recupera tu cuenta',
            csrfToken: req.csrfToken(),
            errores: resultadoValdiacion.array(),
        });
    }

    //recupera el usuario
    const usuario = await Usuarios.findOne({where:{token}});

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('templates/mensaje', {
        pagina: 'Contraseña actualizada',
        mensaje: 'Su contraseña ha sido actualizada correctamente, ahora puede iniciar sesión con su nueva contraseña'
    });
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmarCorreo,
    formularioRecuperarPassword,
    sendResetPassword,
    comprobarTokenRecuperacion,
    resetPassword
};