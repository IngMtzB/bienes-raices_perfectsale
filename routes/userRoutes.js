import express from 'express';
import {formularioLogin,formularioRegistro,registrar,formularioRecuperarPassword,confirmarCorreo} from '../controllers/userController.js';

const router = express.Router();

router.get('/login',formularioLogin);
router.get('/registro',formularioRegistro);
router.post('/registro',registrar);
router.get('/recuperarcuenta',formularioRecuperarPassword);
router.get('/confirmarcorreo/:token', confirmarCorreo);

export default router;