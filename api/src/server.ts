import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import clientsRouter from './routes/clients';

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

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Clients API: http://localhost:${PORT}/clients`);
});

export default app;
