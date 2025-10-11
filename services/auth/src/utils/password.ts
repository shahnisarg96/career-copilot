import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
