import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Primary key per table (supabase/schema.sql). Categories before products.
const TABLES = {
  categories: 'slug',
  products: 'id',
  banners: 'id',
  reviews: 'id',
  settings: 'id',
  orders: 'order_id',
  raw_photos: 'id',
};

async function restore() {
  const file = path.resolve('./supabase_backup_complete.json');
  if (!fs.existsSync(file)) {
    console.error('Backup file not found:', file);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('Restoring from backup dated:', data.backup_metadata.timestamp);

  const chunkSize = 100;
  for (const [table, key] of Object.entries(TABLES)) {
    const rows = data[table];
    if (!rows?.length) continue;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const { error } = await supabase.from(table).upsert(rows.slice(i, i + chunkSize), { onConflict: key });
      if (error) {
        console.error(`Error restoring ${table}:`, error);
        process.exit(1);
      }
    }
    console.log(`Restored ${rows.length} ${table}`);
  }

  console.log('Restore complete!');
}

restore();
