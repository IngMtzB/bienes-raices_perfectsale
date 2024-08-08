import express from 'express';

import {admin} from '../controllers/propiedadesController.js';

const router = express.Router();

router.get('/dashboard', admin);

export default router;