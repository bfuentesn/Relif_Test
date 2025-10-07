import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router();

router.get('/health', async (ctx: Context) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

export default router;
