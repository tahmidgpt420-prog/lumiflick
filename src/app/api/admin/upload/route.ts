import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// Allowlist by magic bytes, not by the client-supplied filename/MIME type —
// both of those are attacker-controlled and were previously trusted.
const SIGNATURES: { ext: string; mime: string; check: (buf: Buffer) => boolean }[] = [
  { ext: '.jpg', mime: 'image/jpeg', check: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: '.png', mime: 'image/png', check: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: '.gif', mime: 'image/gif', check: (b) => b.length > 6 && b.toString('ascii', 0, 6).match(/^GIF8[79]a$/) !== null },
  {
    ext: '.webp',
    mime: 'image/webp',
    check: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 8MB)' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const match = SIGNATURES.find((sig) => sig.check(buffer));
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Only JPG, PNG, GIF, and WEBP images are allowed.' },
        { status: 415 }
      );
    }

    const base64Data = `data:${match.mime};base64,${buffer.toString('base64')}`;

    // Attempt to write to public/uploads (works in local dev / persistent node servers)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Extension is derived from the sniffed content type, never from the
      // client-supplied filename — that's what made arbitrary-extension
      // uploads (e.g. .html, .svg) possible before.
      const filename = `${Date.now()}_${randomUUID().slice(0, 8)}${match.ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (fsErr) {
      // Expected on serverless hosts like Vercel (read-only filesystem).
      console.warn('Server filesystem is read-only; falling back to Base64 Data URL.');
      return NextResponse.json({ success: true, url: base64Data });
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
