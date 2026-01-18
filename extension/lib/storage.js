// Paintbrush Storage
// Multi-theme support per hostname

const Storage = {
  /**
   * Generate a unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  /**
   * Generate a theme name from the prompt
   */
  _generateThemeName(prompt) {
    const words = prompt.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !['make', 'with', 'like', 'want', 'please', 'the', 'and', 'for', 'more', 'less'].includes(w))
      .slice(0, 3);

    if (words.length === 0) return 'Custom Theme';
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  },

  /**
   * Extract dominant colors from CSS for icon
   */
  _extractDominantColors(css) {
    const colorRegex = /#[0-9a-fA-F]{3,6}\b|rgba?\([^)]+\)/g;
    const matches = css.match(colorRegex) || [];

    const counts = {};
    matches.forEach(c => {
      const normalized = c.toLowerCase();
      counts[normalized] = (counts[normalized] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);
  },

  // ============================================
  // MULTI-THEME API
  // ============================================

  /**
   * Get all themes for a hostname
   */
  async getThemes(hostname) {
    const result = await chrome.storage.local.get(`themes:${hostname}`);
    return result[`themes:${hostname}`] || [];
  },

  /**
   * Get the active theme ID for a hostname
   */
  async getActiveThemeId(hostname) {
    const result = await chrome.storage.local.get(`activeTheme:${hostname}`);
    return result[`activeTheme:${hostname}`] || null;
  },

  /**
   * Get the active theme for a hostname (full object)
   */
  async getActiveTheme(hostname) {
    const themes = await this.getThemes(hostname);
    const activeId = await this.getActiveThemeId(hostname);

    if (!activeId) return null;
    return themes.find(t => t.id === activeId) || null;
  },

  /**
   * Set the active theme for a hostname
   */
  async setActiveTheme(hostname, themeId) {
    if (themeId) {
      await chrome.storage.local.set({ [`activeTheme:${hostname}`]: themeId });
      console.log(`[Paintbrush] Activated theme ${themeId} for ${hostname}`);
    } else {
      await chrome.storage.local.remove(`activeTheme:${hostname}`);
      console.log(`[Paintbrush] Disabled themes for ${hostname}`);
    }
  },

  /**
   * Create a new theme (doesn't activate it)
   */
  async createTheme(hostname, prompt, css, name = null) {
    const themes = await this.getThemes(hostname);

    const theme = {
      id: this._generateId(),
      hostname,
      name: name || this._generateThemeName(prompt),
      prompt,
      css,
      colors: this._extractDominantColors(css),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    themes.push(theme);
    await chrome.storage.local.set({ [`themes:${hostname}`]: themes });
    console.log(`[Paintbrush] Created theme "${theme.name}" for ${hostname}`);
    return theme;
  },

  /**
   * Create and activate a new theme
   */
  async createAndActivateTheme(hostname, prompt, css, name = null) {
    const theme = await this.createTheme(hostname, prompt, css, name);
    await this.setActiveTheme(hostname, theme.id);
    return theme;
  },

  /**
   * Update an existing theme
   */
  async updateTheme(hostname, themeId, updates) {
    const themes = await this.getThemes(hostname);
    const index = themes.findIndex(t => t.id === themeId);

    if (index === -1) return null;

    const theme = themes[index];

    // Store previous state for undo
    theme.previousCSS = theme.css;
    theme.previousPrompt = theme.prompt;
    theme.previousName = theme.name;

    // Apply updates
    if (updates.css) {
      theme.css = updates.css;
      theme.colors = this._extractDominantColors(updates.css);
    }
    if (updates.prompt) theme.prompt = updates.prompt;
    if (updates.name) theme.name = updates.name;
    theme.updatedAt = Date.now();

    themes[index] = theme;
    await chrome.storage.local.set({ [`themes:${hostname}`]: themes });
    console.log(`[Paintbrush] Updated theme "${theme.name}"`);
    return theme;
  },

  /**
   * Rename a theme
   */
  async renameTheme(hostname, themeId, newName) {
    return this.updateTheme(hostname, themeId, { name: newName });
  },

  /**
   * Revert a theme to previous version
   */
  async revertTheme(hostname, themeId) {
    const themes = await this.getThemes(hostname);
    const theme = themes.find(t => t.id === themeId);

    if (!theme?.previousCSS) {
      console.log('[Paintbrush] No previous version to revert to');
      return null;
    }

    // Record correction for learning
    await this.recordCorrection(hostname, theme.prompt, theme.previousPrompt);

    return this.updateTheme(hostname, themeId, {
      css: theme.previousCSS,
      prompt: theme.previousPrompt,
      name: theme.previousName,
    });
  },

  /**
   * Delete a theme
   */
  async deleteTheme(hostname, themeId) {
    const themes = await this.getThemes(hostname);
    const filtered = themes.filter(t => t.id !== themeId);

    await chrome.storage.local.set({ [`themes:${hostname}`]: filtered });

    // If deleted theme was active, clear active
    const activeId = await this.getActiveThemeId(hostname);
    if (activeId === themeId) {
      await this.setActiveTheme(hostname, null);
    }

    console.log(`[Paintbrush] Deleted theme ${themeId}`);
  },

  /**
   * Duplicate a theme
   */
  async duplicateTheme(hostname, themeId) {
    const themes = await this.getThemes(hostname);
    const original = themes.find(t => t.id === themeId);

    if (!original) return null;

    return this.createTheme(
      hostname,
      original.prompt,
      original.css,
      `${original.name} (copy)`
    );
  },

  // ============================================
  // LEGACY API (for backwards compatibility)
  // ============================================

  /**
   * Load theme for a hostname (returns active theme)
   * @deprecated Use getActiveTheme instead
   */
  async loadTheme(hostname) {
    return this.getActiveTheme(hostname);
  },

  /**
   * Save a theme (creates and activates)
   * @deprecated Use createAndActivateTheme instead
   */
  async saveTheme(hostname, prompt, css, name = null) {
    return this.createAndActivateTheme(hostname, prompt, css, name);
  },

  /**
   * Check if a theme exists for hostname
   */
  async hasTheme(hostname) {
    const active = await this.getActiveTheme(hostname);
    return !!active?.css;
  },

  // ============================================
  // CORRECTIONS (learning from undo)
  // ============================================

  async recordCorrection(hostname, rejectedPrompt, acceptedPrompt) {
    const corrections = await this.getCorrections();
    corrections.push({
      hostname,
      rejectedPrompt,
      acceptedPrompt,
      timestamp: Date.now(),
    });
    const trimmed = corrections.slice(-50);
    await chrome.storage.local.set({ 'paintbrush:corrections': trimmed });
  },

  async getCorrections() {
    const result = await chrome.storage.local.get('paintbrush:corrections');
    return result['paintbrush:corrections'] || [];
  },

  async getHostnameCorrections(hostname) {
    const all = await this.getCorrections();
    return all.filter(c => c.hostname === hostname);
  },

  // ============================================
  // GLOBAL OPERATIONS
  // ============================================

  /**
   * Get all themes across all sites
   */
  async getAllThemes() {
    const all = await chrome.storage.local.get(null);
    const themes = [];

    for (const [key, value] of Object.entries(all)) {
      if (key.startsWith('themes:') && Array.isArray(value)) {
        themes.push(...value);
      }
    }

    themes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return themes;
  },

  /**
   * Get all hostnames that have themes
   */
  async getAllHostnames() {
    const all = await chrome.storage.local.get(null);
    const hostnames = [];

    for (const key of Object.keys(all)) {
      if (key.startsWith('themes:')) {
        hostnames.push(key.replace('themes:', ''));
      }
    }

    return hostnames;
  },

  /**
   * Delete all themes for a hostname
   */
  async deleteAllThemesForHost(hostname) {
    await chrome.storage.local.remove([
      `themes:${hostname}`,
      `activeTheme:${hostname}`
    ]);
    console.log(`[Paintbrush] Deleted all themes for ${hostname}`);
  },

  // ============================================
  // SETTINGS
  // ============================================

  async saveSettings(settings) {
    await chrome.storage.local.set({ 'paintbrush:settings': settings });
  },

  async loadSettings() {
    const result = await chrome.storage.local.get('paintbrush:settings');
    return result['paintbrush:settings'] || { apiKey: null, autoApply: true };
  },

  // ============================================
  // KEYBINDS
  // ============================================

  async getKeybinds() {
    const result = await chrome.storage.local.get('paintbrush:keybinds');
    return result['paintbrush:keybinds'] || null; // null means use defaults
  },

  async setKeybinds(keybinds) {
    await chrome.storage.local.set({ 'paintbrush:keybinds': keybinds });
  },

  // ============================================
  // MIGRATION (from old single-theme format)
  // ============================================

  async migrateIfNeeded() {
    const all = await chrome.storage.local.get(null);
    let migrated = 0;

    for (const [key, value] of Object.entries(all)) {
      // Old format: theme:{hostname}
      if (key.startsWith('theme:') && !key.startsWith('themes:') && value.css) {
        const hostname = key.replace('theme:', '');

        // Convert to new format
        const theme = {
          id: this._generateId(),
          hostname,
          name: value.name || this._generateThemeName(value.prompt || ''),
          prompt: value.prompt || '',
          css: value.css,
          colors: value.colors || this._extractDominantColors(value.css),
          createdAt: value.createdAt || Date.now(),
          updatedAt: value.updatedAt || Date.now(),
        };

        // Save in new format
        await chrome.storage.local.set({ [`themes:${hostname}`]: [theme] });
        await this.setActiveTheme(hostname, theme.id);

        // Remove old key
        await chrome.storage.local.remove(key);

        migrated++;
        console.log(`[Paintbrush] Migrated theme for ${hostname}`);
      }
    }

    if (migrated > 0) {
      console.log(`[Paintbrush] Migration complete: ${migrated} themes migrated`);
    }
  },
};

// Run migration on load
Storage.migrateIfNeeded();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
