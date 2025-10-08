// @ts-ignore
import bodyParser = require('koa-bodyparser');
// @ts-ignore
import json = require('koa-json');

type KoaType = { default: any };
const koa = require('koa') as KoaType;
const Koa = koa.default;
const cors = require('@koa/cors');
import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import clientsRouter from './routes/clients';
import assistantRouter from './routes/assistant';

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(errorHandler);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',
  credentials: true
}));
app.use(bodyParser());
app.use(json());

// Routes
app.use(healthRouter.routes()).use(healthRouter.allowedMethods());
app.use(clientsRouter.routes()).use(clientsRouter.allowedMethods());
app.use(assistantRouter.routes()).use(assistantRouter.allowedMethods());

// Error handling
import type { Context } from 'koa';
app.on('error', (err: any, ctx: Context) => {
  console.error('Server error:', err);
});

// Connect to database and start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('🗄️ Connected to database');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 Clients API: http://localhost:${PORT}/clients`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
