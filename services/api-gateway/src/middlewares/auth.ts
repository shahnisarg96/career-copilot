import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveKeyPath(p: string) {
  if (path.isAbsolute(p)) return p;
  return path.resolve(__dirname, '../../', p);
}

let cachedPublicKey: string | null = null;
async function loadPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  const keyPath = resolveKeyPath(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem');
  cachedPublicKey = await fs.readFile(keyPath, 'utf8');
  return cachedPublicKey;
}

function getBearerToken(req: Request) {
  const header = req.header('authorization') || req.header('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export type JwtUser = {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name?: string;
};

export async function requireJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const publicKey = await loadPublicKey();
    const issuer = process.env.JWT_ISSUER || 'portfolio-auth';
    const audience = process.env.JWT_AUDIENCE || 'portfolio-api';

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer,
      audience,
    }) as jwt.JwtPayload;

    const sub = decoded.sub;
    const email = decoded.email;
    const role = decoded.role;

    if (!sub || typeof sub !== 'string') throw new Error('Invalid subject');
    if (!email || typeof email !== 'string') throw new Error('Invalid email');
    if (role !== 'ADMIN' && role !== 'USER') throw new Error('Invalid role');

    // Propagate identity downstream without requiring services to parse JWT yet.
    req.headers['x-user-id'] = sub;
    req.headers['x-user-email'] = email;
    req.headers['x-user-role'] = role;

    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.headers['x-user-role'];
  if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  return next();
}
