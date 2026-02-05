// src/controllers/duenio.controller.ts
import { Request, Response } from 'express';
import * as duenioModel from '../models/duenio.model';
import { validationResult } from 'express-validator';

export const obtenerDuenios = async (req: Request, res: Response) => {
  try {
    const duenios = await duenioModel.findAll();
    res.json({ cantidad: duenios.length, duenios });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener dueños' });
  }
};

export const obtenerDuenioPorId = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const duenio = await duenioModel.findById(id);
    
    if (!duenio) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    
    res.json(duenio);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener dueño' });
  }
};

export const crearDuenio = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const nuevoId = await duenioModel.create(req.body);
    res.status(201).json({ id: nuevoId, mensaje: 'Dueño creado' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al crear dueño' });
  }
};

export const actualizarDuenio = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const actualizado = await duenioModel.update(id, req.body);
    
    if (!actualizado) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    
    res.json({ mensaje: 'Dueño actualizado', id });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar dueño' });
  }
};

export const eliminarDuenio = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const eliminado = await duenioModel.deleteById(id);
    
    if (!eliminado) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    
    res.json({ mensaje: 'Dueño eliminado', id });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar dueño' });
  }
};