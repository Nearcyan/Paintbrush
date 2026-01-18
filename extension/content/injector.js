// Paintbrush Injector
// Reliable CSS injection with persistence

const Injector = {
  STYLE_ID: 'paintbrush-theme',
  _observer: null,
  _currentCSS: null,

  /**
   * Inject CSS into the page
   */
  inject(css) {
    this._currentCSS = css;

    // Remove existing style if present
    this.remove();

    // Create new style element
    const style = document.createElement('style');
    style.id = this.STYLE_ID;
    style.setAttribute('data-paintbrush', 'true');
    style.textContent = css;

    // Inject at the very end of head for maximum specificity
    if (document.head) {
      document.head.appendChild(style);
    } else {
      // Head not ready yet, wait for it
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
    }

    // Start observing for removal/tampering
    this._startObserver();

    console.log('[Paintbrush] Injected CSS');
  },

  /**
   * Remove injected CSS
   */
  remove() {
    const existing = document.getElementById(this.STYLE_ID);
    if (existing) {
      existing.remove();
    }
    this._stopObserver();
    this._currentCSS = null;
    console.log('[Paintbrush] Removed CSS');
  },

  /**
   * Check if CSS is currently injected
   */
  isInjected() {
    return !!document.getElementById(this.STYLE_ID);
  },

  /**
   * Get currently injected CSS
   */
  getCurrentCSS() {
    const style = document.getElementById(this.STYLE_ID);
    return style?.textContent || null;
  },

  /**
   * Update injected CSS (without removing observer)
   */
  update(css) {
    const style = document.getElementById(this.STYLE_ID);
    if (style) {
      this._currentCSS = css;
      style.textContent = css;
      console.log('[Paintbrush] Updated CSS');
    } else {
      this.inject(css);
    }
  },

  /**
   * Start observing for style removal
   * Some sites might try to remove unknown styles
   */
  _startObserver() {
    if (this._observer) return;

    this._observer = new MutationObserver((mutations) => {
      // Check if our style was removed
      if (!document.getElementById(this.STYLE_ID) && this._currentCSS) {
        console.log('[Paintbrush] Style was removed, re-injecting...');
        this.inject(this._currentCSS);
      }

      // Also check if our style was moved (some sites reorganize head)
      const style = document.getElementById(this.STYLE_ID);
      if (style && style.parentNode !== document.head) {
        document.head.appendChild(style);
      }
    });

    this._observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  },

  /**
   * Stop observing
   */
  _stopObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  },

  /**
   * Inject CSS as early as possible (for instant theme application)
   * Call this from content script with run_at: document_start
   */
  injectEarly(css) {
    // Create style immediately, even before head exists
    const style = document.createElement('style');
    style.id = this.STYLE_ID;
    style.setAttribute('data-paintbrush', 'true');
    style.textContent = css;

    this._currentCSS = css;

    // Try to inject immediately
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    }

    // Also ensure it's in head once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const existing = document.getElementById(this.STYLE_ID);
        if (existing && existing.parentNode !== document.head) {
          document.head.appendChild(existing);
        }
        this._startObserver();
      });
    } else {
      this._startObserver();
    }
  },

  /**
   * Add a smooth transition effect when applying theme
   */
  injectWithTransition(css, duration = 300) {
    // Add transition to all elements temporarily
    const transitionStyle = document.createElement('style');
    transitionStyle.id = 'paintbrush-transition';
    transitionStyle.textContent = `
      *, *::before, *::after {
        transition: background-color ${duration}ms ease,
                    color ${duration}ms ease,
                    border-color ${duration}ms ease,
                    box-shadow ${duration}ms ease !important;
      }
    `;
    document.head.appendChild(transitionStyle);

    // Inject the actual theme
    this.inject(css);

    // Remove transition style after animation completes
    setTimeout(() => {
      transitionStyle.remove();
    }, duration + 50);
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Injector;
}
