/**
 * Client-side Image Compression Protocol
 * Resizes images to max dimensions and converts to compressed WebP/JPEG format.
 * Reduces 10MB photos to ~80-150KB without visual quality loss.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ compressedBase64: string; sizeKB: number }> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Fill white background for transparent PNGs converting to JPEG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG if browser doesn't support WebP export
        let outputType = mimeType;
        let compressedBase64 = canvas.toDataURL(outputType, quality);

        if (!compressedBase64.startsWith(`data:${outputType}`)) {
          outputType = 'image/jpeg';
          compressedBase64 = canvas.toDataURL(outputType, quality);
        }

        // Calculate size in KB
        const head = `data:${outputType};base64,`;
        const base64Length = compressedBase64.length - head.length;
        const sizeBytes = Math.round((base64Length * 3) / 4);
        const sizeKB = Math.round(sizeBytes / 1024);

        resolve({ compressedBase64, sizeKB });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
