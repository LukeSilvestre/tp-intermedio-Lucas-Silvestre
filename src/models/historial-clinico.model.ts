import pool from '../config/database';
import { 
  HistorialClinico, 
  CreateHistorialDTO, 
  UpdateHistorialDTO,
  HistorialResponseDTO 
} from '../types/historial-clinico';

// Obtener historial por ID de usuario (protección)
export const getHistorialByUsuario = async (usuarioId: number): Promise<HistorialResponseDTO[]> => {
  const [rows] = await pool.execute(
    `SELECT hc.*, m.nombre as mascota_nombre, v.nombre as veterinario_nombre
     FROM historial_clinico hc
     JOIN mascotas m ON hc.id_mascota = m.id
     JOIN veterinarios v ON hc.id_veterinario = v.id
     WHERE hc.usuario_id = ?
     ORDER BY hc.fecha_registro DESC`,
    [usuarioId]
  );
  
  return rows as HistorialResponseDTO[];
};

// Obtener historial por ID (solo si pertenece al usuario)
export const getHistorialById = async (id: number, usuarioId: number): Promise<HistorialResponseDTO | null> => {
  const [rows] = await pool.execute(
    `SELECT hc.*, m.nombre as mascota_nombre, v.nombre as veterinario_nombre
     FROM historial_clinico hc
     JOIN mascotas m ON hc.id_mascota = m.id
     JOIN veterinarios v ON hc.id_veterinario = v.id
     WHERE hc.id = ? AND hc.usuario_id = ?`,
    [id, usuarioId]
  );
  
  const historiales = rows as HistorialResponseDTO[];
  return historiales.length > 0 ? historiales[0] : null;
};

// Crear un nuevo registro en el historial clínico
export const createHistorial = async (
  datosNuevos: CreateHistorialDTO,
  usuarioId: number,
  veterinarioId: number
): Promise<number> => {
  
  const consultaSQL = `
    INSERT INTO historial_clinico 
    (id_mascota, id_veterinario, usuario_id, descripcion) 
    VALUES (?, ?, ?, ?)
  `;
  
  const parametros = [
    datosNuevos.id_mascota,
    veterinarioId,
    usuarioId,
    datosNuevos.descripcion
  ];
  
  const [resultado] = await pool.execute(consultaSQL, parametros);
  const idInsertado = (resultado as any).insertId;
  
  return idInsertado;
};

// Actualizar historial (solo si pertenece al usuario o es admin)
export const updateHistorial = async (
  historialId: number,
  nuevosDatos: UpdateHistorialDTO,
  idUsuario: number,
  esAdministrador: boolean = false
): Promise<boolean> => {
  
  // Consulta según los permisos
  let consultaSQL: string;
  let valores: any[] = [nuevosDatos.descripcion, historialId];
  
  if (esAdministrador) {
    // Admin puede actualizar cualquier historial
    consultaSQL = 'UPDATE historial_clinico SET descripcion = ? WHERE id = ?';
  } else {
    // Veterinario solo puede actualizar sus propios historiales
    consultaSQL = 'UPDATE historial_clinico SET descripcion = ? WHERE id = ? AND usuario_id = ?';
    valores.push(idUsuario); // Agregar el ID del usuario a los valores
  }
  
  try {
    // Ejecutar la consulta
    const [resultado] = await pool.execute(consultaSQL, valores);
    
    // resultado es un array, reviso con affectedRows si cambió algo
    const resultadoMySQL = resultado as any;
    
    // Si affectedRows es mayor que 0, se actualizó algo
    if (resultadoMySQL.affectedRows > 0) {
      return true; // Se actualizó correctamente
    } else {
      return false; // No se encontró el historial o no tiene permisos
    }
    
  } catch (error) {
    console.error('Error al actualizar historial:', error);
    return false;
  }
};

// Eliminar historial (solo si pertenece al usuario o es admin)
export const deleteHistorial = async (
  id: number,
  usuarioId: number,
  esAdmin: boolean = false
): Promise<boolean> => {
  const query = esAdmin
    ? 'DELETE FROM historial_clinico WHERE id = ?'
    : 'DELETE FROM historial_clinico WHERE id = ? AND usuario_id = ?';
  
  const params = esAdmin ? [id] : [id, usuarioId];
  
  const [result] = await pool.execute(query, params);
  return (result as any).affectedRows > 0;
};