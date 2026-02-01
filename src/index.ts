// src/index.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Ruta de prueba simple
app.get('/api/saludo', (req: Request, res: Response) => {
  console.log("Llamada a la /api/saludo --> Recibida");
  res.json({ mensaje: 'Hola desde la API de Veterinaria' });
});

// Ruta para probar conexión a BD
app.get('/api/test-db', async (req: Request, res: Response) => {
    console.log("Llamada a la /api/test-db --> Recibida");
  try {
    await testConnection();
      res.json({ mensaje: '✅ Conexión a MySQL exitosa' });
  } catch (error: any) {
    res.status(500).json({ error: '❌ Error de conexión a MySQL', detalle: error.message });
  }
});

// Primero abro conexión a MySQL y luego inicio servidor node.js -- Las variables las levanto del .env
async function iniciarServidor() {
  try {
    // Probar conexión a MySQL
    await testConnection();
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Ruta de prueba BD: http://localhost:${PORT}/api/test-db`);
      console.log(`👋 Ruta de saludo: http://localhost:${PORT}/api/saludo`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
iniciarServidor();