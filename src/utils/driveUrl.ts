/**
 * Converts Google Drive, Dropbox, Imgur, and cloud storage sharing URLs into direct displayable image links.
 */
export function formatImageUrl(url: string): string {
  if (!url) return '';
  let trimmed = url.trim();

  // Strip wrapping quotes or whitespace if pasted with quotes
  trimmed = trimmed.replace(/^["']|["']$/g, '');

  // 1. Google Drive Links:
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w600`;
  }

  // e.g. https://drive.google.com/open?id=1A2B3C4D5E or uc?id=...
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1] && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w600`;
  }

  // 2. Dropbox Links (change ?dl=0 to ?raw=1 for direct image display)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[?&]dl=0/, '?raw=1');
  }

  // 3. Imgur Links without direct extension (e.g., https://imgur.com/abc -> https://i.imgur.com/abc.jpg)
  if (trimmed.match(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)) {
    const id = trimmed.split('/').pop();
    return `https://i.imgur.com/${id}.jpg`;
  }

  return trimmed;
}
