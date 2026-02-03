import { Request, Response } from 'express';
import * as historialModel from '../models/historial-clinico.model';
import * as veterinarioModel from '../models/veterinario.model';
import { validationResult } from 'express-validator';

// Obtener todos los historiales del usuario autenticado
export const obtenerHistoriales = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    
    console.log(`📋 Obteniendo historiales para usuario ${usuarioId} (admin: ${esAdmin})`);
    
    let historiales;
    
    if (esAdmin) {
      // Admin puede ver todos los historiales
      // (necesitaríamos una función getAllHistoriales en el modelo)
      // Por ahora, usamos la misma función pero esto hay que expandirlo
      historiales = await historialModel.getAllHistoriales();
    } else {
      // Veterinario solo ve sus propios historiales
      historiales = await historialModel.getHistorialByUsuario(usuarioId);
    }
    
    res.json({
      cantidad: historiales.length,
      historiales: historiales
    });
    
  } catch (error: any) {
    console.error('❌ Error al obtener historiales:', error);
    res.status(500).json({ 
      error: 'Error al obtener historiales',
      detalle: error.message 
    });
  }
};

// Obtener un historial específico por ID
export const obtenerHistorialPorId = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const idParam = req.params.id;
    const historialId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    
    console.log(`🔍 Buscando historial ${historialId} para usuario ${usuarioId}`);
    
    let historial;
    
    if (esAdmin) {
      // Admin puede ver cualquier historial
      // Necesito una función getHistorialById sin restricción de usuario
      // Por ahora, uso la misma
      historial = await historialModel.getHistorialByIdSinRestriccion(historialId);
    } else {
      // Veterinario solo puede ver sus propios historiales
      historial = await historialModel.getHistorialById(historialId, usuarioId);
    }
    
    if (!historial) {
      return res.status(404).json({ 
        error: 'Historial no encontrado o no tienes permisos' 
      });
    }
    
    res.json(historial);
    
  } catch (error: any) {
    console.error('❌ Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial',
      detalle: error.message 
    });
  }
};

// Crear nuevo historial clínico
export const crearHistorial = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const usuarioId = req.usuario.id;
    
    // 1. Obtener veterinario_id desde usuario_id
    const veterinarioId = await veterinarioModel.findVeterinarioByUsuarioId(usuarioId);
    
    if (!veterinarioId) {
      return res.status(400).json({ 
        error: 'Usuario no está asociado a un veterinario' 
      });
    }
    
    // 2. Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const datosHistorial = req.body;
    
    console.log(`➕ Creando historial - Usuario: ${usuarioId}, Veterinario: ${veterinarioId}`);
    
    // 3. Crear historial
    const nuevoHistorialId = await historialModel.createHistorial(
      datosHistorial,
      usuarioId,
      veterinarioId
    );
    
    res.status(201).json({
      id: nuevoHistorialId,
      mensaje: 'Historial clínico creado exitosamente',
      veterinario_id: veterinarioId
    });
    
  } catch (error: any) {
    console.error('❌ Error al crear historial:', error);
    res.status(500).json({ 
      error: 'Error al crear historial',
      detalle: error.message 
    });
  }
};

// Actualizar historial clínico
export const actualizarHistorial = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const idParam = req.params.id;
    const historialId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    const datosActualizados = req.body;
    
    console.log(`✏️ Actualizando historial ${historialId} para usuario ${usuarioId}`);
    
    const seActualizo = await historialModel.updateHistorial(
      historialId,
      datosActualizados,
      usuarioId,
      esAdmin
    );
    
    if (!seActualizo) {
      return res.status(404).json({ 
        error: 'Historial no encontrado o no tienes permisos para actualizarlo' 
      });
    }
    
    res.json({
      mensaje: 'Historial actualizado exitosamente',
      id: historialId
    });
    
  } catch (error: any) {
    console.error('❌ Error al actualizar historial:', error);
    res.status(500).json({ 
      error: 'Error al actualizar historial',
      detalle: error.message 
    });
  }
};

// Eliminar historial clínico
export const eliminarHistorial = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const idParam = req.params.id;
    const historialId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    
    console.log(`🗑️ Eliminando historial ${historialId} para usuario ${usuarioId}`);
    
    const seElimino = await historialModel.deleteHistorial(
      historialId,
      usuarioId,
      esAdmin
    );
    
    if (!seElimino) {
      return res.status(404).json({ 
        error: 'Historial no encontrado o no tienes permisos para eliminarlo' 
      });
    }
    
    res.json({
      mensaje: 'Historial eliminado exitosamente',
      id: historialId
    });
    
  } catch (error: any) {
    console.error('❌ Error al eliminar historial:', error);
    res.status(500).json({ 
      error: 'Error al eliminar historial',
      detalle: error.message 
    });
  }
};