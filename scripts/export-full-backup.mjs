import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Every table in supabase/schema.sql. Order doesn't matter for export.
const TABLES = ['categories', 'products', 'banners', 'reviews', 'settings', 'orders', 'raw_photos'];

async function fetchAll(table) {
  const rows = [];
  const batchSize = 1000;
  for (let from = 0; ; from += batchSize) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + batchSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < batchSize) return rows;
  }
}

async function fullBackup() {
  const backupData = {
    backup_metadata: {
      timestamp: new Date().toISOString(),
      source_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };

  for (const table of TABLES) {
    try {
      backupData[table] = await fetchAll(table);
    } catch (err) {
      // raw_photos was dropped from the app; the table may no longer exist
      if (err.code === '42P01' || err.code === 'PGRST205') {
        console.log(`Skipped ${table} (table not found)`);
        continue;
      }
      throw err;
    }
    backupData.backup_metadata[`${table}_count`] = backupData[table].length;
    console.log(`Fetched ${backupData[table].length} ${table}`);
  }

  const jsonPath = path.resolve('./supabase_backup_complete.json');
  fs.writeFileSync(jsonPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`JSON Backup saved: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

fullBackup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
