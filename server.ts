import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { app } from './src/server/app';
import { verificationQueue } from './src/server/verificationQueue';

const PORT = Number(process.env.PORT) || 3000;

export async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    // SPA catch-all for web routes (excluding /api routes which are handled as JSON)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VERIF237] Full-Stack server running on http://0.0.0.0:${PORT}`);
    verificationQueue.resumePendingTasks();
  });

  return server;
}

startServer();

export { app };
