import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';

import { connectDB } from './lib/db.js';
import { initSocket } from './lib/socket.js';
import assignmentRoutes from './routes/assignment.routes.js';
import './workers/generation.worker.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/assignments', assignmentRoutes);

app.get('/', (_req, res) => {
  res.send('VedaAI Backend Service');
});

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ message });
});

const port = process.env.PORT ?? '5000';

connectDB()
  .then(() => {
    initSocket(httpServer);
    httpServer.listen(Number(port), () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
