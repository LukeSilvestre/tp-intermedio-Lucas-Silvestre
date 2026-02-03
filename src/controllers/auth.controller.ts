import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { validationResult } from 'express-validator';

// Controlador para registrar nuevo usuario
export const registrar = async (req: Request, res: Response) => {
  try {
    console.log('Intentando registrar usuario:', req.body.email);
    
    // Validar datos de entrada (luego agregaremos express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const usuarioId = await authService.registrarUsuario(req.body);
    
    console.log('Usuario registrado con ID:', usuarioId);
    res.status(201).json({ 
      id: usuarioId, 
      mensaje: 'Usuario registrado exitosamente' 
    });
    
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    
    // Manejar error de email duplicado
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate')) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      detalle: error.message 
    });
  }
};

// Controlador para iniciar sesión
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Intentando login para:', req.body.email);
    
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const respuesta = await authService.iniciarSesion(req.body);
    
    console.log('Login exitoso para:', req.body.email);
    res.json(respuesta);
    
  } catch (error: any) {
    console.error('Error en login:', error);
    
    if (error.message === 'Email o contraseña incorrectos') {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      detalle: error.message 
    });
  }
};

// Controlador para obtener perfil de usuario autenticado
export const obtenerPerfil = async (req: Request, res: Response) => {
  try {
    // req.usuario viene del middleware de autenticación
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    console.log('Obteniendo perfil para usuario ID:', req.usuario.id);
    
    res.json({
      usuario: req.usuario,
      mensaje: 'Perfil obtenido exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil',
      detalle: error.message 
    });
  }
};