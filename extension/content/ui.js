// Paintbrush UI
// Inline interface for theme generation

const PaintbrushUI = {
  CONTAINER_ID: 'paintbrush-ui',
  _container: null,
  _callbacks: null,
  _timerInterval: null,
  _startTime: null,
  _pendingCSS: null, // CSS waiting for preview approval

  /**
   * Show the UI
   */
  show(options) {
    const { hostname, themes, activeTheme, existingTheme, onGenerate, onClear, onRevert, onClose, onApplyPreview, onCancelPreview, onSwitchTheme, onDisableThemes, onRenameTheme, onDeleteTheme } = options;
    this._callbacks = { onGenerate, onClear, onRevert, onClose, onApplyPreview, onCancelPreview, onSwitchTheme, onDisableThemes, onRenameTheme, onDeleteTheme };
    this._themes = themes || [];
    this._activeTheme = activeTheme;

    // Remove existing UI if present
    this.hide();

    // Create container with Shadow DOM for style isolation
    const host = document.createElement('div');
    host.id = this.CONTAINER_ID;

    // Attach shadow root - this isolates our styles from page CSS
    const shadow = host.attachShadow({ mode: 'open' });

    // Create inner container
    const inner = document.createElement('div');
    inner.className = 'pb-shadow-root';
    inner.innerHTML = this._getHTML(hostname, existingTheme);

    // Add styles to shadow DOM
    const style = document.createElement('style');
    style.textContent = this._getShadowStyles();
    shadow.appendChild(style);
    shadow.appendChild(inner);

    document.body.appendChild(host);
    this._container = inner;
    this._host = host;
    this._shadow = shadow;

    // Bind events
    this._bindEvents(existingTheme);

    // Focus input
    setTimeout(() => {
      shadow.querySelector('#pb-prompt')?.focus();
    }, 50);
  },

  /**
   * Hide the UI
   */
  hide() {
    this._stopTimer();

    // Clean up escape handler
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }

    if (this._host) {
      this._host.remove();
      this._host = null;
      this._shadow = null;
      this._container = null;
    }
    this._callbacks?.onClose?.();
  },

  /**
   * Public method to set status from outside
   */
  setStatus(message, type = 'loading') {
    this._showStatus(message, type);
  },

  /**
   * Start the elapsed timer
   */
  _startTimer() {
    this._startTime = Date.now();
    this._stopTimer(); // Clear any existing timer
    this._timerInterval = setInterval(() => {
      this._updateTimerDisplay();
    }, 100);
  },

  /**
   * Stop the elapsed timer
   */
  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  },

  /**
   * Update the timer display
   */
  _updateTimerDisplay() {
    const timerEl = this._shadow?.querySelector('#pb-timer');
    if (timerEl && this._startTime) {
      const elapsed = ((Date.now() - this._startTime) / 1000).toFixed(1);
      timerEl.textContent = `${elapsed}s`;
    }
  },

  /**
   * Show status message
   */
  _showStatus(message, type = 'loading') {
    const status = this._shadow?.querySelector('#pb-status');
    if (status) {
      // For loading states, include the timer
      if (type === 'loading') {
        status.innerHTML = `
          <span class="pb-status-text">${this._escapeHTML(message)}</span>
          <span id="pb-timer" class="pb-timer"></span>
        `;
      } else {
        status.innerHTML = `<span class="pb-status-text">${this._escapeHTML(message)}</span>`;
        this._stopTimer();
      }
      status.className = `pb-status pb-status--${type}`;
    }
  },

  /**
   * Get HTML template
   */
  _getHTML(hostname, existingTheme) {
    const hasTheme = !!existingTheme?.css;
    const canRevert = !!existingTheme?.previousCSS;
    const hasMultipleThemes = this._themes.length > 1;

    return `
      <div class="pb-panel">
        <div class="pb-header">
          <div class="pb-title">
            <div class="pb-icon"></div>
            <span>Paintbrush</span>
          </div>
          <div class="pb-header-actions">
            <button class="pb-settings-toggle" aria-label="Settings" title="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <circle cx="8" cy="6" r="2" fill="currentColor"></circle>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <circle cx="16" cy="12" r="2" fill="currentColor"></circle>
                <line x1="4" y1="18" x2="20" y2="18"></line>
                <circle cx="11" cy="18" r="2" fill="currentColor"></circle>
              </svg>
            </button>
            <button class="pb-close" aria-label="Close">&times;</button>
          </div>
        </div>

        <div class="pb-settings" id="pb-settings" style="display: none;">
          <div class="pb-settings-label">API Key</div>
          <div class="pb-api-key-row">
            <input type="password" id="pb-api-key" class="pb-api-key-input" placeholder="sk-ant-..." autocomplete="off">
            <button id="pb-api-key-toggle" class="pb-api-key-toggle" title="Show/hide">👁</button>
          </div>
          <div class="pb-api-key-hint">Get your key at <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a></div>

          <div class="pb-settings-label" style="margin-top: 12px;">Keybinds</div>
          <div class="pb-keybinds">
            <label class="pb-keybind-option">
              <input type="checkbox" data-keybind="ctrl+shift+p" checked>
              <span class="pb-keybind-label">${this._isMac() ? '⌘⇧P' : 'Ctrl+Shift+P'}</span>
            </label>
            <label class="pb-keybind-option">
              <input type="checkbox" data-keybind="alt+shift+p" checked>
              <span class="pb-keybind-label">${this._isMac() ? '⌥⇧P' : 'Alt+Shift+P'}</span>
            </label>
            <label class="pb-keybind-option">
              <input type="checkbox" data-keybind="ctrl+shift+y">
              <span class="pb-keybind-label">${this._isMac() ? '⌘⇧Y' : 'Ctrl+Shift+Y'}</span>
            </label>
          </div>
          <div class="pb-settings-label" style="margin-top: 10px;">Sound</div>
          <label class="pb-keybind-option">
            <input type="checkbox" id="pb-sound-toggle" checked>
            <span class="pb-keybind-label">Enable sound effects</span>
          </label>
        </div>

        <div class="pb-body">
          <div class="pb-site">
            <span class="pb-site-label">${hostname}</span>
            ${this._themes.length > 0 ? `<span class="pb-badge">${this._themes.length} theme${this._themes.length > 1 ? 's' : ''}</span>` : ''}
          </div>

          ${this._themes.length > 0 ? `
            <div class="pb-themes-list">
              ${this._themes.map(t => `
                <div class="pb-theme-item ${t.id === existingTheme?.id ? 'pb-theme-item--active' : ''}" data-theme-id="${t.id}">
                  <div class="pb-theme-icon" style="background: ${this._getThemeGradient(t.colors)}"></div>
                  <span class="pb-theme-name">${this._escapeHTML(t.name)}</span>
                  ${t.id === existingTheme?.id ? '<span class="pb-theme-active-dot"></span>' : ''}
                  <span class="pb-theme-actions">
                    <button class="pb-theme-action pb-rename" data-theme-id="${t.id}" title="Rename">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="pb-theme-action pb-delete" data-theme-id="${t.id}" title="Delete">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/></svg>
                    </button>
                  </span>
                </div>
              `).join('')}
              ${hasTheme ? `<div class="pb-theme-item pb-theme-item--disable" data-theme-id="">
                <span class="pb-theme-name">Disable</span>
              </div>` : ''}
            </div>
          ` : ''}

          ${hasTheme ? `
            <div class="pb-refine-hint">Editing "${this._escapeHTML(existingTheme.name)}"</div>
          ` : ''}

          <textarea
            id="pb-prompt"
            class="pb-input"
            placeholder="${hasTheme ? 'Make it darker, hide the sidebar, bigger fonts...' : 'Dark mode, minimal design, cozy warm colors...'}"
            rows="2"
          ></textarea>

          <div class="pb-actions">
            <button id="pb-generate" class="pb-btn pb-btn--primary">
              <svg class="pb-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
                <circle cx="6.5" cy="11.5" r="1.5"/>
                <circle cx="9.5" cy="7.5" r="1.5"/>
                <circle cx="14.5" cy="7.5" r="1.5"/>
                <circle cx="17.5" cy="11.5" r="1.5"/>
              </svg>
              ${hasTheme ? 'Update' : 'Paint'}
            </button>
            ${hasTheme ? `<button id="pb-new-theme" class="pb-btn pb-btn--secondary"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -2px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New</button>` : ''}
            ${canRevert ? `<button id="pb-revert" class="pb-btn pb-btn--secondary"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -2px;"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64L3 13"/></svg>Undo</button>` : ''}
          </div>

          <div id="pb-status" class="pb-status"></div>
        </div>

        <div class="pb-footer">
          <span class="pb-hint"><kbd>↵</kbd> generate</span><span class="pb-hint"><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
  },

  /**
   * Check if running on Mac
   */
  _isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  },

  /**
   * Load keybind settings and update checkboxes
   */
  async _loadKeybindSettings(shadow) {
    const keybinds = await Storage.getKeybinds();
    if (keybinds) {
      shadow.querySelectorAll('.pb-keybind-option input').forEach(input => {
        const id = input.dataset.keybind;
        input.checked = keybinds.includes(id);
      });
    }
  },

  /**
   * Save keybind settings from checkboxes
   */
  async _saveKeybindSettings(shadow) {
    const enabled = [];
    shadow.querySelectorAll('.pb-keybind-option input[data-keybind]:checked').forEach(input => {
      enabled.push(input.dataset.keybind);
    });
    await Storage.setKeybinds(enabled);
    // Update the global keybinds in index.js
    if (typeof enabledKeybinds !== 'undefined') {
      window.enabledKeybinds = enabled;
    }
  },

  /**
   * Load sound settings and update checkbox
   */
  async _loadSoundSettings(shadow) {
    const settings = await Storage.loadSettings();
    const enabled = settings.soundEnabled !== false; // Default to true
    shadow.querySelector('#pb-sound-toggle').checked = enabled;
    PaintbrushSounds.setEnabled(enabled);
  },

  /**
   * Save sound settings
   */
  async _saveSoundSettings(enabled) {
    const settings = await Storage.loadSettings();
    settings.soundEnabled = enabled;
    await Storage.saveSettings(settings);
    PaintbrushSounds.setEnabled(enabled);
  },

  /**
   * Load API key and update input
   */
  async _loadApiKey(shadow) {
    const settings = await Storage.loadSettings();
    const input = shadow.querySelector('#pb-api-key');
    if (input && settings.apiKey) {
      input.value = settings.apiKey;
    }
  },

  /**
   * Save API key
   */
  async _saveApiKey(apiKey) {
    const settings = await Storage.loadSettings();
    settings.apiKey = apiKey.trim();
    await Storage.saveSettings(settings);
  },

  /**
   * Get gradient style from theme colors
   */
  _getThemeGradient(colors) {
    if (!colors || colors.length === 0) return '#d4856a';
    if (colors.length === 1) return colors[0];
    return `linear-gradient(135deg, ${colors.join(', ')})`;
  },

  /**
   * Get CSS styles
   */
  /**
   * Get styles for Shadow DOM (no ID prefix needed - isolated)
   */
  _getShadowStyles() {
    // Paintbrush palette - warm, artistic, relaxing
    const colors = {
      primary: '#d4856a',
      primaryHover: '#c4755a',
      bg: '#1c1917',
      bgLight: '#292524',
      bgLighter: '#3d3835',
      border: '#44403c',
      text: '#e7e5e4',
      textMuted: '#a8a29e',
      textDim: '#78716c',
      success: '#86efac',
      error: '#fca5a5',
    };

    return `
      /* Shadow DOM root - completely isolated from page styles */
      :host {
        all: initial;
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .pb-shadow-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: ${colors.text};
        -webkit-font-smoothing: antialiased;
      }

      .pb-shadow-root * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .pb-panel {
        width: 320px;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 10px;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }

      .pb-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid ${colors.border};
      }

      .pb-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        font-size: 15px;
        color: ${colors.text};
      }

      .pb-icon {
        width: 20px;
        height: 20px;
        background: ${colors.primary};
        border-radius: 5px;
      }

      .pb-close {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: ${colors.textDim};
        font-size: 18px;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.2s ease;
      }

      .pb-close:hover {
        background: ${colors.bgLight};
        color: ${colors.text};
      }

      .pb-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .pb-settings-toggle {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: ${colors.textDim};
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.2s ease;
      }

      .pb-settings-toggle svg {
        width: 16px;
        height: 16px;
      }

      .pb-settings-toggle:hover {
        background: ${colors.bgLight};
        color: ${colors.text};
      }

      .pb-settings-toggle.active {
        color: ${colors.primary};
      }

      .pb-settings {
        padding: 12px 16px;
        background: ${colors.bgLight};
        border-bottom: 1px solid ${colors.border};
      }

      .pb-settings-label {
        font-size: 12px;
        font-weight: 500;
        color: ${colors.textMuted};
        margin-bottom: 8px;
      }

      .pb-api-key-row {
        display: flex;
        gap: 6px;
        margin-bottom: 4px;
      }

      .pb-api-key-input {
        flex: 1;
        padding: 6px 10px;
        font-size: 12px;
        font-family: monospace;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        color: ${colors.text};
        outline: none;
      }

      .pb-api-key-input:focus {
        border-color: ${colors.primary};
      }

      .pb-api-key-input::placeholder {
        color: ${colors.textMuted};
      }

      .pb-api-key-toggle {
        padding: 4px 8px;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .pb-api-key-toggle:hover {
        background: ${colors.bgLighter};
      }

      .pb-api-key-hint {
        font-size: 11px;
        color: ${colors.textMuted};
        margin-bottom: 8px;
      }

      .pb-api-key-hint a {
        color: ${colors.primary};
        text-decoration: none;
      }

      .pb-api-key-hint a:hover {
        text-decoration: underline;
      }

      .pb-keybinds {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .pb-keybind-option {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 4px 8px;
        background: ${colors.bg};
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .pb-keybind-option:hover {
        background: ${colors.bgLighter};
      }

      .pb-keybind-option input {
        accent-color: ${colors.primary};
        cursor: pointer;
      }

      .pb-keybind-label {
        font-size: 12px;
        color: ${colors.textMuted};
        font-family: monospace;
      }

      .pb-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pb-site {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pb-site-label {
        color: ${colors.textMuted};
        font-size: 13px;
      }

      .pb-badge {
        font-size: 10px;
        padding: 3px 8px;
        background: rgba(212, 133, 106, 0.15);
        color: ${colors.primary};
        border-radius: 4px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .pb-current {
        padding: 10px 12px;
        background: ${colors.bgLight};
        border-radius: 6px;
        font-size: 13px;
      }

      .pb-current-label {
        color: ${colors.textDim};
      }

      .pb-current-name {
        color: ${colors.text};
        font-weight: 500;
      }

      .pb-refine-hint {
        font-size: 12px;
        color: ${colors.textMuted};
        padding: 10px 12px;
        background: ${colors.bgLight};
        border-radius: 6px;
        line-height: 1.4;
      }

      .pb-themes-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .pb-theme-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: ${colors.bgLight};
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .pb-theme-item:hover {
        background: ${colors.bgLighter};
      }

      .pb-theme-item--active {
        border-color: ${colors.primary};
        background: rgba(212, 133, 106, 0.1);
      }

      .pb-theme-item--disable {
        opacity: 0.8;
        background: rgba(252, 165, 165, 0.1);
        border-color: rgba(252, 165, 165, 0.3);
      }

      .pb-theme-item--disable .pb-theme-name {
        color: ${colors.error};
      }

      .pb-theme-item--disable:hover {
        background: rgba(252, 165, 165, 0.15);
      }

      .pb-theme-icon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      .pb-theme-name {
        font-size: 12px;
        color: ${colors.text};
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pb-theme-active-dot {
        width: 6px;
        height: 6px;
        background: ${colors.primary};
        border-radius: 50%;
      }

      .pb-theme-actions {
        display: flex;
        margin-left: auto;
        gap: 2px;
      }

      .pb-theme-action {
        width: 18px;
        height: 18px;
        padding: 3px;
        background: transparent;
        border: none;
        border-radius: 3px;
        color: ${colors.textDim};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }

      .pb-theme-action:hover {
        background: ${colors.bgLighter};
        color: ${colors.text};
      }

      .pb-theme-action.pb-delete:hover {
        color: ${colors.error};
      }

      .pb-input {
        width: 100%;
        padding: 12px;
        background: ${colors.bgLight};
        border: 1px solid ${colors.border};
        border-radius: 6px;
        color: ${colors.text};
        font-family: inherit;
        font-size: 14px;
        resize: none;
        transition: border-color 0.2s ease;
      }

      .pb-input:focus {
        outline: none;
        border-color: ${colors.primary};
      }

      .pb-input::placeholder {
        color: ${colors.textDim};
      }

      .pb-actions {
        display: flex;
        gap: 8px;
      }

      .pb-btn {
        padding: 10px 14px;
        border: none;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pb-btn--primary {
        flex: 1;
        background: ${colors.primary};
        color: #1c1917;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .pb-btn--primary:hover {
        background: ${colors.primaryHover};
      }

      .pb-btn-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-right: 6px;
      }

      .pb-btn--primary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .pb-btn--secondary {
        background: ${colors.bgLighter};
        color: ${colors.textMuted};
      }

      .pb-btn--secondary:hover {
        background: ${colors.border};
        color: ${colors.text};
      }

      .pb-status {
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 13px;
        display: none;
      }

      .pb-status--loading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: ${colors.bgLight};
        color: ${colors.textMuted};
      }

      .pb-status-text {
        flex: 1;
      }

      .pb-timer {
        font-variant-numeric: tabular-nums;
        color: ${colors.primary};
        font-weight: 500;
        min-width: 45px;
        text-align: right;
      }

      .pb-status--loading .pb-status-text::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: ${colors.primary};
        border-radius: 50%;
        margin-right: 8px;
        animation: pb-pulse 1.2s ease-in-out infinite;
      }

      .pb-status--success {
        display: block;
        background: rgba(134, 239, 172, 0.1);
        color: ${colors.success};
      }

      .pb-status--error {
        display: block;
        background: rgba(252, 165, 165, 0.1);
        color: ${colors.error};
      }

      .pb-footer {
        padding: 8px 16px;
        border-top: 1px solid ${colors.border};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pb-hint {
        font-size: 11px;
        color: ${colors.textDim};
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .pb-hint kbd {
        display: inline-block;
        padding: 2px 5px;
        font-size: 10px;
        font-family: inherit;
        background: ${colors.bgLighter};
        border-radius: 3px;
        border: 1px solid ${colors.border};
        color: ${colors.textMuted};
      }

      @keyframes pb-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .pb-status--preview {
        display: block;
        background: ${colors.bgLight};
        padding: 12px;
      }

      .pb-preview-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 12px;
        color: ${colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .pb-preview-time {
        color: ${colors.primary};
        font-weight: 500;
      }

      .pb-colors {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
      }

      .pb-swatch {
        width: 28px;
        height: 28px;
        border-radius: 5px;
        border: 1px solid ${colors.border};
      }

      .pb-preview-actions {
        display: flex;
        gap: 8px;
      }

      .pb-preview-actions .pb-btn {
        flex: 1;
        padding: 10px 12px;
        font-size: 13px;
      }
    `;
  },

  /**
   * Legacy method - kept for reference but no longer used
   * @deprecated Use _getShadowStyles instead
   */
  _getStyles() {
    // Paintbrush palette - warm, artistic, relaxing
    const colors = {
      primary: '#d4856a',      // Warm terracotta/coral
      primaryHover: '#c4755a', // Slightly darker
      bg: '#1c1917',           // Warm dark brown
      bgLight: '#292524',      // Warm medium brown
      bgLighter: '#3d3835',    // Warm light brown
      border: '#44403c',       // Warm border
      text: '#e7e5e4',         // Warm white
      textMuted: '#a8a29e',    // Warm gray
      textDim: '#78716c',      // Dimmer warm gray
      success: '#86efac',      // Soft green
      error: '#fca5a5',        // Soft red
    };

    return `
      #${this.CONTAINER_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: ${colors.text};
        -webkit-font-smoothing: antialiased;
      }

      #${this.CONTAINER_ID} * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #${this.CONTAINER_ID} .pb-panel {
        width: 320px;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 10px;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }

      #${this.CONTAINER_ID} .pb-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid ${colors.border};
      }

      #${this.CONTAINER_ID} .pb-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        font-size: 15px;
        color: ${colors.text};
      }

      #${this.CONTAINER_ID} .pb-icon {
        width: 20px;
        height: 20px;
        background: ${colors.primary};
        border-radius: 5px;
      }

      #${this.CONTAINER_ID} .pb-close {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: ${colors.textDim};
        font-size: 18px;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.2s ease;
      }

      #${this.CONTAINER_ID} .pb-close:hover {
        background: ${colors.bgLight};
        color: ${colors.text};
      }

      #${this.CONTAINER_ID} .pb-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #${this.CONTAINER_ID} .pb-site {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #${this.CONTAINER_ID} .pb-site-label {
        color: ${colors.textMuted};
        font-size: 13px;
      }

      #${this.CONTAINER_ID} .pb-badge {
        font-size: 10px;
        padding: 3px 8px;
        background: rgba(212, 133, 106, 0.15);
        color: ${colors.primary};
        border-radius: 4px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      #${this.CONTAINER_ID} .pb-current {
        padding: 10px 12px;
        background: ${colors.bgLight};
        border-radius: 6px;
        font-size: 13px;
      }

      #${this.CONTAINER_ID} .pb-current-label {
        color: ${colors.textDim};
      }

      #${this.CONTAINER_ID} .pb-current-name {
        color: ${colors.text};
        font-weight: 500;
      }

      #${this.CONTAINER_ID} .pb-refine-hint {
        font-size: 12px;
        color: ${colors.textMuted};
        padding: 10px 12px;
        background: ${colors.bgLight};
        border-radius: 6px;
        line-height: 1.4;
      }

      #${this.CONTAINER_ID} .pb-themes-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      #${this.CONTAINER_ID} .pb-theme-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: ${colors.bgLight};
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      #${this.CONTAINER_ID} .pb-theme-item:hover {
        background: ${colors.bgLighter};
      }

      #${this.CONTAINER_ID} .pb-theme-item--active {
        border-color: ${colors.primary};
        background: rgba(212, 133, 106, 0.1);
      }

      #${this.CONTAINER_ID} .pb-theme-item--disable {
        opacity: 0.6;
      }

      #${this.CONTAINER_ID} .pb-theme-icon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      #${this.CONTAINER_ID} .pb-theme-name {
        font-size: 12px;
        color: ${colors.text};
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${this.CONTAINER_ID} .pb-theme-active-dot {
        width: 6px;
        height: 6px;
        background: ${colors.primary};
        border-radius: 50%;
      }

      #${this.CONTAINER_ID} .pb-input {
        width: 100%;
        padding: 12px;
        background: ${colors.bgLight};
        border: 1px solid ${colors.border};
        border-radius: 6px;
        color: ${colors.text};
        font-family: inherit;
        font-size: 14px;
        resize: none;
        transition: border-color 0.2s ease;
      }

      #${this.CONTAINER_ID} .pb-input:focus {
        outline: none;
        border-color: ${colors.primary};
      }

      #${this.CONTAINER_ID} .pb-input::placeholder {
        color: ${colors.textDim};
      }

      #${this.CONTAINER_ID} .pb-actions {
        display: flex;
        gap: 8px;
      }

      #${this.CONTAINER_ID} .pb-btn {
        padding: 10px 14px;
        border: none;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      #${this.CONTAINER_ID} .pb-btn--primary {
        flex: 1;
        background: ${colors.primary};
        color: #1c1917;
      }

      #${this.CONTAINER_ID} .pb-btn--primary:hover {
        background: ${colors.primaryHover};
      }

      #${this.CONTAINER_ID} .pb-btn--primary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      #${this.CONTAINER_ID} .pb-btn--secondary {
        background: ${colors.bgLighter};
        color: ${colors.textMuted};
      }

      #${this.CONTAINER_ID} .pb-btn--secondary:hover {
        background: ${colors.border};
        color: ${colors.text};
      }

      #${this.CONTAINER_ID} .pb-status {
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 13px;
        display: none;
      }

      #${this.CONTAINER_ID} .pb-status--loading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: ${colors.bgLight};
        color: ${colors.textMuted};
      }

      #${this.CONTAINER_ID} .pb-status-text {
        flex: 1;
      }

      #${this.CONTAINER_ID} .pb-timer {
        font-variant-numeric: tabular-nums;
        color: ${colors.primary};
        font-weight: 500;
        min-width: 45px;
        text-align: right;
      }

      #${this.CONTAINER_ID} .pb-status--loading .pb-status-text::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: ${colors.primary};
        border-radius: 50%;
        margin-right: 8px;
        animation: pb-pulse 1.2s ease-in-out infinite;
      }

      #${this.CONTAINER_ID} .pb-status--success {
        display: block;
        background: rgba(134, 239, 172, 0.1);
        color: ${colors.success};
      }

      #${this.CONTAINER_ID} .pb-status--error {
        display: block;
        background: rgba(252, 165, 165, 0.1);
        color: ${colors.error};
      }

      #${this.CONTAINER_ID} .pb-footer {
        padding: 8px 16px;
        border-top: 1px solid ${colors.border};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #${this.CONTAINER_ID} .pb-hint {
        font-size: 11px;
        color: ${colors.textDim};
        display: flex;
        align-items: center;
        gap: 4px;
      }

      #${this.CONTAINER_ID} .pb-hint kbd {
        display: inline-block;
        padding: 2px 5px;
        font-size: 10px;
        font-family: inherit;
        background: ${colors.bgLighter};
        border-radius: 3px;
        border: 1px solid ${colors.border};
        color: ${colors.textMuted};
      }

      @keyframes pb-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      #${this.CONTAINER_ID} .pb-status--preview {
        display: block;
        background: ${colors.bgLight};
        padding: 12px;
      }

      #${this.CONTAINER_ID} .pb-preview-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 12px;
        color: ${colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      #${this.CONTAINER_ID} .pb-preview-time {
        color: ${colors.primary};
        font-weight: 500;
      }

      #${this.CONTAINER_ID} .pb-colors {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
      }

      #${this.CONTAINER_ID} .pb-swatch {
        width: 28px;
        height: 28px;
        border-radius: 5px;
        border: 1px solid ${colors.border};
      }

      #${this.CONTAINER_ID} .pb-preview-actions {
        display: flex;
        gap: 8px;
      }

      #${this.CONTAINER_ID} .pb-preview-actions .pb-btn {
        flex: 1;
        padding: 10px 12px;
        font-size: 13px;
      }

      #${this.CONTAINER_ID} .pb-preview-actions .pb-btn--primary {
        background: ${colors.primary} !important;
        color: #1c1917 !important;
      }

      #${this.CONTAINER_ID} .pb-preview-actions .pb-btn--primary:hover {
        background: ${colors.primaryHover} !important;
      }

      #${this.CONTAINER_ID} .pb-preview-actions .pb-btn--secondary {
        background: ${colors.bgLighter} !important;
        color: ${colors.textMuted} !important;
      }

      #${this.CONTAINER_ID} .pb-preview-actions .pb-btn--secondary:hover {
        background: ${colors.border} !important;
        color: ${colors.text} !important;
      }
    `;
  },

  /**
   * Bind event handlers
   */
  _bindEvents(existingTheme) {
    const shadow = this._shadow;
    if (!shadow) return;

    // Stop events from bubbling out of the shadow DOM to the page
    // Use bubble phase (not capture) so our own handlers fire first
    const panel = shadow.querySelector('.pb-panel');
    const stopBubble = (e) => {
      e.stopPropagation();
    };
    panel?.addEventListener('click', stopBubble);
    panel?.addEventListener('mousedown', stopBubble);
    panel?.addEventListener('mouseup', stopBubble);
    panel?.addEventListener('pointerdown', stopBubble);
    panel?.addEventListener('pointerup', stopBubble);

    // Close button
    shadow.querySelector('.pb-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });

    // Settings toggle
    const settingsToggle = shadow.querySelector('.pb-settings-toggle');
    const settingsPanel = shadow.querySelector('#pb-settings');
    settingsToggle?.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
      settingsToggle.classList.toggle('active', !isVisible);
    });

    // Keybind checkboxes
    this._loadKeybindSettings(shadow);
    shadow.querySelectorAll('.pb-keybind-option input[data-keybind]').forEach(input => {
      input.addEventListener('change', () => {
        this._saveKeybindSettings(shadow);
      });
    });

    // Sound toggle
    this._loadSoundSettings(shadow);
    shadow.querySelector('#pb-sound-toggle')?.addEventListener('change', (e) => {
      this._saveSoundSettings(e.target.checked);
    });

    // API key input
    this._loadApiKey(shadow);
    const apiKeyInput = shadow.querySelector('#pb-api-key');
    apiKeyInput?.addEventListener('change', (e) => {
      this._saveApiKey(e.target.value);
    });
    apiKeyInput?.addEventListener('blur', (e) => {
      this._saveApiKey(e.target.value);
    });

    // API key visibility toggle
    const apiKeyToggle = shadow.querySelector('#pb-api-key-toggle');
    apiKeyToggle?.addEventListener('click', () => {
      if (apiKeyInput) {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        apiKeyToggle.textContent = isPassword ? '🙈' : '👁';
      }
    });

    // Escape to close - store handler reference to prevent double-binding
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
    }
    this._escHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
    };
    document.addEventListener('keydown', this._escHandler);

    // Generate button
    shadow.querySelector('#pb-generate')?.addEventListener('click', async () => {
      const prompt = shadow.querySelector('#pb-prompt')?.value.trim();
      if (!prompt) {
        this._showStatus('Please enter a description', 'error');
        return;
      }

      const btn = shadow.querySelector('#pb-generate');
      btn.disabled = true;
      this._startTimer();
      this._showStatus('Analyzing page...', 'loading');
      PaintbrushSounds.playStart();

      try {
        // Pass status callback so generateTheme can update progress
        const result = await this._callbacks.onGenerate(prompt, (stage) => {
          this._showStatus(stage, 'loading');
        });

        this._stopTimer();
        const elapsed = ((Date.now() - this._startTime) / 1000).toFixed(1);

        // Show preview with color swatches
        PaintbrushSounds.playSuccess();
        this._showPreview(result.css, elapsed);
      } catch (error) {
        this._stopTimer();
        this._showStatus(`Error: ${error.message}`, 'error');
        PaintbrushSounds.playCancel();
        btn.disabled = false;
      }
    });

    // New theme button - generates a completely new theme
    shadow.querySelector('#pb-new-theme')?.addEventListener('click', async () => {
      const prompt = shadow.querySelector('#pb-prompt')?.value.trim();
      if (!prompt) {
        this._showStatus('Please enter a description', 'error');
        return;
      }

      // Clear active theme so it creates new instead of updating
      this._activeTheme = null;
      this._pendingSaveAsNew = true;
      shadow.querySelector('#pb-generate')?.click();
    });

    // Theme switcher - switch theme but stay open for continued editing
    shadow.querySelectorAll('.pb-theme-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        // Ignore clicks on action buttons
        if (e.target.closest('.pb-theme-action')) return;

        e.preventDefault();
        const themeId = item.dataset.themeId;
        if (themeId === '') {
          // Disable all themes
          await this._callbacks.onDisableThemes?.();
          this._activeTheme = null;
          this._showStatus('Themes disabled', 'success');
          PaintbrushSounds.playApply();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        } else if (themeId !== this._activeTheme?.id) {
          await this._callbacks.onSwitchTheme?.(themeId);
          this._showStatus('Theme switched', 'success');
          PaintbrushSounds.playApply();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
        // If clicking active theme, do nothing
      });
    });

    // Theme rename buttons
    shadow.querySelectorAll('.pb-theme-action.pb-rename').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const themeId = btn.dataset.themeId;
        const theme = this._themes.find(t => t.id === themeId);
        if (!theme) return;

        const newName = prompt('Rename theme:', theme.name);
        if (newName && newName.trim() && newName.trim() !== theme.name) {
          await this._callbacks.onRenameTheme?.(themeId, newName.trim());
          this._showStatus('Theme renamed', 'success');
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
      });
    });

    // Theme delete buttons
    shadow.querySelectorAll('.pb-theme-action.pb-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const themeId = btn.dataset.themeId;
        const theme = this._themes.find(t => t.id === themeId);
        if (!theme) return;

        if (confirm(`Delete theme "${theme.name}"?`)) {
          await this._callbacks.onDeleteTheme?.(themeId);
          this._showStatus('Theme deleted', 'success');
          PaintbrushSounds.playCancel();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
      });
    });

    // Revert button
    shadow.querySelector('#pb-revert')?.addEventListener('click', async () => {
      const success = await this._callbacks.onRevert();
      if (success) {
        this._showStatus('Reverted to previous theme', 'success');
        setTimeout(() => this.hide(), 1000);
      } else {
        this._showStatus('No previous theme to revert to', 'error');
      }
    });

    // Textarea reference for other handlers
    const textarea = shadow.querySelector('#pb-prompt');

    // Enter to submit
    shadow.querySelector('#pb-prompt')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        shadow.querySelector('#pb-generate')?.click();
      }
    });
  },

  /**
   * Extract main colors from CSS
   */
  _extractColors(css) {
    const colorRegex = /#[0-9a-fA-F]{3,6}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/g;
    const matches = css.match(colorRegex) || [];

    // Deduplicate and get most common colors
    const colorCounts = {};
    matches.forEach(color => {
      const normalized = color.toLowerCase();
      colorCounts[normalized] = (colorCounts[normalized] || 0) + 1;
    });

    // Sort by frequency and take top 6
    return Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([color]) => color);
  },

  /**
   * Show preview with color swatches
   */
  _showPreview(css, elapsed) {
    this._pendingCSS = css;
    const colors = this._extractColors(css);
    const hasExisting = this._activeTheme && !this._pendingSaveAsNew;

    const checkIcon = `<svg class="pb-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const plusIcon = `<svg class="pb-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const xIcon = `<svg class="pb-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    const previewHTML = `
      <div class="pb-preview">
        <div class="pb-preview-header">
          <span>Preview</span>
          <span class="pb-preview-time">${elapsed}s</span>
        </div>
        <div class="pb-colors">
          ${colors.map(c => `<div class="pb-swatch" style="background:${c}" title="${c}"></div>`).join('')}
        </div>
        <div class="pb-preview-actions">
          <button id="pb-apply" class="pb-btn pb-btn--primary">${checkIcon}${hasExisting ? 'Apply Changes' : 'Save Theme'}</button>
          ${hasExisting ? `<button id="pb-save-new" class="pb-btn pb-btn--secondary">${plusIcon}Save as New</button>` : ''}
          <button id="pb-cancel-preview" class="pb-btn pb-btn--secondary">${xIcon}Cancel</button>
        </div>
      </div>
    `;

    const status = this._shadow?.querySelector('#pb-status');
    if (status) {
      status.innerHTML = previewHTML;
      status.className = 'pb-status pb-status--preview';

      // Bind preview buttons
      status.querySelector('#pb-apply')?.addEventListener('click', async () => {
        const saveAsNew = this._pendingSaveAsNew || false;
        await this._callbacks.onApplyPreview?.(this._pendingCSS, saveAsNew);
        this._pendingCSS = null;
        this._pendingSaveAsNew = false;
        this._showStatus('Saved!', 'success');
        PaintbrushSounds.playApply();
        // Reset UI for continued editing
        this._resetForContinuedEditing();
      });

      status.querySelector('#pb-save-new')?.addEventListener('click', async () => {
        await this._callbacks.onApplyPreview?.(this._pendingCSS, true);
        this._pendingCSS = null;
        this._pendingSaveAsNew = false;
        this._showStatus('New theme created!', 'success');
        PaintbrushSounds.playApply();
        // Reset UI and refresh theme list
        this._resetForContinuedEditing();
      });

      status.querySelector('#pb-cancel-preview')?.addEventListener('click', () => {
        this._callbacks.onCancelPreview?.();
        this._pendingCSS = null;
        this._pendingSaveAsNew = false;
        this._showStatus('Cancelled', 'error');
        PaintbrushSounds.playCancel();
        this._shadow.querySelector('#pb-generate').disabled = false;
      });
    }
  },

  /**
   * Reset UI for continued editing after applying a theme
   */
  async _resetForContinuedEditing() {
    // Short delay to show the success message
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clear status
    const status = this._shadow?.querySelector('#pb-status');
    if (status) {
      status.innerHTML = '';
      status.className = 'pb-status';
    }

    // Re-enable generate button
    const btn = this._shadow?.querySelector('#pb-generate');
    if (btn) btn.disabled = false;

    // Clear the prompt for new input
    const prompt = this._shadow?.querySelector('#pb-prompt');
    if (prompt) {
      prompt.value = '';
      prompt.focus();
    }

    // Refresh theme list by reloading themes from storage
    await this._refreshThemeList();
  },

  /**
   * Refresh the theme list from storage
   */
  async _refreshThemeList() {
    const hostname = window.location.hostname;

    // Get fresh theme data
    const themes = await Storage.getThemes(hostname);
    const activeTheme = await Storage.getActiveTheme(hostname);

    this._themes = themes;
    this._activeTheme = activeTheme;

    // Update the themes list in the DOM
    const themesContainer = this._shadow?.querySelector('.pb-themes-list');
    if (themesContainer && themes.length > 0) {
      themesContainer.innerHTML = themes.map(t => `
        <div class="pb-theme-item ${t.id === activeTheme?.id ? 'pb-theme-item--active' : ''}" data-theme-id="${t.id}">
          <div class="pb-theme-icon" style="background: ${this._getThemeGradient(t.colors)}"></div>
          <span class="pb-theme-name">${this._escapeHTML(t.name)}</span>
          ${t.id === activeTheme?.id ? '<span class="pb-theme-active-dot"></span>' : ''}
          <span class="pb-theme-actions">
            <button class="pb-theme-action pb-rename" data-theme-id="${t.id}" title="Rename">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="pb-theme-action pb-delete" data-theme-id="${t.id}" title="Delete">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/></svg>
            </button>
          </span>
        </div>
      `).join('') + `
        <div class="pb-theme-item pb-theme-item--disable" data-theme-id="">
          <span class="pb-theme-name">Disable</span>
        </div>
      `;

      // Rebind click handlers for new theme items
      this._rebindThemeClicks();
    }

    // Update the refine hint
    const refineHint = this._shadow?.querySelector('.pb-refine-hint');
    if (refineHint && activeTheme) {
      refineHint.textContent = `Editing "${activeTheme.name}"`;
    }

    // Update the badge count
    const badge = this._shadow?.querySelector('.pb-badge');
    if (badge) {
      badge.textContent = `${themes.length} theme${themes.length > 1 ? 's' : ''}`;
    }

    // Update button text
    const genBtn = this._shadow?.querySelector('#pb-generate');
    if (genBtn) {
      const paletteIcon = `<svg class="pb-btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
        <circle cx="6.5" cy="11.5" r="1.5"/>
        <circle cx="9.5" cy="7.5" r="1.5"/>
        <circle cx="14.5" cy="7.5" r="1.5"/>
        <circle cx="17.5" cy="11.5" r="1.5"/>
      </svg>`;
      genBtn.innerHTML = paletteIcon + (activeTheme ? 'Update' : 'Paint');
    }
  },

  /**
   * Clear the status message
   */
  _clearStatus() {
    const status = this._shadow?.querySelector('#pb-status');
    if (status) {
      status.innerHTML = '';
      status.className = 'pb-status';
    }
  },

  /**
   * Rebind click handlers for theme items after refresh
   */
  _rebindThemeClicks() {
    const shadow = this._shadow;
    if (!shadow) return;

    shadow.querySelectorAll('.pb-theme-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        // Ignore clicks on action buttons
        if (e.target.closest('.pb-theme-action')) return;

        e.preventDefault();
        const themeId = item.dataset.themeId;
        if (themeId === '') {
          await this._callbacks.onDisableThemes?.();
          this._activeTheme = null;
          this._showStatus('Themes disabled', 'success');
          PaintbrushSounds.playCancel();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        } else if (themeId !== this._activeTheme?.id) {
          await this._callbacks.onSwitchTheme?.(themeId);
          this._showStatus('Theme switched', 'success');
          PaintbrushSounds.playApply();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
      });
    });

    // Theme rename buttons
    shadow.querySelectorAll('.pb-theme-action.pb-rename').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const themeId = btn.dataset.themeId;
        const theme = this._themes.find(t => t.id === themeId);
        if (!theme) return;

        const newName = prompt('Rename theme:', theme.name);
        if (newName && newName.trim() && newName.trim() !== theme.name) {
          await this._callbacks.onRenameTheme?.(themeId, newName.trim());
          this._showStatus('Theme renamed', 'success');
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
      });
    });

    // Theme delete buttons
    shadow.querySelectorAll('.pb-theme-action.pb-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const themeId = btn.dataset.themeId;
        const theme = this._themes.find(t => t.id === themeId);
        if (!theme) return;

        if (confirm(`Delete theme "${theme.name}"?`)) {
          await this._callbacks.onDeleteTheme?.(themeId);
          this._showStatus('Theme deleted', 'success');
          PaintbrushSounds.playCancel();
          setTimeout(() => this._clearStatus(), 1500);
          this._refreshThemeList();
        }
      });
    });
  },

  /**
   * Escape HTML for safe display
   */
  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaintbrushUI;
}
