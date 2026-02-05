export interface HistorialClinico {
  id: number;
  id_mascota: number;
  id_veterinario: number;
  usuario_id: number;  // CLAVE: asociado al usuario que lo creó
  fecha_registro: Date;
  descripcion: string;
}

export interface CreateHistorialDTO {
  id_mascota: number;
  descripcion: string;
}

export interface UpdateHistorialDTO {
  descripcion?: string;
}

export interface HistorialResponseDTO {
  id: number;
  id_mascota: number;
  mascota_nombre: string;
  duenio_nombre: string;
  id_veterinario: number;
  veterinario_nombre: string;
  usuario_id: number;
  fecha_registro: Date;
  descripcion: string;
}