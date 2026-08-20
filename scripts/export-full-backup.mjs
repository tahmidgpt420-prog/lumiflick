import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fullBackup() {
  console.log('Fetching full categories...');
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (catErr) {
    console.error('Categories error:', catErr);
    return;
  }

  console.log(`Fetched ${categories.length} categories.`);

  console.log('Fetching all full products in batches...');
  let allProducts = [];
  let from = 0;
  const batchSize = 500;

  while (true) {
    const { data: prods, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true })
      .range(from, from + batchSize - 1);

    if (prodErr) {
      console.error('Products error:', prodErr);
      return;
    }

    if (!prods || prods.length === 0) break;
    allProducts.push(...prods);
    console.log(`Fetched batch from ${from} to ${from + prods.length - 1} (Total: ${allProducts.length})`);
    if (prods.length < batchSize) break;
    from += batchSize;
  }

  console.log(`Total products fetched: ${allProducts.length}`);

  const { data: banners } = await supabase.from('banners').select('*');
  const { data: reviews } = await supabase.from('reviews').select('*');

  const backupData = {
    backup_metadata: {
      timestamp: new Date().toISOString(),
      source_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      categories_count: categories.length,
      products_count: allProducts.length,
      banners_count: banners ? banners.length : 0,
      reviews_count: reviews ? reviews.length : 0,
    },
    categories,
    products: allProducts,
    banners: banners || [],
    reviews: reviews || [],
  };

  // 1. Save JSON Backup to project root
  const jsonPath = path.resolve('./supabase_backup_complete.json');
  fs.writeFileSync(jsonPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`JSON Backup saved: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 2. Save JSON Backup to Brain Artifacts
  const artifactJsonPath =
    '/Users/DDB/.gemini/antigravity-ide/brain/921cb2e8-dfaf-4e80-9a19-091e017a29e3/supabase_backup_complete.json';
  fs.writeFileSync(artifactJsonPath, JSON.stringify(backupData, null, 2), 'utf8');

  // 3. Create Restore Script (scripts/restore-from-backup.mjs)
  const restoreScriptContent = `import { createClient } from '@supabase/supabase-js';
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
  console.log(\`Restoring \${data.categories.length} categories...\`);
  for (const c of data.categories) {
    await supabase.from('categories').upsert(c, { onConflict: 'slug' });
  }

  // 2. Restore Products
  console.log(\`Restoring \${data.products.length} products...\`);
  const chunkSize = 100;
  for (let i = 0; i < data.products.length; i += chunkSize) {
    const chunk = data.products.slice(i, i + chunkSize);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error on batch:', error);
    else console.log(\`Restored \${Math.min(i + chunkSize, data.products.length)} / \${data.products.length} products\`);
  }

  console.log('Restore complete!');
}

restore();
`;
  fs.writeFileSync(path.resolve('./scripts/restore-from-backup.mjs'), restoreScriptContent, 'utf8');
  console.log('Restore script created at ./scripts/restore-from-backup.mjs');
}

fullBackup();
