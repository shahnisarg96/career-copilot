import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type JwtUserClaims = {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name?: string;
};

function resolveKeyPath(p: string) {
  // Allow absolute paths (container mounts) or relative-to-auth-service root.
  if (path.isAbsolute(p)) return p;
  return path.resolve(__dirname, '../../', p);
}

let cachedPrivateKey: string | null = null;
let cachedPublicKey: string | null = null;

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureJwtKeypair() {
  const privateKeyPath = resolveKeyPath(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem');
  const publicKeyPath = resolveKeyPath(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem');

  const [hasPriv, hasPub] = await Promise.all([fileExists(privateKeyPath), fileExists(publicKeyPath)]);
  if (hasPriv && hasPub) return { privateKeyPath, publicKeyPath };

  await fs.mkdir(path.dirname(privateKeyPath), { recursive: true });
  await fs.mkdir(path.dirname(publicKeyPath), { recursive: true });

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  await Promise.all([
    fs.writeFile(privateKeyPath, privateKey, 'utf8'),
    fs.writeFile(publicKeyPath, publicKey, 'utf8'),
  ]);

  return { privateKeyPath, publicKeyPath };
}

export async function loadPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;
  const { privateKeyPath } = await ensureJwtKeypair();
  cachedPrivateKey = await fs.readFile(privateKeyPath, 'utf8');
  return cachedPrivateKey;
}

export async function loadPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  const { publicKeyPath } = await ensureJwtKeypair();
  cachedPublicKey = await fs.readFile(publicKeyPath, 'utf8');
  return cachedPublicKey;
}

export async function signAccessToken(claims: JwtUserClaims) {
  const privateKey = await loadPrivateKey();
  const issuer = process.env.JWT_ISSUER || 'portfolio-auth';
  const audience = process.env.JWT_AUDIENCE || 'portfolio-api';
  const expiresInSeconds = Number(process.env.TOKEN_EXPIRY || 3600);

  return jwt.sign(
    {
      email: claims.email,
      role: claims.role,
      name: claims.name,
    },
    privateKey,
    {
      algorithm: 'RS256',
      subject: claims.sub,
      issuer,
      audience,
      expiresIn: expiresInSeconds,
    }
  );
}

export async function verifyAccessToken(token: string): Promise<JwtUserClaims> {
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

  if (!sub || typeof sub !== 'string') throw new Error('Invalid token subject');
  if (!email || typeof email !== 'string') throw new Error('Invalid token email');
  if (role !== 'ADMIN' && role !== 'USER') throw new Error('Invalid token role');

  return {
    sub,
    email,
    role,
    name: typeof decoded.name === 'string' ? decoded.name : undefined,
  };
}
