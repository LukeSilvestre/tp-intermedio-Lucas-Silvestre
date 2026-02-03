// src/models/veterinario.model.ts
import pool from '../config/database';

export interface Veterinario {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  usuario_id: number | null;
}

// Buscar veterinario por ID de usuario
export const findVeterinarioByUsuarioId = async (usuarioId: number): Promise<number | null> => {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM veterinarios WHERE usuario_id = ?',
      [usuarioId]
    );
    
    const veterinarios = rows as any[];
    
    if (veterinarios.length === 0) {
      console.log(`⚠️ No se encontró veterinario para usuario_id: ${usuarioId}`);
      return null;
    }
    
    console.log(`✅ Veterinario encontrado: ID ${veterinarios[0].id} para usuario ${usuarioId}`);
    return veterinarios[0].id;
    
  } catch (error) {
    console.error('❌ Error buscando veterinario:', error);
    return null;
  }
};

// Buscar veterinario por ID
export const findVeterinarioById = async (id: number): Promise<Veterinario | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM veterinarios WHERE id = ?',
    [id]
  );
  
  const veterinarios = rows as Veterinario[];
  return veterinarios.length > 0 ? veterinarios[0] : null;
};