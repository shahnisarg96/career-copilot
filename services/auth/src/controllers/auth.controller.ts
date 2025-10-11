import { Request, Response } from 'express';
import type { AuthedRequest } from '../middlewares/auth.js';
import { prisma } from '@dissertation/prisma-client';
import { logger, UserRole } from '@dissertation/common';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function signup(req: Request, res: Response) {
  const { email, password, name } = req.body ?? {};
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const role = (adminEmail && normalizedEmail === adminEmail ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER';

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: isNonEmptyString(name) ? name.trim() : null,
        role,
      },
    });

    const token = await signAccessToken({
      sub: String(user.id),
      email: user.email,
      role: user.role as 'ADMIN' | 'USER',
      name: user.name ?? undefined,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    logger.error(`Signup failed: ${err instanceof Error ? err.message : String(err)}`);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = await signAccessToken({
    sub: String(user.id),
    email: user.email,
    role: user.role as 'ADMIN' | 'USER',
    name: user.name ?? undefined,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export async function me(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = Number(req.user.sub);
  if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export async function listUsers(_req: AuthedRequest, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return res.json(users);
}
