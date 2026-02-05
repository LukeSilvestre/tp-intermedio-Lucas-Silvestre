// src/index.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import historialRoutes from './routes/historial.routes';
import duenioRoutes from './routes/duenio.routes';

// Carga variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

//Rutas APIs
app.use('/api/auth', authRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/duenios', duenioRoutes);

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

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    ruta: req.originalUrl
  });
});

// Primero abro conexión a MySQL y luego inicio servidor node.js -- Las variables las levanto del .env
async function iniciarServidor() {
  try {
    // Prueba conexión a MySQL
    await testConnection();
    
    // Inicia servidor HTTP
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

// Inicia la aplicación
iniciarServidor();