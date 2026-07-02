// SSE 服务端路由
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sseManager } from '../services/sse-manager.js';

export function createSseRouter(): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('event: system\ndata: {"event":"connected"}\n\n');

    const client = { res, userId: req.user!.userId };
    sseManager.add(client);

    // 心跳
    const heartbeat = setInterval(() => {
      try {
        res.write('event: heartbeat\ndata: {}\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseManager.remove(client);
    });
  });

  return router;
}
