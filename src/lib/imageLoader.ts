import { formatImageUrl } from '@/utils/driveUrl';

// next/image loader (next.config.js images.loaderFile). Google Drive's
// thumbnail endpoint resizes and converts to WebP on its own, so next/image
// can build a real srcset from it and each device downloads only the width
// it needs. Nothing is resized on our server. Other URLs pass through as-is.
export default function imageLoader({ src, width }: { src: string; width: number }) {
  return src.includes('drive.google.com') ? formatImageUrl(src, width) : src;
}
