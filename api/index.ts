import type { Request, Response } from 'express';
import { app } from '../src/server/app';

// Point d'entrée Serverless Vercel universel pour Vérif237
// Redirige toutes les requêtes /api/* vers l'application Express
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
