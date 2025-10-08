/**
 * Servidor principal de la API
 * Configura el servidor Koa con middleware y rutas
 */

// @ts-ignore - CommonJS imports for Koa middleware
import bodyParser = require('koa-bodyparser');
// @ts-ignore
import json = require('koa-json');

// Declaración global para require (Node.js)
declare const require: any;
declare const module: any;

type KoaType = { default: any };
const koa = require('koa') as KoaType;
const Koa = koa.default;
const cors = require('@koa/cors');

import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import clientsRouter from './routes/clients';
import assistantRouter from './routes/assistant';
import { SERVER_CONFIG } from './utils/constants';

/**
 * Inicialización de la aplicación Koa
 */
const app = new Koa();

/**
 * Puerto del servidor - usa variable de entorno o puerto por defecto
 */
const PORT = process.env.PORT || 3000;

/**
 * Configuración de middleware
 * Aplica middleware en orden correcto para manejo de errores, CORS, parsing y logging
 */
// Error handling debe ir primero
app.use(errorHandler);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? SERVER_CONFIG.CORS_ORIGINS.PRODUCTION
    : SERVER_CONFIG.CORS_ORIGINS.DEVELOPMENT,
  credentials: true
}));

// Body parsing
app.use(bodyParser({
  jsonLimit: '10mb', // Límite para requests JSON
  textLimit: '10mb'
}));

// JSON response formatting
app.use(json());

/**
 * Configuración de rutas
 * Aplica todas las rutas de la API con sus métodos permitidos
 */
app.use(healthRouter.routes()).use(healthRouter.allowedMethods());
app.use(clientsRouter.routes()).use(clientsRouter.allowedMethods());
app.use(assistantRouter.routes()).use(assistantRouter.allowedMethods());

/**
 * Manejo global de errores del servidor
 */
import type { Context } from 'koa';
app.on('error', (err: any, ctx: Context) => {
  console.error(`❌ Server error ${ctx ? `at ${ctx.request.method} ${ctx.request.url}` : ''}:`, err);
});

/**
 * Función para cerrar el servidor de manera ordenada
 */
async function gracefulShutdown() {
  console.log('🔄 Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Manejadores de señales para shutdown ordenado
 */
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Conecta a la base de datos e inicia el servidor
 */
async function startServer(): Promise<void> {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('🗄️  Database connected successfully');

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 Server started successfully');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('📊 API Endpoints:');
      console.log(`   - Health: http://localhost:${PORT}/health`);
      console.log(`   - Clients: http://localhost:${PORT}/clients`);
      console.log(`   - Assistant: http://localhost:${PORT}/assistant`);
    });

    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await gracefulShutdown();
  }
}

// Solo iniciar el servidor si se ejecuta directamente (no en Vercel)
if (require.main === module) {
  startServer();
}

export default app;
