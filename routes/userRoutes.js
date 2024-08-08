import express from 'express';
import {formularioLogin,formularioRegistro,registrar,formularioRecuperarPassword,confirmarCorreo, sendResetPassword,comprobarTokenRecuperacion,resetPassword} from '../controllers/userController.js';

const router = express.Router();

router.get('/login',formularioLogin);

router.get('/registro',formularioRegistro);
router.post('/registro',registrar);
router.get('/confirmarcorreo/:token', confirmarCorreo);
//Formulario para envío de correo
router.get('/recuperarCuenta',formularioRecuperarPassword);
router.post('/recuperarCuenta',sendResetPassword);
//Formulario para recuperación tras recibir correo
router.get('/cambioPassword/:token', comprobarTokenRecuperacion);
router.post('/cambioPassword/:token', resetPassword);


export default router;