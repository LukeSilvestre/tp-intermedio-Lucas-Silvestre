import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usuarioModel from '../models/usuario.model';
import { CreateUsuarioDTO, LoginDTO, JwtPayload, LoginResponseDTO } from '../types/auth';
import { toResponseDTO } from '../models/usuario.model';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Registrar nuevo usuario (solo admin puede hacer esto)
export const registrarUsuario = async (dto: CreateUsuarioDTO): Promise<number> => {
  const passwordHasheado = await bcrypt.hash(dto.password, 10);
  
  // Aquí necesitaríamos modificar createUsuario para aceptar password hasheado
  // Por ahora, simplifiquemos:
  const usuarioCreado = await usuarioModel.createUsuario({
    ...dto,
    password: passwordHasheado
  });
  
  return usuarioCreado;
};

// Iniciar sesión y generar token
export const iniciarSesion = async (dto: LoginDTO): Promise<LoginResponseDTO> => {
  // Verificar credenciales
  const usuario = await usuarioModel.verifyCredentials(dto);
  
  if (!usuario) {
    throw new Error('Email o contraseña incorrectos');
  }
  
  // Crear payload para el token JWT
  const payload: JwtPayload = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol
  };
  
  // Generar token
  const opcionesToken: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1h',
    issuer: 'veterinaria-patitas-felices'
    };
    
  // Generar token - asegurar que payload es objeto
  const token = jwt.sign(payload as object, JWT_SECRET, opcionesToken);
  
  // Crear respuesta
  const respuesta: LoginResponseDTO = {
    token: token,
    usuario: toResponseDTO(usuario)
  };
  
  return respuesta;
};