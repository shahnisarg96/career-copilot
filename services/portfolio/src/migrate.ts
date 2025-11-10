import fs from 'fs';
import path from 'path';
import pg from 'pg';

const sqlDir = path.resolve(process.cwd(), 'src', 'migrations');

async function ensureMigrationsTable(client: pg.Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied(client: pg.Client): Promise<Set<string>> {
  const res = await client.query('SELECT name FROM app_migrations');
  return new Set(res.rows.map((r: any) => r.name));
}

async function applyMigration(client: pg.Client, name: string, sql: string) {
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO app_migrations(name) VALUES($1)', [name]);
    await client.query('COMMIT');
    console.log(`Applied migration: ${name}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL not set');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getApplied(client);
    if (!fs.existsSync(sqlDir)) {
      console.log('No migrations directory found, skipping.');
      return;
    }
    const files = fs
      .readdirSync(sqlDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      await applyMigration(client, file, sql);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
