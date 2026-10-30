/**
 * Export and download services (PNG, JPEG, ZIP, CSV, Clipboard)
 */
import JSZip from 'jszip';

/**
 * Triggers a browser file download from a Blob or DataURL
 */
function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportService = {
  /**
   * Downloads a Canvas element directly as PNG or JPEG
   */
  downloadCanvas(canvas, filenameWithoutExt = 'postcraft-post', format = 'png', quality = 0.95) {
    if (!canvas) return false;
    try {
      const mimeType = format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpeg' || format === 'jpg' ? 'jpg' : 'png';
      const dataUrl = canvas.toDataURL(mimeType, quality);
      triggerDownload(dataUrl, `${filenameWithoutExt}.${ext}`);
      return true;
    } catch (e) {
      console.error('Download failed:', e);
      return false;
    }
  },

  /**
   * Bundles an array of generated posts and their canvases into a single ZIP file
   */
  async downloadZip(posts, zipFilename = 'postcraft-bulk-posts.zip') {
    if (!posts || posts.length === 0) return false;

    try {
      const zip = new JSZip();
      const folder = zip.folder("social-posts");

      for (let i = 0; i < posts.length; i++) {
        const item = posts[i];
        const safeTitle = (item.headline || item.topic || `post-${i + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 40)
          .replace(/^-|-$/g, '');

        // 1. Add image to ZIP
        if (item.dataUrl) {
          // Remove prefix like "data:image/png;base64,"
          const base64Data = item.dataUrl.split(',')[1];
          if (base64Data) {
            folder.file(`${i + 1}-${safeTitle}.png`, base64Data, { base64: true });
          }
        }

        // 2. Add text caption file
        if (item.caption) {
          folder.file(`${i + 1}-${safeTitle}-caption.txt`, item.caption);
        }
      }

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      triggerDownload(blobUrl, zipFilename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return true;
    } catch (e) {
      console.error('Failed to create ZIP:', e);
      return false;
    }
  },

  /**
   * Exports an array of posts to CSV
   */
  exportCsv(posts, filename = 'postcraft-posts.csv') {
    if (!posts || posts.length === 0) return false;

    try {
      const headers = ['Topic', 'Headline', 'Description', 'Key Points', 'CTA', 'Hashtags', 'Social Media Caption'];
      
      const escapeCsvCell = (str) => {
        if (!str) return '""';
        const stringified = String(str).replace(/"/g, '""');
        return `"${stringified}"`;
      };

      const rows = posts.map(p => {
        const keyPointsText = Array.isArray(p.keyPoints) ? p.keyPoints.join(' | ') : (p.keyPoints || '');
        const hashtagsText = Array.isArray(p.hashtags) ? p.hashtags.join(' ') : (p.hashtags || '');

        return [
          escapeCsvCell(p.topic),
          escapeCsvCell(p.headline),
          escapeCsvCell(p.description),
          escapeCsvCell(keyPointsText),
          escapeCsvCell(p.cta),
          escapeCsvCell(hashtagsText),
          escapeCsvCell(p.caption)
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, filename);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return true;
    } catch (e) {
      console.error('CSV export failed:', e);
      return false;
    }
  },

  /**
   * Copies Canvas image data directly to the user's system clipboard
   */
  async copyCanvasToClipboard(canvas) {
    if (!canvas || !navigator.clipboard || !window.ClipboardItem) return false;
    try {
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            resolve(true);
          } catch (err) {
            console.warn('Clipboard write image failed:', err);
            resolve(false);
          }
        }, 'image/png');
      });
    } catch (err) {
      return false;
    }
  },

  /**
   * Copies text string to clipboard
   */
  async copyTextToClipboard(text) {
    if (!text || !navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }
};
