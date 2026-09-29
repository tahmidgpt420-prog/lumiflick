import 'server-only';
import mysql from 'mysql2/promise';

// Columns stored as JSON. MariaDB's JSON type is LONGTEXT underneath, so the
// driver can't tell them apart from plain text — they're parsed by name.
const JSON_COLUMNS = new Set(['gallery_images', 'specifications', 'variations', 'tags', 'promo_bar_items', 'items']);

function createPool() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    // Hostinger's MariaDB kills connections idle for 20s (wait_timeout),
    // so reusing one after that fails with ECONNRESET. Close our idle ones
    // first. mysql2 only runs its idle reaper when maxIdle < connectionLimit.
    maxIdle: 4,
    idleTimeout: 10_000,
    charset: 'utf8mb4',
    timezone: 'Z',
    decimalNumbers: true,
    // Return rows in the same shape supabase-js did, so the mappers stay
    // unchanged: booleans as booleans, JSON as parsed values, timestamps as
    // ISO strings.
    typeCast(field, next) {
      if (field.type === 'TINY' && field.length === 1) {
        const v = field.string();
        return v === null ? null : v === '1';
      }
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        const v = field.string();
        return v === null ? null : v.replace(' ', 'T') + 'Z';
      }
      if (JSON_COLUMNS.has(field.name)) {
        const v = field.string();
        return v === null ? null : JSON.parse(v);
      }
      return next();
    },
  });
  // All DATETIME columns hold UTC — keep column defaults (CURRENT_TIMESTAMP) in UTC too.
  // Strict mode: Hostinger's default silently truncates oversized values
  // (e.g. a base64 image) instead of rejecting the write.
  pool.on('connection', (conn) => {
    conn.query("SET time_zone = '+00:00', sql_mode = CONCAT(@@sql_mode, ',STRICT_ALL_TABLES')");
  });
  return pool;
}

// Reuse one pool across dev hot-reloads instead of leaking a new one per reload.
const globalForDb = globalThis as unknown as { dbPool?: mysql.Pool };
export const db = (globalForDb.dbPool ??= createPool());

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await db.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}

/** Runs INSERT/UPDATE/DELETE and returns the number of matched rows. */
export async function execute(sql: string, params?: any[]): Promise<number> {
  const [result] = await db.query<mysql.ResultSetHeader>(sql, params);
  return result.affectedRows;
}

/** JSON-encodes object/array values so `SET ?` writes them as JSON, not as `a = b` lists. */
export function toRow(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v !== null && typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : v;
  }
  return out;
}

/**
 * UPDATE by primary key, INSERT if no row matched. Deliberately not
 * `ON DUPLICATE KEY UPDATE`: that also fires on other UNIQUE keys (e.g.
 * products.slug) and would silently overwrite a different row.
 */
export async function upsert(table: string, pk: string, row: Record<string, any>) {
  const values = toRow(row);
  const matched = await execute(`UPDATE ${table} SET ? WHERE ${pk} = ?`, [values, row[pk]]);
  if (matched === 0) await execute(`INSERT INTO ${table} SET ?`, [values]);
}
