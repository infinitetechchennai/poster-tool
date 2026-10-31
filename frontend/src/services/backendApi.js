/**
 * InfiniteTech AI - Backend API Integration Service
 * Connects the React 19 Frontend with the Python FastAPI Backend on port 8000
 */

export const backendApi = {
  /**
   * Fetch top keyword clusters from PostgreSQL database
   */
  async getClusters() {
    try {
      const res = await fetch('/api/clusters');
      if (!res.ok) throw new Error(`Failed to fetch clusters: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend clusters unavailable:', err);
      return { clusters: [] };
    }
  },

  /**
   * Search and filter commercial keywords from PostgreSQL
   */
  async getKeywords(cluster = '', search = '', limit = 50) {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (cluster) params.append('cluster', cluster);
      if (search) params.append('search', search);

      const res = await fetch(`/api/keywords?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch keywords: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend keywords unavailable:', err);
      return { total: 0, keywords: [] };
    }
  },

  /**
   * Retrieve expanded search intents for a keyword
   */
  async getKeywordIntents(keywordId) {
    try {
      const res = await fetch(`/api/keywords/${keywordId}/intents`);
      if (!res.ok) throw new Error(`Failed to fetch intents: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend keyword intents unavailable:', err);
      return { intents: [] };
    }
  },

  /**
   * Triggers deterministic high-res Chrome Headless rendering on the backend
   */
  async renderPosterWithHeadlessChrome(posterPayload) {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posterPayload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Backend rendering failed');
    }
    return await res.json();
  }
};
