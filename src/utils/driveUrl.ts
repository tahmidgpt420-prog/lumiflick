/**
 * Converts Google Drive, Dropbox, and cloud storage sharing URLs into direct displayable image links.
 */
export function formatImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Google Drive Links:
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // e.g. https://drive.google.com/open?id=1A2B3C4D5E or uc?id=...
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1] && trimmed.includes('drive.google.com')) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // 2. Dropbox Links (change ?dl=0 to ?raw=1 for direct image display)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[?&]dl=0/, '?raw=1');
  }

  return trimmed;
}
