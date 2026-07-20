/**
 * Utility to convert various raw media links (especially Google Drive and Pexels)
 * into direct embed/streamable/image src links to prevent broken link errors.
 */
export function getDirectMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  let finalUrl = url.trim();

  // If pasted inside an iframe tag, extract the src URL
  if (finalUrl.includes('<iframe') && finalUrl.includes('src=')) {
    const srcMatch = finalUrl.match(/src="([^"]+)"/) || finalUrl.match(/src='([^']+)'/);
    if (srcMatch) {
      finalUrl = srcMatch[1];
    }
  }

  // Clean URL of all spaces, quotes, and newlines to handle accidental copy-paste issues
  const cleanUrl = finalUrl.replace(/[\s"']/g, '');

  let fileId = '';

  // 1. Direct raw Google Drive File ID: length 28 to 50, contains only valid ID characters, no dots, slashes, or special URL chars
  if (/^[a-zA-Z0-9_-]{28,50}$/.test(cleanUrl)) {
    fileId = cleanUrl;
  }

  // 2. Query parameter "id" inside a Google Drive URL
  if (!fileId) {
    const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]{28,50})/);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }
  }

  // 3. Any /d/ or d/ folder pattern followed by a valid Google Drive ID format
  if (!fileId) {
    const dPathMatch = cleanUrl.match(/(?:\/|^)d\/([a-zA-Z0-9_-]{25,50})/);
    if (dPathMatch && dPathMatch[1]) {
      fileId = dPathMatch[1];
    }
  }

  // 4. Fallback patterns for general drive/docs paths
  if (!fileId) {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
      /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
      /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }
  }

  if (fileId) {
    // For images/videos, lh3.googleusercontent.com is fast, has perfect CORS, and doesn't hit download limits
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Ensure absolute protocol for non-drive URLs if they are missing it
  if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('blob:')) {
    finalUrl = 'https://' + finalUrl;
  }

  // Robust Pexels URL Parser to get direct source download
  const pexelsMatch = finalUrl.match(/pexels\.com\/(?:[a-z]{2}-[a-z]{2}\/)?video\/(?:[a-zA-Z0-9_-]+-)?(\d+)/i) || 
                      finalUrl.match(/pexels\.com\/download\/video\/(\d+)/i);
  if (pexelsMatch) {
    return `https://www.pexels.com/download/video/${pexelsMatch[1]}/`;
  }

  return finalUrl;
}
