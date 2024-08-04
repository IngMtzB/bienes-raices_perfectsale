import express from 'express';
import {formularioLogin,formularioRegistro,registrar,formularioRecuperarPassword} from '../controllers/userController.js';

const router = express.Router();

router.get('/login',formularioLogin);
router.get('/registro',formularioRegistro);
router.post('/registro',registrar);
router.get('/recuperarcuenta',formularioRecuperarPassword);

export default router;