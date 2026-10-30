/**
 * Local storage service for brand profile, saved posts, and app settings
 */

const STORAGE_KEYS = {
  BRAND: 'postcraft_brand_settings',
  POSTS: 'postcraft_saved_posts',
  SETTINGS: 'postcraft_app_settings'
};

export const DEFAULT_BRAND = {
  companyName: 'Infinitetech Ai',
  logoUrl: '/logo.png',
  websiteUrl: 'www.infinitetechai.com',
  primaryColor: '#00a2a2',
  secondaryColor: '#0f172a',
  defaultCta: 'Transform Your Business with Infinitetech Ai →',
  preferredFormat: 'linkedin-square',
  defaultStyle: 'hiring-white-clean'
};

export const DEFAULT_SETTINGS = {
  ollamaEnabled: false,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  pollinationsApiKey: '',
  pollinationsModel: 'flux'
};

export const storageService = {
  // Brand Profile
  getBrandSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRAND);
      if (data) {
        const parsed = JSON.parse(data);
        // Automatically ensure the uploaded logo and Infinitetech Ai brand are active
        if (!parsed.logoUrl || parsed.companyName === 'Acme Technologies' || parsed.companyName === 'Infinite Tech' || parsed.websiteUrl === 'www.infinitetech.ai') {
          parsed.logoUrl = '/logo.png';
          if (parsed.companyName === 'Acme Technologies' || parsed.companyName === 'Infinite Tech') {
            parsed.companyName = 'Infinitetech Ai';
            parsed.defaultCta = 'Transform Your Business with Infinitetech Ai →';
          }
          if (!parsed.websiteUrl || parsed.websiteUrl === 'www.infinitetech.ai') {
            parsed.websiteUrl = 'www.infinitetechai.com';
          }
          if (!parsed.primaryColor) {
            parsed.primaryColor = '#00a2a2';
          }
          if (!parsed.secondaryColor) {
            parsed.secondaryColor = '#0f172a';
          }
          localStorage.setItem(STORAGE_KEYS.BRAND, JSON.stringify(parsed));
        }
        return { ...DEFAULT_BRAND, ...parsed };
      }
      return DEFAULT_BRAND;
    } catch (e) {
      console.warn('Failed to load brand settings:', e);
      return DEFAULT_BRAND;
    }
  },

  saveBrandSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.BRAND, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save brand settings:', e);
      return false;
    }
  },

  // Saved Posts
  getSavedPosts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load saved posts:', e);
      return [];
    }
  },

  savePost(post) {
    try {
      const posts = this.getSavedPosts();
      const existingIndex = posts.findIndex(p => p.id === post.id);

      const postToSave = {
        ...post,
        id: post.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        posts[existingIndex] = postToSave;
      } else {
        posts.unshift(postToSave);
      }

      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return postToSave;
    } catch (e) {
      console.error('Failed to save post:', e);
      return null;
    }
  },

  deletePost(id) {
    try {
      const posts = this.getSavedPosts().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return true;
    } catch (e) {
      console.error('Failed to delete post:', e);
      return false;
    }
  },

  getPostById(id) {
    const posts = this.getSavedPosts();
    return posts.find(p => p.id === id) || null;
  },

  // App Settings (Ollama, etc)
  getAppSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveAppSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Export / Import
  exportAllData() {
    return {
      brand: this.getBrandSettings(),
      posts: this.getSavedPosts(),
      settings: this.getAppSettings(),
      exportDate: new Date().toISOString()
    };
  },

  importAllData(data) {
    try {
      if (data.brand) this.saveBrandSettings(data.brand);
      if (data.posts && Array.isArray(data.posts)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(data.posts));
      }
      if (data.settings) this.saveAppSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.BRAND);
      localStorage.removeItem(STORAGE_KEYS.POSTS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return true;
    } catch (e) {
      return false;
    }
  }
};
