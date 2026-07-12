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

  // Ensure absolute protocol
  if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('blob:')) {
    finalUrl = 'https://' + finalUrl;
  }

  // Convert Google Drive view/sharing URL to direct raw image/video source stream URL
  let fileId = '';
  const driveMatch1 = finalUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveMatch2 = finalUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  const driveMatch3 = finalUrl.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  
  if (driveMatch1) {
    fileId = driveMatch1[1];
  } else if (driveMatch2) {
    fileId = driveMatch2[1];
  } else if (driveMatch3) {
    fileId = driveMatch3[1];
  }

  if (fileId) {
    // For images/videos, lh3.googleusercontent.com is fast, has perfect CORS, and doesn't hit download limits
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Robust Pexels URL Parser to get direct source download
  const pexelsMatch = finalUrl.match(/pexels\.com\/(?:[a-z]{2}-[a-z]{2}\/)?video\/(?:[a-zA-Z0-9_-]+-)?(\d+)/i) || 
                      finalUrl.match(/pexels\.com\/download\/video\/(\d+)/i);
  if (pexelsMatch) {
    return `https://www.pexels.com/download/video/${pexelsMatch[1]}/`;
  }

  return finalUrl;
}
