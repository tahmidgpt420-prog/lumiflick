# 🛡️ LUMIFLICK Database Master Backup & Instant Restore Guide

> **Backup Date:** August 20, 2026  
> **Source Database:** Supabase PostgreSQL (`pvqxufwberckolhavqle.supabase.co`)  
> **Total Categories:** 32 Categories  
> **Total Products:** 981 Products (100% Full Details: Sizes, Frame Variations, Gallery Images, Descriptions, Specs, Tags, Prices, Inventory)  
> **Total Banners:** Active Hero Slider Banners  
> **Total Reviews:** Verified Customer Reviews  

---

## 💬 What to Say to Antigravity in Any Future Chat

If you ever start a **new chat session** and want the AI to restore your entire catalog, simply copy and paste this exact prompt:

```text
Please restore my entire Lumiflick Supabase database from the backup file supabase_backup_complete.json using the script scripts/restore-from-backup.mjs.
```

Or simply say:

```text
Restore my database from supabase_backup_complete.json
```

The AI will immediately read `supabase_backup_complete.json` and execute the restore script to repopulate all 981 products and 32 categories into Supabase with zero data loss.

---

## ⚡ 3 Ways to Restore

### Method 1: Ask Antigravity (Easiest)
Just tell the agent:
> *"Restore my database from `supabase_backup_complete.json`"*

---

### Method 2: One-Line Terminal Command
Run this command in your project terminal:

```bash
node --env-file=.env.local scripts/restore-from-backup.mjs
```

---

### Method 3: Supabase SQL Editor (Manual 1-Click)
1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Go to **SQL Editor** -> **New Query**.
3. Copy all text from the file **`supabase_backup_complete.sql`**.
4. Paste it into the editor and click **Run**.

---

## 📁 Backup Files on Your Machine

| File | Size | Purpose |
|---|---|---|
| **`supabase_backup_complete.json`** | ~2.50 MB | Complete JSON snapshot of all 981 products, 32 categories, banners, and reviews. |
| **`supabase_backup_complete.sql`** | ~2.56 MB | Raw SQL `INSERT ... ON CONFLICT DO UPDATE` queries ready for Supabase SQL Editor. |
| **`scripts/restore-from-backup.mjs`** | ~1.3 KB | Automated node restore script that uploads all products in safe 100-item chunks. |
| **`scripts/export-full-backup.mjs`** | ~2.0 KB | Script to generate fresh new backups at any time. |

---

## 🔄 How to Create a New Backup in the Future

Whenever you add more products or categories and want to create a brand new backup, just run:

```bash
node --env-file=.env.local scripts/export-full-backup.mjs
node scripts/export-sql-dump.mjs
```
