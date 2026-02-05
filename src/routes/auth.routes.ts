import { Router } from 'express';
import { registrar, login, obtenerPerfil } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { registrarValidator, loginValidator } from '../validators/auth.validator';


const router = Router();

// Públicas
router.post('/registrar', registrarValidator, registrar);
router.post('/login', loginValidator, login);


// Protegida (requiere token)
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;