import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restore() {
  const file = path.resolve('./supabase_backup_complete.json');
  if (!fs.existsSync(file)) {
    console.error('Backup file not found:', file);
    return;
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('Restoring from backup dated:', data.backup_metadata.timestamp);

  // 1. Restore Categories
  console.log(`Restoring ${data.categories.length} categories...`);
  for (const c of data.categories) {
    await supabase.from('categories').upsert(c, { onConflict: 'slug' });
  }

  // 2. Restore Products
  console.log(`Restoring ${data.products.length} products...`);
  const chunkSize = 100;
  for (let i = 0; i < data.products.length; i += chunkSize) {
    const chunk = data.products.slice(i, i + chunkSize);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error on batch:', error);
    else console.log(`Restored ${Math.min(i + chunkSize, data.products.length)} / ${data.products.length} products`);
  }

  console.log('Restore complete!');
}

restore();
