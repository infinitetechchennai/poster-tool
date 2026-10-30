/**
 * Pollinations.ai Image Generation Service
 * Uses the official Pollinations.ai image generation endpoint
 */

export const POLLINATIONS_MODELS = [
  { id: 'flux', label: 'FLUX.1 Schnell (Recommended — High Quality & Accurate Details)' },
  { id: 'flux-realism', label: 'FLUX Realism (Maximum Photo Authenticity)' },
  { id: 'turbo', label: 'Z-Image Turbo (Fast Alibaba Model)' },
  { id: 'sana', label: 'DreamShaper / Sana (Distilled Lightweight LCM)' }
];

export const pollinationsService = {
  getApiKey() {
    const rawKey = (
      (typeof window !== 'undefined' ? localStorage.getItem('postcraft_pollinations_key') : '') ||
      (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_POLLINATIONS_API_KEY : '') ||
      ''
    ).trim();

    // If the key is the known zero-balance key or expired, ignore it to avoid HTTP 402
    if (rawKey.startsWith('sk_nG34') || rawKey === 'null' || rawKey === 'undefined') {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('postcraft_pollinations_key'); } catch (_) {}
      }
      return '';
    }
    return rawKey;
  },

  setApiKey(key) {
    if (typeof window !== 'undefined') {
      if (!key) {
        localStorage.removeItem('postcraft_pollinations_key');
      } else {
        localStorage.setItem('postcraft_pollinations_key', key.trim());
      }
    }
  },

  getPreferredModel() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('postcraft_pollinations_model') || 'flux';
    }
    return 'flux';
  },

  setPreferredModel(model) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('postcraft_pollinations_model', model || 'flux');
    }
  },

  getBaseUrl() {
    // In browser, route through Vite proxy (/api/pollinations) to strip Origin headers and avoid Cloudflare Turnstile blocks
    if (typeof window !== 'undefined') {
      return '/api/pollinations';
    }
    return 'https://image.pollinations.ai';
  },

  /**
   * Constructs the image generation URL for Pollinations.ai
   * Defaults to 800x1000 (4:5 portrait ratio) matching social card layouts
   */
  buildImageUrl(prompt, width = 800, height = 1000, model = '') {
    const cleanPrompt = (prompt || 'modern corporate professional visual illustration, clean studio lighting, no text').trim();
    const effectiveModel = model || this.getPreferredModel() || 'flux';

    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      nologo: 'true',
      nofeed: 'true'
    });

    if (effectiveModel) {
      params.append('model', effectiveModel);
    }

    // Add unique seed so each generation triggers a fresh AI image
    const seed = Math.floor(Math.random() * 1000000) + 1;
    params.append('seed', seed.toString());

    const apiKey = this.getApiKey();
    if (apiKey) {
      params.append('key', apiKey);
    }

    const base = this.getBaseUrl();
    return `${base}/prompt/${encodeURIComponent(cleanPrompt)}?${params.toString()}`;
  }
};
