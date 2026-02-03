import { Router } from 'express';
import { registrar, login, obtenerPerfil } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';
// Luego agregaremos validadores

const router = Router();

// Públicas
router.post('/registrar', registrar);
router.post('/login', login);

// Protegida (requiere token)
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;