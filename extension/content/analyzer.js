// Paintbrush Analyzer
// Deep page analysis to provide maximum context for CSS generation

const Analyzer = {
  /**
   * Main analysis function - extracts everything useful about the page
   */
  async analyze() {
    const startTime = performance.now();

    const analysis = {
      // Basic info
      url: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      title: document.title,

      // Deep color extraction
      colors: this.analyzeColors(),

      // Selector mapping
      selectors: this.analyzeSelectors(),

      // Typography
      typography: this.analyzeTypography(),

      // CSS variables
      cssVariables: this.extractCSSVariables(),

      // Page structure
      structure: this.analyzeStructure(),

      // NEW: data-testid extraction (huge for React/modern sites)
      testIds: this.extractTestIds(),
      testIdsByType: this.extractTestIdsByType(),

      // NEW: aria-label extraction (accessibility attributes help targeting)
      ariaLabels: this.extractAriaLabels(),

      // NEW: DOM snapshot (simplified structure for LLM context)
      domSnapshot: this.generateDomSnapshot(),

      // NEW: Element context (interactive elements with parent/size info)
      elementContext: this.extractElementContext(),

      // NEW: Framework/library detection
      frameworks: this.detectFrameworks(),

      // NEW: Media query extraction
      mediaQueries: this.extractMediaQueries(),

      // NEW: Animation/transition detection
      animations: this.detectAnimations(),

      // NEW: Shadow DOM detection
      shadowDOM: this.detectShadowDOM(),

      // NEW: CSS-in-JS detection
      cssInJs: this.detectCSSInJS(),

      // NEW: Z-index layer map
      layers: this.extractLayers(),

      // NEW: Complete element coverage
      elementTypes: this.extractElementTypes(),
      elementCounts: this.countElements(),
      elementCategories: this.categorizeElements(),

      // NEW: SVG and icon detection
      icons: this.detectIcons(),

      // NEW: Enhanced form analysis
      forms: this.detectForms(),

      // NEW: Color harmony analysis
      colorAnalysis: this.analyzeColorHarmony(),

      // NEW: Pseudo-element detection
      pseudoElements: this.detectPseudoElements(),

      // NEW: Inherited style tracking
      styleInheritance: this.trackStyleInheritance(),

      // NEW: Spacing pattern detection
      spacing: this.detectSpacingPatterns(),

      // NEW: Typography scale detection
      typographyScale: this.detectTypographyScale(),

      // NEW: Border/shadow pattern detection
      borderShadow: this.detectBorderShadowPatterns(),

      // Timing
      analysisTime: Math.round(performance.now() - startTime),
    };

    console.log('[Paintbrush] Analysis complete in', analysis.analysisTime, 'ms');
    return analysis;
  },

  /**
   * Extract all colors used on the page
   */
  analyzeColors() {
    const colorMap = {
      backgrounds: new Map(),
      text: new Map(),
      borders: new Map(),
    };

    // Sample elements (limit for performance)
    const elements = document.querySelectorAll('body, body *');
    const maxElements = Math.min(elements.length, 500);

    for (let i = 0; i < maxElements; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);

        // Background colors
        const bg = style.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          colorMap.backgrounds.set(bg, (colorMap.backgrounds.get(bg) || 0) + 1);
        }

        // Text colors
        const color = style.color;
        if (color) {
          colorMap.text.set(color, (colorMap.text.get(color) || 0) + 1);
        }

        // Border colors
        const borderColor = style.borderColor;
        if (borderColor && borderColor !== 'transparent' && borderColor !== style.color) {
          colorMap.borders.set(borderColor, (colorMap.borders.get(borderColor) || 0) + 1);
        }
      } catch (e) {
        // Skip elements that can't be analyzed
      }
    }

    // Convert to sorted arrays (most used first)
    const sortByUsage = (map) => [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => this.normalizeColor(color));

    const backgrounds = sortByUsage(colorMap.backgrounds);
    const text = sortByUsage(colorMap.text);
    const borders = sortByUsage(colorMap.borders);

    return {
      backgrounds: backgrounds.slice(0, 10),
      text: text.slice(0, 10),
      borders: borders.slice(0, 5),
      dominant: [...new Set([...backgrounds.slice(0, 3), ...text.slice(0, 2)])],
      isDarkMode: this.detectDarkMode(),
    };
  },

  /**
   * Normalize color to hex format for consistency
   */
  normalizeColor(color) {
    if (color.startsWith('#')) return color;

    // Parse rgb/rgba
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match;
      return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }
    return color;
  },

  /**
   * Detect if site is currently in dark mode
   */
  detectDarkMode() {
    const bg = getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/\d+/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    return false;
  },

  /**
   * Find selectors that exist on this page
   */
  analyzeSelectors() {
    const selectors = {
      // Structural - find what actually exists
      header: this.findSelector([
        'header',
        '[role="banner"]',
        '#header',
        '.header',
        '#masthead',
        '.masthead',
        '#top-bar',
        '.top-bar',
      ]),
      nav: this.findSelector([
        'nav',
        '[role="navigation"]',
        '.nav',
        '.navbar',
        '.navigation',
        '#nav',
        '.menu',
        '.main-menu',
      ]),
      main: this.findSelector([
        'main',
        '[role="main"]',
        '#main',
        '.main',
        '#content',
        '.content',
        '#main-content',
        '.main-content',
      ]),
      sidebar: this.findSelector([
        'aside',
        '[role="complementary"]',
        '.sidebar',
        '#sidebar',
        '.side-panel',
        '.aside',
      ]),
      footer: this.findSelector([
        'footer',
        '[role="contentinfo"]',
        '#footer',
        '.footer',
        '#bottom',
        '.bottom',
      ]),
      article: this.findSelector([
        'article',
        '[role="article"]',
        '.article',
        '.post',
        '.entry',
        '.story',
      ]),

      // Interactive elements - find site-specific classes
      buttons: this.findAllSelectors([
        'button',
        '[role="button"]',
        'input[type="submit"]',
        'input[type="button"]',
        '.btn',
        '.button',
        '[class*="btn-"]',
        '[class*="button-"]',
      ]),
      links: 'a',
      inputs: this.findAllSelectors([
        'input:not([type="hidden"])',
        'textarea',
        'select',
        '.input',
        '.form-control',
        '[class*="input-"]',
      ]),
      cards: this.findAllSelectors([
        '.card',
        '[class*="card"]',
        '.tile',
        '.panel',
        '.box',
        '.item',
      ]),

      // Tables
      tables: document.querySelector('table') ? 'table, thead, tbody, tr, th, td' : null,

      // Site-specific classes (detected from page)
      custom: this.findSiteSpecificSelectors(),
    };

    return selectors;
  },

  /**
   * Find first matching selector
   */
  findSelector(candidates) {
    for (const sel of candidates) {
      try {
        if (document.querySelector(sel)) return sel;
      } catch (e) {
        // Invalid selector
      }
    }
    return null;
  },

  /**
   * Find all matching selectors that exist
   */
  findAllSelectors(candidates) {
    const found = [];
    for (const sel of candidates) {
      try {
        if (document.querySelector(sel)) found.push(sel);
      } catch (e) {
        // Invalid selector
      }
    }
    return found.length > 0 ? found.join(', ') : null;
  },

  /**
   * Detect site-specific class patterns
   */
  findSiteSpecificSelectors() {
    const custom = [];

    // Get all unique class names
    const allClasses = new Set();
    document.querySelectorAll('[class]').forEach(el => {
      el.classList.forEach(cls => allClasses.add(cls));
    });

    // Look for common patterns
    const patterns = [
      // Component patterns
      /^(post|article|story|item|card|entry|comment|thread|message)[-_]?/i,
      // Layout patterns
      /^(container|wrapper|content|main|page|layout)[-_]?/i,
      // Navigation patterns
      /^(nav|menu|header|footer|sidebar|toolbar)[-_]?/i,
      // Interactive patterns
      /^(btn|button|link|action|cta)[-_]?/i,
    ];

    allClasses.forEach(cls => {
      for (const pattern of patterns) {
        if (pattern.test(cls) && document.querySelectorAll('.' + CSS.escape(cls)).length > 1) {
          custom.push('.' + cls);
          break;
        }
      }
    });

    // Limit to most common ones
    return [...new Set(custom)].slice(0, 20);
  },

  /**
   * Analyze typography
   */
  analyzeTypography() {
    const bodyStyle = getComputedStyle(document.body);

    const fonts = new Set();
    const elements = document.querySelectorAll('body, h1, h2, h3, p, a, button');
    elements.forEach(el => {
      try {
        const font = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');
        if (font) fonts.add(font);
      } catch (e) {}
    });

    return {
      bodyFont: bodyStyle.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
      baseFontSize: bodyStyle.fontSize,
      fonts: [...fonts].slice(0, 5),
    };
  },

  /**
   * Extract CSS custom properties (variables)
   */
  extractCSSVariables() {
    const vars = {};
    const root = getComputedStyle(document.documentElement);

    // Common CSS variable patterns used by frameworks/sites
    const patterns = [
      // Colors
      '--background', '--bg', '--foreground', '--fg',
      '--primary', '--secondary', '--accent', '--muted',
      '--text', '--text-primary', '--text-secondary',
      '--border', '--border-color',
      // Specific frameworks
      '--color-bg', '--color-text', '--color-primary',
      '--theme-bg', '--theme-text', '--theme-primary',
      // Spacing/sizing (less important but sometimes useful)
      '--radius', '--border-radius',
    ];

    // Try each pattern
    patterns.forEach(v => {
      const value = root.getPropertyValue(v).trim();
      if (value) vars[v] = value;
    });

    // Also look for any variable that looks like a color
    const styleSheets = document.styleSheets;
    try {
      for (const sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              const text = rule.cssText;
              const varMatches = text.matchAll(/--([\w-]+):\s*([^;]+)/g);
              for (const match of varMatches) {
                const [, name, value] = match;
                if (this.looksLikeColor(value.trim())) {
                  vars['--' + name] = value.trim();
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
    } catch (e) {}

    return vars;
  },

  /**
   * Check if a value looks like a color
   */
  looksLikeColor(value) {
    return /^(#|rgb|hsl|var\(--)/i.test(value) ||
      /^(white|black|gray|grey|red|blue|green|transparent)/i.test(value);
  },

  /**
   * Analyze page structure
   */
  analyzeStructure() {
    const header = document.querySelector('header, [role="banner"], #header, .header');
    const headerStyle = header ? getComputedStyle(header) : null;

    return {
      hasFixedHeader: headerStyle?.position === 'fixed' || headerStyle?.position === 'sticky',
      hasSidebar: !!document.querySelector('aside, .sidebar, #sidebar'),
      hasCards: !!document.querySelector('.card, [class*="card"], article'),
      hasTables: !!document.querySelector('table'),
      hasModals: !!document.querySelector('.modal, [role="dialog"], .dialog, .popup'),
      hasForms: !!document.querySelector('form'),
      hasImages: document.querySelectorAll('img').length > 3,
      hasCode: !!document.querySelector('pre, code, .code, .highlight'),
    };
  },

  /**
   * Extract all unique data-testid values from the page
   */
  extractTestIds() {
    const testIds = new Set();
    document.querySelectorAll('[data-testid]').forEach(el => {
      testIds.add(el.getAttribute('data-testid'));
    });
    return [...testIds];
  },

  /**
   * Group data-testid values by element type
   */
  extractTestIdsByType() {
    const byType = {};
    document.querySelectorAll('[data-testid]').forEach(el => {
      const tagName = el.tagName.toLowerCase();
      const testId = el.getAttribute('data-testid');
      if (!byType[tagName]) byType[tagName] = [];
      if (!byType[tagName].includes(testId)) {
        byType[tagName].push(testId);
      }
    });
    return byType;
  },

  /**
   * Extract aria-label and aria-labelledby from interactive elements
   */
  extractAriaLabels() {
    const labels = [];
    const seen = new Set();

    // Elements with aria-label
    document.querySelectorAll('[aria-label]').forEach(el => {
      const label = el.getAttribute('aria-label');
      const key = `${el.tagName}-${label}`;
      if (!seen.has(key)) {
        seen.add(key);
        labels.push({
          label: label,
          element: el.tagName.toLowerCase(),
          selector: this.buildSelector(el),
        });
      }
    });

    // Elements with aria-labelledby
    document.querySelectorAll('[aria-labelledby]').forEach(el => {
      const labelledBy = el.getAttribute('aria-labelledby');
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) {
        const label = labelEl.textContent.trim();
        const key = `${el.tagName}-${label}`;
        if (!seen.has(key)) {
          seen.add(key);
          labels.push({
            label: label,
            element: el.tagName.toLowerCase(),
            selector: this.buildSelector(el),
            labelledBy: labelledBy,
          });
        }
      }
    });

    return labels;
  },

  /**
   * Build a useful CSS selector for an element
   */
  buildSelector(el) {
    // Prefer data-testid
    const testId = el.getAttribute('data-testid');
    if (testId) return `[data-testid="${testId}"]`;

    // Then id
    if (el.id) return `#${CSS.escape(el.id)}`;

    // Then aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

    // Then role + position
    const role = el.getAttribute('role');
    if (role) return `[role="${role}"]`;

    // Fallback to tag + class
    const tag = el.tagName.toLowerCase();
    const classes = [...el.classList].slice(0, 2).map(c => '.' + CSS.escape(c)).join('');
    return tag + classes;
  },

  /**
   * Generate a simplified DOM snapshot for LLM context
   * Includes structure, roles, and data-testid but omits text content
   */
  generateDomSnapshot(root = document.body, depth = 0, maxDepth = 6) {
    if (depth > maxDepth) return '';

    const lines = [];
    const indent = '  '.repeat(depth);

    const processElement = (el) => {
      if (el.nodeType !== Node.ELEMENT_NODE) return;

      // Skip script, style, svg internals, and hidden elements
      const tag = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'svg', 'path', 'g'].includes(tag)) return;

      // Build attribute string (only useful ones)
      const attrs = [];

      if (el.getAttribute('role')) {
        attrs.push(`role="${el.getAttribute('role')}"`);
      }
      if (el.getAttribute('data-testid')) {
        attrs.push(`data-testid="${el.getAttribute('data-testid')}"`);
      }
      if (el.getAttribute('aria-label')) {
        attrs.push(`aria-label="${el.getAttribute('aria-label')}"`);
      }
      if (el.id) {
        attrs.push(`id="${el.id}"`);
      }
      // Include meaningful classes (skip hashed ones)
      const meaningfulClasses = [...el.classList].filter(c =>
        !c.match(/^(css-|_|r-|sc-)[a-zA-Z0-9]/) && // Skip CSS-in-JS hashes
        c.length < 30 // Skip very long class names
      ).slice(0, 3);
      if (meaningfulClasses.length > 0) {
        attrs.push(`class="${meaningfulClasses.join(' ')}"`);
      }

      const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
      lines.push(`${indent}<${tag}${attrStr}>`);

      // Recurse to children
      if (depth < maxDepth) {
        for (const child of el.children) {
          processElement(child);
        }
      }
    };

    for (const child of root.children) {
      processElement(child);
    }

    // Limit total size
    const snapshot = lines.join('\n');
    if (snapshot.length > 4500) {
      return snapshot.slice(0, 4500) + '\n... (truncated)';
    }
    return snapshot;
  },

  /**
   * Extract context about interactive elements
   * Returns info about buttons, links, inputs with their parent context
   */
  extractElementContext() {
    const elements = [];
    const interactiveSelectors = 'button, [role="button"], a, input, select, textarea, [data-testid]';

    document.querySelectorAll(interactiveSelectors).forEach(el => {
      // Skip hidden elements
      if (el.offsetParent === null && el.tagName !== 'INPUT') return;

      const testId = el.getAttribute('data-testid');
      const ariaLabel = el.getAttribute('aria-label');
      const role = el.getAttribute('role');

      // Get parent context (role or testid of nearest meaningful parent)
      let parentContext = null;
      let parent = el.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        const parentRole = parent.getAttribute('role');
        const parentTestId = parent.getAttribute('data-testid');
        if (parentRole || parentTestId) {
          parentContext = parentRole || parentTestId;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }

      // Get bounding rect for size info
      const rect = el.getBoundingClientRect();

      elements.push({
        element: el.tagName.toLowerCase(),
        testId: testId || null,
        ariaLabel: ariaLabel || null,
        role: role || null,
        selector: this.buildSelector(el),
        parentContext: parentContext,
        size: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
    });

    // Limit to most useful elements (prioritize those with testId or ariaLabel)
    return elements
      .sort((a, b) => {
        const scoreA = (a.testId ? 2 : 0) + (a.ariaLabel ? 1 : 0);
        const scoreB = (b.testId ? 2 : 0) + (b.ariaLabel ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 100);
  },

  // ===========================================
  // FRAMEWORK/LIBRARY DETECTION
  // ===========================================

  /**
   * Detect CSS frameworks and JS libraries used on the page
   */
  detectFrameworks() {
    const frameworks = {
      tailwind: this.detectTailwind(),
      bootstrap: this.detectBootstrap(),
      react: this.detectReact(),
      vue: this.detectVue(),
      materialUI: this.detectMaterialUI(),
    };

    return frameworks;
  },

  detectTailwind() {
    // Tailwind uses utility classes like: flex, grid, p-4, m-2, bg-*, text-*, etc.
    const tailwindPatterns = [
      /^(flex|grid|block|inline|hidden)$/,
      /^(p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-\d+$/,
      /^(bg|text|border)-(gray|red|blue|green|yellow|purple|pink|indigo)-\d{2,3}$/,
      /^(w|h|min-w|min-h|max-w|max-h)-/,
      /^(rounded|shadow|opacity|z)-/,
      /^(sm|md|lg|xl|2xl):/,
      /^dark:/,
    ];

    const allClasses = this.getAllClasses();
    let matches = 0;
    const matchedSelectors = [];

    for (const cls of allClasses) {
      for (const pattern of tailwindPatterns) {
        if (pattern.test(cls)) {
          matches++;
          if (matchedSelectors.length < 10) matchedSelectors.push('.' + cls);
          break;
        }
      }
    }

    return {
      detected: matches >= 5,
      confidence: Math.min(matches / 10, 1),
      selectors: matchedSelectors,
    };
  },

  detectBootstrap() {
    // Bootstrap uses classes like: btn, btn-primary, container, row, col-*, navbar, etc.
    const bootstrapPatterns = [
      /^btn(-\w+)?$/,
      /^col(-\w+)?(-\d+)?$/,
      /^row$/,
      /^container(-fluid)?$/,
      /^navbar(-\w+)?$/,
      /^nav(-\w+)?$/,
      /^card(-\w+)?$/,
      /^modal(-\w+)?$/,
      /^alert(-\w+)?$/,
      /^form-\w+$/,
      /^d-(none|flex|block|inline)$/,
      /^(mt|mb|ms|me|mx|my|pt|pb|ps|pe|px|py)-\d$/,
    ];

    const allClasses = this.getAllClasses();
    let matches = 0;
    const matchedSelectors = [];

    for (const cls of allClasses) {
      for (const pattern of bootstrapPatterns) {
        if (pattern.test(cls)) {
          matches++;
          if (matchedSelectors.length < 10) matchedSelectors.push('.' + cls);
          break;
        }
      }
    }

    // Also check for Bootstrap's data attributes
    const hasDataBs = document.querySelector('[data-bs-toggle], [data-bs-target]') !== null;

    return {
      detected: matches >= 5 || hasDataBs,
      confidence: Math.min(matches / 10, 1),
      selectors: matchedSelectors,
    };
  },

  detectReact() {
    // React indicators: data-reactroot, __react*, id="root" with specific patterns
    const hasReactRoot = document.querySelector('[data-reactroot], [data-react-root]') !== null;
    const hasRootDiv = document.getElementById('root') !== null || document.getElementById('__next') !== null;
    const hasReactFiber = document.querySelector('[data-reactid]') !== null;

    // Check for React DevTools hook
    const hasReactDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';

    // Check for common React patterns in class names
    const allClasses = this.getAllClasses();
    const cssModulePatterns = [...allClasses].filter(cls =>
      /^[a-zA-Z]+_[a-zA-Z]+__[a-zA-Z0-9]+$/.test(cls) || // CSS modules
      /^css-[a-z0-9]+$/.test(cls) // emotion
    ).length;

    return {
      detected: hasReactRoot || hasReactFiber || hasReactDevTools || (hasRootDiv && cssModulePatterns > 3),
      confidence: (hasReactRoot ? 0.5 : 0) + (hasReactDevTools ? 0.3 : 0) + (cssModulePatterns > 3 ? 0.2 : 0),
      selectors: ['#root', '[data-reactroot]'].filter(s => document.querySelector(s)),
    };
  },

  detectVue() {
    // Vue indicators: data-v-*, __vue__, id="app"
    const hasVueAttrs = document.querySelector('[data-v-app], [data-v-]') !== null ||
      [...document.querySelectorAll('*')].some(el =>
        [...el.attributes].some(attr => attr.name.startsWith('data-v-'))
      );

    const hasVueRoot = document.getElementById('app') !== null && document.querySelector('[data-v-app]') !== null;

    // Check for Vue DevTools
    const hasVueDevTools = typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';

    // Check for Vuetify or other Vue UI libs
    const hasVuetify = document.querySelector('.v-application, .v-btn, .v-card') !== null;

    return {
      detected: hasVueAttrs || hasVueDevTools || hasVuetify,
      confidence: (hasVueAttrs ? 0.4 : 0) + (hasVueDevTools ? 0.3 : 0) + (hasVuetify ? 0.3 : 0),
      selectors: hasVuetify ? ['.v-application', '.v-btn', '.v-card'] : ['#app'],
    };
  },

  detectMaterialUI() {
    // MUI uses classes like: MuiButton-root, MuiTypography-*, MuiPaper-*, etc.
    const muiClasses = [...document.querySelectorAll('[class*="Mui"]')];
    const hasMui = muiClasses.length > 0;

    const selectors = [];
    if (hasMui) {
      const uniqueMuiClasses = new Set();
      muiClasses.forEach(el => {
        [...el.classList].filter(c => c.startsWith('Mui')).forEach(c => uniqueMuiClasses.add(c));
      });
      selectors.push(...[...uniqueMuiClasses].slice(0, 10).map(c => '.' + c));
    }

    return {
      detected: muiClasses.length >= 3,
      confidence: Math.min(muiClasses.length / 20, 1),
      selectors: selectors,
    };
  },

  getAllClasses() {
    const allClasses = new Set();
    document.querySelectorAll('[class]').forEach(el => {
      el.classList.forEach(cls => allClasses.add(cls));
    });
    return allClasses;
  },

  // ===========================================
  // MEDIA QUERY EXTRACTION
  // ===========================================

  /**
   * Extract media queries and breakpoints from stylesheets
   */
  extractMediaQueries() {
    const breakpoints = new Set();
    const features = {
      prefersColorScheme: false,
      prefersReducedMotion: false,
      prefersContrast: false,
    };

    try {
      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              const mediaText = rule.conditionText || rule.media?.mediaText || '';

              // Extract breakpoints
              const widthMatches = mediaText.match(/(?:min|max)-width:\s*(\d+)px/g);
              if (widthMatches) {
                widthMatches.forEach(m => {
                  const value = m.match(/(\d+)px/)[1];
                  breakpoints.add(value + 'px');
                });
              }

              // Check for feature queries
              if (mediaText.includes('prefers-color-scheme')) {
                features.prefersColorScheme = true;
              }
              if (mediaText.includes('prefers-reduced-motion')) {
                features.prefersReducedMotion = true;
              }
              if (mediaText.includes('prefers-contrast')) {
                features.prefersContrast = true;
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
    } catch (e) {
      // Error accessing stylesheets
    }

    return {
      breakpoints: [...breakpoints].sort((a, b) => parseInt(a) - parseInt(b)),
      features: features,
    };
  },

  // ===========================================
  // ANIMATION/TRANSITION DETECTION
  // ===========================================

  /**
   * Detect animations and transitions on the page
   */
  detectAnimations() {
    const keyframes = new Set();
    const animatedElements = [];
    let hasTransitions = false;

    // Extract keyframe names from stylesheets
    try {
      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              keyframes.add(rule.name);
            }
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      }
    } catch (e) {}

    // Find elements with animations or transitions
    const elements = document.querySelectorAll('*');
    const maxCheck = Math.min(elements.length, 300);

    for (let i = 0; i < maxCheck; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);

        // Check for animations
        const animation = style.animationName;
        if (animation && animation !== 'none') {
          animatedElements.push({
            selector: this.buildSelector(el),
            animation: animation,
          });
        }

        // Check for transitions
        const transition = style.transition;
        if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
          hasTransitions = true;
        }
      } catch (e) {}
    }

    return {
      keyframes: [...keyframes],
      animatedElements: animatedElements.slice(0, 20),
      hasTransitions: hasTransitions,
    };
  },

  // ===========================================
  // SHADOW DOM DETECTION
  // ===========================================

  /**
   * Detect shadow DOM usage on the page
   */
  detectShadowDOM() {
    let count = 0;
    const hosts = [];

    // Walk the DOM looking for shadow roots
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        count++;
        if (hosts.length < 10) {
          hosts.push(this.buildSelector(node));
        }
      }
    }

    return {
      detected: count > 0,
      count: count,
      hosts: hosts,
    };
  },

  // ===========================================
  // CSS-IN-JS DETECTION
  // ===========================================

  /**
   * Detect CSS-in-JS patterns (styled-components, emotion, etc.)
   */
  detectCSSInJS() {
    const allClasses = this.getAllClasses();
    const patterns = [];
    let hashedClassCount = 0;

    // Styled-components pattern: sc-* classes
    const scClasses = [...allClasses].filter(c => /^sc-[a-zA-Z]/.test(c));
    if (scClasses.length > 2) {
      patterns.push('styled-components');
      hashedClassCount += scClasses.length;
    }

    // Emotion pattern: css-* classes
    const emotionClasses = [...allClasses].filter(c => /^css-[a-z0-9]+$/i.test(c));
    if (emotionClasses.length > 2) {
      patterns.push('emotion');
      hashedClassCount += emotionClasses.length;
    }

    // CSS Modules pattern: component_class__hash
    const cssModuleClasses = [...allClasses].filter(c =>
      /^[a-zA-Z]+_[a-zA-Z]+__[a-zA-Z0-9-]+$/.test(c)
    );
    if (cssModuleClasses.length > 2) {
      patterns.push('css-modules');
      hashedClassCount += cssModuleClasses.length;
    }

    // Generic hashed classes (React Native Web, etc.): r-*, css-1*, etc.
    const genericHashed = [...allClasses].filter(c =>
      /^(r-[a-z0-9]+|css-\d+[a-z]+)$/i.test(c)
    );
    if (genericHashed.length > 5) {
      patterns.push('generic-hashed');
      hashedClassCount += genericHashed.length;
    }

    const detected = patterns.length > 0 || hashedClassCount > 10;

    return {
      detected: detected,
      patterns: patterns,
      hashedClassCount: hashedClassCount,
      recommendation: detected ? 'use-testid' : null,
    };
  },

  // ===========================================
  // Z-INDEX LAYER MAP
  // ===========================================

  /**
   * Extract z-index values and categorize layers
   */
  extractLayers() {
    const values = {};
    const categories = {};
    let max = 0;
    const stackingContexts = [];

    const elements = document.querySelectorAll('*');
    const maxCheck = Math.min(elements.length, 500);

    for (let i = 0; i < maxCheck; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);
        const zIndex = parseInt(style.zIndex);
        const position = style.position;

        if (!isNaN(zIndex) && zIndex !== 0 && position !== 'static') {
          const selector = this.buildSelector(el);
          values[selector] = zIndex;
          max = Math.max(max, zIndex);

          // Categorize by common layer purposes
          const className = el.className.toString().toLowerCase();
          const role = el.getAttribute('role');

          if (zIndex >= 1000 || role === 'dialog' || className.includes('modal')) {
            categories.modal = Math.max(categories.modal || 0, zIndex);
          } else if (zIndex >= 100 && zIndex < 500 || className.includes('dropdown')) {
            categories.dropdown = Math.max(categories.dropdown || 0, zIndex);
          } else if (zIndex >= 2000 || className.includes('tooltip')) {
            categories.tooltip = Math.max(categories.tooltip || 0, zIndex);
          } else if (zIndex >= 500 && zIndex < 1000 || className.includes('sticky') || className.includes('header')) {
            categories.sticky = Math.max(categories.sticky || 0, zIndex);
          } else if (zIndex >= 3000 || className.includes('toast') || className.includes('notification')) {
            categories.toast = Math.max(categories.toast || 0, zIndex);
          }

          // Track stacking contexts
          if (position !== 'static' || style.opacity !== '1' || style.transform !== 'none') {
            stackingContexts.push(selector);
          }
        }
      } catch (e) {}
    }

    return {
      values: values,
      categories: categories,
      max: max,
      stackingContexts: stackingContexts.slice(0, 20),
    };
  },

  // ===========================================
  // COMPLETE ELEMENT COVERAGE
  // ===========================================

  /**
   * Extract all unique element types present on the page
   */
  extractElementTypes() {
    const types = new Set();
    const elements = document.querySelectorAll('body *');

    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      // Skip script, style, and meta elements
      if (!['script', 'style', 'noscript', 'meta', 'link', 'br', 'wbr'].includes(tag)) {
        types.add(tag);
      }
    });

    return [...types].sort();
  },

  /**
   * Count occurrences of each element type
   */
  countElements() {
    const counts = {};
    const elements = document.querySelectorAll('body *');

    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (!['script', 'style', 'noscript', 'meta', 'link', 'br', 'wbr'].includes(tag)) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });

    return counts;
  },

  /**
   * Categorize elements by their purpose
   */
  categorizeElements() {
    const categories = {
      typography: [],
      semantic: [],
      media: [],
      interactive: [],
      forms: [],
      tables: [],
      lists: [],
      containers: [],
    };

    const typographyTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup', 'blockquote', 'q', 'cite', 'code', 'pre', 'kbd', 'samp', 'var', 'abbr', 'address', 'time'];
    const semanticTags = ['header', 'footer', 'main', 'nav', 'aside', 'article', 'section', 'figure', 'figcaption', 'details', 'summary', 'dialog'];
    const mediaTags = ['img', 'picture', 'video', 'audio', 'source', 'track', 'canvas', 'svg', 'iframe', 'embed', 'object'];
    const interactiveTags = ['a', 'button', 'details', 'summary', 'dialog'];
    const formTags = ['form', 'input', 'textarea', 'select', 'option', 'optgroup', 'button', 'label', 'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter'];
    const tableTags = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'];
    const listTags = ['ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu'];
    const containerTags = ['div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'];

    const elementTypes = this.extractElementTypes();

    elementTypes.forEach(tag => {
      if (typographyTags.includes(tag)) categories.typography.push(tag);
      if (semanticTags.includes(tag)) categories.semantic.push(tag);
      if (mediaTags.includes(tag)) categories.media.push(tag);
      if (interactiveTags.includes(tag)) categories.interactive.push(tag);
      if (formTags.includes(tag)) categories.forms.push(tag);
      if (tableTags.includes(tag)) categories.tables.push(tag);
      if (listTags.includes(tag)) categories.lists.push(tag);
      if (containerTags.includes(tag)) categories.containers.push(tag);
    });

    return categories;
  },

  // ===========================================
  // SVG AND ICON DETECTION
  // ===========================================

  /**
   * Detect SVG icons and icon fonts used on the page
   */
  detectIcons() {
    const svgs = this.detectSVGs();
    const fonts = this.detectIconFonts();
    const recommendations = [];

    if (svgs.count > 0) {
      recommendations.push('Style SVGs with fill: currentColor to inherit text colors');
      if (svgs.hasSprite) {
        recommendations.push('SVG sprite detected - use symbol IDs for targeting');
      }
    }
    if (fonts.detected) {
      recommendations.push(`Icon font detected (${fonts.libraries.join(', ')}) - style via color property`);
    }

    return {
      svgs: svgs,
      fonts: fonts,
      recommendations: recommendations,
    };
  },

  detectSVGs() {
    const svgElements = document.querySelectorAll('svg');
    const sizes = new Map();
    let hasSprite = false;

    svgElements.forEach(svg => {
      // Check for sprite (hidden SVG with symbols)
      if (svg.querySelector('symbol')) {
        hasSprite = true;
      }

      // Get size
      const width = svg.getAttribute('width') || svg.getBoundingClientRect().width;
      const height = svg.getAttribute('height') || svg.getBoundingClientRect().height;
      if (width && height) {
        const sizeKey = `${Math.round(parseFloat(width))}x${Math.round(parseFloat(height))}`;
        sizes.set(sizeKey, (sizes.get(sizeKey) || 0) + 1);
      }
    });

    return {
      count: svgElements.length,
      sizes: [...sizes.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([size]) => size)
        .slice(0, 10),
      hasSprite: hasSprite,
    };
  },

  detectIconFonts() {
    const iconPatterns = [
      { pattern: /^fa[srbl]?\s|^fa-/, library: 'font-awesome' },
      { pattern: /^material-icons/, library: 'material-icons' },
      { pattern: /^glyphicon/, library: 'glyphicons' },
      { pattern: /^icon-|^icons-/, library: 'custom-icons' },
      { pattern: /^bi\s|^bi-/, library: 'bootstrap-icons' },
      { pattern: /^feather-|^fe-/, library: 'feather-icons' },
      { pattern: /^ion-|^ionicon/, library: 'ionicons' },
    ];

    const foundClasses = [];
    const libraries = new Set();

    document.querySelectorAll('i, span').forEach(el => {
      const className = el.className.toString();
      if (!className) return;

      for (const { pattern, library } of iconPatterns) {
        if (pattern.test(className)) {
          libraries.add(library);
          foundClasses.push(className.split(' ')[0]);
          break;
        }
      }
    });

    // Also check for elements with pseudo-content icons (common in icon fonts)
    const hasEmptyIconElements = document.querySelectorAll('i:empty, span:empty').length > 5;

    return {
      detected: libraries.size > 0 || hasEmptyIconElements,
      libraries: [...libraries],
      classes: [...new Set(foundClasses)].slice(0, 20),
    };
  },

  // ===========================================
  // ENHANCED FORM DETECTION
  // ===========================================

  /**
   * Comprehensive form element analysis
   */
  detectForms() {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input:not([type="hidden"])');
    const selects = document.querySelectorAll('select');
    const textareas = document.querySelectorAll('textarea');

    // Input types
    const inputTypes = new Set();
    inputs.forEach(input => {
      const type = input.getAttribute('type') || 'text';
      inputTypes.add(type);
    });

    // Form states
    const hasRequired = document.querySelector('[required]') !== null;
    const hasDisabled = document.querySelector('[disabled], fieldset[disabled]') !== null;
    const hasReadonly = document.querySelector('[readonly]') !== null;
    const hasPattern = document.querySelector('[pattern]') !== null;
    const hasPlaceholder = document.querySelector('[placeholder]') !== null;

    // Form structure
    const hasFieldsets = document.querySelector('fieldset') !== null;
    const hasLegends = document.querySelector('legend') !== null;
    const hasLabels = document.querySelector('label') !== null;

    // Select analysis
    const hasOptgroups = document.querySelector('optgroup') !== null;
    const hasMultiple = document.querySelector('select[multiple]') !== null;

    // Radio/checkbox groups
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    const radioGroups = new Set();
    radioInputs.forEach(radio => {
      const name = radio.getAttribute('name');
      if (name) radioGroups.add(name);
    });

    const checkboxCount = document.querySelectorAll('input[type="checkbox"]').length;

    // Datalist
    const hasDatalist = document.querySelector('datalist') !== null;

    // Build useful selectors for form styling
    const formSelectors = [];
    if (hasRequired) formSelectors.push('[required]', ':required');
    if (hasDisabled) formSelectors.push('[disabled]', ':disabled');
    if (hasReadonly) formSelectors.push('[readonly]', ':read-only');
    if (hasPlaceholder) formSelectors.push('::placeholder');
    inputTypes.forEach(type => {
      formSelectors.push(`input[type="${type}"]`);
    });
    if (hasFieldsets) formSelectors.push('fieldset', 'legend');
    if (selects.length > 0) formSelectors.push('select', 'option');
    if (textareas.length > 0) formSelectors.push('textarea');
    if (checkboxCount > 0) formSelectors.push('input[type="checkbox"]');
    if (radioGroups.size > 0) formSelectors.push('input[type="radio"]');

    return {
      count: forms.length,
      inputTypes: [...inputTypes].sort(),
      states: {
        hasRequired: hasRequired,
        hasDisabled: hasDisabled,
        hasReadonly: hasReadonly,
        hasPattern: hasPattern,
        hasPlaceholder: hasPlaceholder,
      },
      structure: {
        hasFieldsets: hasFieldsets,
        hasLegends: hasLegends,
        hasLabels: hasLabels,
      },
      selects: {
        count: selects.length,
        hasOptgroups: hasOptgroups,
        hasMultiple: hasMultiple,
      },
      groups: {
        radioGroups: radioGroups.size,
        checkboxCount: checkboxCount,
      },
      hasDatalist: hasDatalist,
      selectors: [...new Set(formSelectors)],
    };
  },

  // ===========================================
  // COLOR HARMONY ANALYSIS
  // ===========================================

  /**
   * Analyze color relationships and harmony
   */
  analyzeColorHarmony() {
    const colorData = this.collectColorData();
    const roles = this.identifyColorRoles(colorData);
    const semantic = this.identifySemanticColors(colorData);
    const palette = this.extractPalette(colorData);
    const dominant = this.findDominantColors(colorData);
    const contrast = this.checkContrastIssues(colorData);
    const scheme = this.identifyColorScheme(palette);

    return {
      roles: roles,
      semantic: semantic,
      palette: palette,
      dominant: dominant,
      contrast: contrast,
      scheme: scheme,
    };
  },

  collectColorData() {
    const data = {
      backgrounds: new Map(),
      text: new Map(),
      borders: new Map(),
      links: new Map(),
      buttons: new Map(),
      all: new Map(),
    };

    // Collect from various elements
    const elements = document.querySelectorAll('body, body *');
    const maxElements = Math.min(elements.length, 500);

    for (let i = 0; i < maxElements; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);
        const tag = el.tagName.toLowerCase();

        // Background
        const bg = this.normalizeColor(style.backgroundColor);
        if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
          data.backgrounds.set(bg, (data.backgrounds.get(bg) || 0) + 1);
          data.all.set(bg, (data.all.get(bg) || 0) + 1);
        }

        // Text
        const color = this.normalizeColor(style.color);
        if (color) {
          data.text.set(color, (data.text.get(color) || 0) + 1);
          data.all.set(color, (data.all.get(color) || 0) + 1);

          if (tag === 'a') {
            data.links.set(color, (data.links.get(color) || 0) + 1);
          }
          if (tag === 'button' || el.getAttribute('role') === 'button') {
            data.buttons.set(color, (data.buttons.get(color) || 0) + 1);
          }
        }

        // Border
        const borderColor = this.normalizeColor(style.borderColor);
        if (borderColor && borderColor !== 'transparent' && borderColor !== color) {
          data.borders.set(borderColor, (data.borders.get(borderColor) || 0) + 1);
          data.all.set(borderColor, (data.all.get(borderColor) || 0) + 1);
        }
      } catch (e) {}
    }

    return data;
  },

  identifyColorRoles(colorData) {
    // Most common background is likely the primary background
    const bgColors = [...colorData.backgrounds.entries()].sort((a, b) => b[1] - a[1]);
    const textColors = [...colorData.text.entries()].sort((a, b) => b[1] - a[1]);
    const linkColors = [...colorData.links.entries()].sort((a, b) => b[1] - a[1]);

    return {
      background: bgColors.slice(0, 3).map(([c]) => c),
      text: textColors.slice(0, 3).map(([c]) => c),
      primary: linkColors.length > 0 ? linkColors[0][0] : (bgColors.length > 1 ? bgColors[1][0] : null),
      accent: linkColors.length > 0 ? [linkColors[0][0]] : [],
    };
  },

  identifySemanticColors(colorData) {
    const semantic = {
      success: null,
      error: null,
      warning: null,
      info: null,
    };

    const allColors = [...colorData.all.keys()];

    // Look for semantic color patterns
    allColors.forEach(color => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return;

      const { r, g, b } = rgb;

      // Green = success
      if (g > r * 1.2 && g > b * 1.2 && g > 100) {
        if (!semantic.success) semantic.success = color;
      }
      // Red = error
      if (r > g * 1.5 && r > b * 1.5 && r > 150) {
        if (!semantic.error) semantic.error = color;
      }
      // Orange/Yellow = warning
      if (r > 180 && g > 100 && g < 200 && b < 100) {
        if (!semantic.warning) semantic.warning = color;
      }
      // Blue/Cyan = info
      if (b > r && b > g * 0.8 && b > 100) {
        if (!semantic.info) semantic.info = color;
      }
    });

    return semantic;
  },

  extractPalette(colorData) {
    // Get unique colors sorted by usage
    const allColors = [...colorData.all.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);

    // Filter to distinct colors (not too similar)
    const palette = [];
    for (const color of allColors) {
      if (palette.length >= 10) break;

      const isSimilar = palette.some(existing => this.colorSimilarity(existing, color) > 0.85);
      if (!isSimilar) {
        palette.push(color);
      }
    }

    return palette;
  },

  findDominantColors(colorData) {
    return [...colorData.all.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  },

  checkContrastIssues(colorData) {
    const issues = [];

    // Check text/background contrast for most common pairs
    const bgColors = [...colorData.backgrounds.entries()].slice(0, 3).map(([c]) => c);
    const textColors = [...colorData.text.entries()].slice(0, 3).map(([c]) => c);

    for (const bg of bgColors) {
      for (const text of textColors) {
        const ratio = this.calculateContrastRatio(bg, text);
        if (ratio < 4.5) {
          issues.push({
            background: bg,
            text: text,
            ratio: ratio.toFixed(2),
            level: ratio < 3 ? 'fail' : 'aa-small-fail',
          });
        }
      }
    }

    return {
      issues: issues.slice(0, 5),
      hasIssues: issues.length > 0,
    };
  },

  identifyColorScheme(palette) {
    if (palette.length < 2) return 'monochromatic';

    // Convert to HSL for analysis
    const hslColors = palette.map(c => this.hexToHsl(c)).filter(Boolean);
    if (hslColors.length < 2) return 'mixed';

    // Get hue differences
    const hues = hslColors.map(c => c.h);
    const hueDiffs = [];
    for (let i = 1; i < hues.length; i++) {
      const diff = Math.abs(hues[i] - hues[0]);
      hueDiffs.push(diff > 180 ? 360 - diff : diff);
    }

    const avgDiff = hueDiffs.reduce((a, b) => a + b, 0) / hueDiffs.length;

    // Classify scheme
    if (avgDiff < 30) return 'monochromatic';
    if (avgDiff > 150 && avgDiff < 210) return 'complementary';
    if (avgDiff < 60) return 'analogous';
    if (avgDiff > 100 && avgDiff < 140) return 'triadic';
    if (avgDiff > 140 && avgDiff < 160) return 'split-complementary';

    return 'mixed';
  },

  // Color utility functions
  hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return null;
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  },

  colorSimilarity(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    if (!rgb1 || !rgb2) return 0;

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    return 1 - (distance / 441.67); // 441.67 is max distance (white to black)
  },

  calculateContrastRatio(color1, color2) {
    const lum1 = this.relativeLuminance(color1);
    const lum2 = this.relativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  relativeLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const srgb = [rgb.r, rgb.g, rgb.b].map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  },

  // ===========================================
  // PSEUDO-ELEMENT DETECTION
  // ===========================================

  /**
   * Detect elements with ::before and ::after pseudo-elements
   */
  detectPseudoElements() {
    const before = [];
    const after = [];
    const selectors = new Set();
    let count = 0;
    let hasPlaceholders = false;

    const elements = document.querySelectorAll('*');
    const maxCheck = Math.min(elements.length, 500);

    for (let i = 0; i < maxCheck; i++) {
      const el = elements[i];
      try {
        // Check for ::before
        const beforeStyle = getComputedStyle(el, '::before');
        const beforeContent = beforeStyle.content;
        if (beforeContent && beforeContent !== 'none' && beforeContent !== 'normal' && beforeContent !== '""') {
          const selector = this.buildSelector(el);
          before.push({
            selector: selector,
            content: beforeContent.slice(0, 50), // Truncate long content
            display: beforeStyle.display,
          });
          selectors.add(selector + '::before');
          count++;
        }

        // Check for ::after
        const afterStyle = getComputedStyle(el, '::after');
        const afterContent = afterStyle.content;
        if (afterContent && afterContent !== 'none' && afterContent !== 'normal' && afterContent !== '""') {
          const selector = this.buildSelector(el);
          after.push({
            selector: selector,
            content: afterContent.slice(0, 50),
            display: afterStyle.display,
          });
          selectors.add(selector + '::after');
          count++;
        }

        // Check for placeholder inputs
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder) {
            hasPlaceholders = true;
          }
        }
      } catch (e) {}
    }

    return {
      before: before.slice(0, 30),
      after: after.slice(0, 30),
      selectors: [...selectors].slice(0, 50),
      hasPlaceholders: hasPlaceholders,
      count: count,
    };
  },

  // ===========================================
  // INHERITED STYLE TRACKING
  // ===========================================

  /**
   * Track which styles are inherited vs explicitly set
   */
  trackStyleInheritance() {
    const inherited = [];
    const explicit = [];
    const fontChain = [];
    const colorInheritance = [];
    let usesInherit = false;

    // Get root/body styles as baseline
    const bodyStyle = getComputedStyle(document.body);
    const rootStyles = {
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize,
      lineHeight: bodyStyle.lineHeight,
      color: this.normalizeColor(bodyStyle.color),
      backgroundColor: this.normalizeColor(bodyStyle.backgroundColor),
    };

    // Track font inheritance
    const fontElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, li');
    const fontMap = new Map();

    fontElements.forEach(el => {
      try {
        const style = getComputedStyle(el);
        const font = style.fontFamily;
        if (!fontMap.has(font)) {
          fontMap.set(font, { count: 0, elements: [] });
        }
        const entry = fontMap.get(font);
        entry.count++;
        if (entry.elements.length < 3) {
          entry.elements.push(el.tagName.toLowerCase());
        }
      } catch (e) {}
    });

    // Build font chain (ordered by usage)
    [...fontMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .forEach(([font, data]) => {
        fontChain.push({
          fontFamily: font.split(',')[0].trim().replace(/['"]/g, ''),
          count: data.count,
          usedBy: [...new Set(data.elements)],
        });
      });

    // Track color inheritance patterns
    const colorMap = new Map();
    const textElements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, li, td');
    const maxCheck = Math.min(textElements.length, 200);

    for (let i = 0; i < maxCheck; i++) {
      const el = textElements[i];
      try {
        const style = getComputedStyle(el);
        const color = this.normalizeColor(style.color);

        // Check if color matches parent (inherited)
        const parent = el.parentElement;
        if (parent) {
          const parentColor = this.normalizeColor(getComputedStyle(parent).color);
          if (color === parentColor) {
            if (!colorMap.has(color)) {
              colorMap.set(color, { inherited: 0, explicit: 0 });
            }
            colorMap.get(color).inherited++;
          } else {
            if (!colorMap.has(color)) {
              colorMap.set(color, { inherited: 0, explicit: 0 });
            }
            colorMap.get(color).explicit++;
          }
        }
      } catch (e) {}
    }

    // Build color inheritance info
    [...colorMap.entries()].forEach(([color, data]) => {
      if (data.inherited > data.explicit) {
        inherited.push({ color, times: data.inherited });
      } else {
        explicit.push({ color, times: data.explicit });
      }
      colorInheritance.push({
        color: color,
        inherited: data.inherited,
        explicit: data.explicit,
        ratio: data.inherited / (data.inherited + data.explicit),
      });
    });

    // Check for elements using 'inherit' keyword (via stylesheet inspection)
    try {
      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule.cssText && rule.cssText.includes('inherit')) {
              usesInherit = true;
              break;
            }
          }
          if (usesInherit) break;
        } catch (e) {}
      }
    } catch (e) {}

    return {
      inherited: inherited.slice(0, 10),
      explicit: explicit.slice(0, 10),
      fontChain: fontChain,
      colorInheritance: colorInheritance.slice(0, 10),
      usesInherit: usesInherit,
      rootStyles: rootStyles,
    };
  },

  // ===========================================
  // SPACING PATTERN DETECTION
  // ===========================================

  /**
   * Detect spacing patterns (padding, margin, gap)
   */
  detectSpacingPatterns() {
    const paddingValues = new Map();
    const marginValues = new Map();
    const gapValues = new Map();

    const elements = document.querySelectorAll('*');
    const maxCheck = Math.min(elements.length, 500);

    for (let i = 0; i < maxCheck; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);

        // Collect padding values
        const paddings = [
          style.paddingTop, style.paddingRight,
          style.paddingBottom, style.paddingLeft
        ];
        paddings.forEach(p => {
          if (p && p !== '0px') {
            const val = parseInt(p);
            if (!isNaN(val) && val > 0) {
              paddingValues.set(val, (paddingValues.get(val) || 0) + 1);
            }
          }
        });

        // Collect margin values
        const margins = [
          style.marginTop, style.marginRight,
          style.marginBottom, style.marginLeft
        ];
        margins.forEach(m => {
          if (m && m !== '0px' && m !== 'auto') {
            const val = parseInt(m);
            if (!isNaN(val) && val > 0) {
              marginValues.set(val, (marginValues.get(val) || 0) + 1);
            }
          }
        });

        // Collect gap values (flex/grid)
        const gap = style.gap || style.gridGap;
        if (gap && gap !== 'normal' && gap !== '0px') {
          const val = parseInt(gap);
          if (!isNaN(val) && val > 0) {
            gapValues.set(val, (gapValues.get(val) || 0) + 1);
          }
        }
      } catch (e) {}
    }

    // Sort by frequency
    const sortByFreq = (map) => [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val, count]) => ({ value: val, count }));

    const padding = sortByFreq(paddingValues).slice(0, 10);
    const margin = sortByFreq(marginValues).slice(0, 10);
    const gap = sortByFreq(gapValues).slice(0, 10);

    // Extract scale (unique values sorted)
    const allValues = new Set([
      ...paddingValues.keys(),
      ...marginValues.keys(),
      ...gapValues.keys()
    ]);
    const scale = [...allValues].sort((a, b) => a - b).slice(0, 15);

    // Most common values across all
    const allCounts = new Map();
    [paddingValues, marginValues, gapValues].forEach(map => {
      map.forEach((count, val) => {
        allCounts.set(val, (allCounts.get(val) || 0) + count);
      });
    });
    const common = [...allCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([val]) => val);

    return {
      padding: padding.map(p => p.value),
      margin: margin.map(m => m.value),
      gap: gap.map(g => g.value),
      scale: scale,
      common: common,
    };
  },

  // ===========================================
  // TYPOGRAPHY SCALE DETECTION
  // ===========================================

  /**
   * Detect typography scale and patterns
   */
  detectTypographyScale() {
    const headingSizes = {};
    const lineHeights = new Map();
    const fontWeights = new Map();
    const letterSpacings = new Map();

    // Get base font size
    const bodyStyle = getComputedStyle(document.body);
    const baseFontSize = parseInt(bodyStyle.fontSize) || 16;

    // Analyze headings
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      const el = document.querySelector(tag);
      if (el) {
        const style = getComputedStyle(el);
        headingSizes[tag] = {
          fontSize: parseInt(style.fontSize),
          lineHeight: style.lineHeight,
          fontWeight: style.fontWeight,
        };
      }
    });

    // Collect line heights, weights, letter-spacing from various elements
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, button');
    const maxCheck = Math.min(textElements.length, 300);

    for (let i = 0; i < maxCheck; i++) {
      const el = textElements[i];
      try {
        const style = getComputedStyle(el);

        // Line height
        const lh = style.lineHeight;
        if (lh && lh !== 'normal') {
          const normalized = lh.includes('px')
            ? (parseFloat(lh) / parseInt(style.fontSize)).toFixed(2)
            : lh;
          lineHeights.set(normalized, (lineHeights.get(normalized) || 0) + 1);
        }

        // Font weight
        const fw = style.fontWeight;
        if (fw) {
          fontWeights.set(fw, (fontWeights.get(fw) || 0) + 1);
        }

        // Letter spacing
        const ls = style.letterSpacing;
        if (ls && ls !== 'normal' && ls !== '0px') {
          letterSpacings.set(ls, (letterSpacings.get(ls) || 0) + 1);
        }
      } catch (e) {}
    }

    // Calculate scale ratio (based on h1 to h2 or h2 to h3)
    let ratio = null;
    if (headingSizes.h1 && headingSizes.h2 && headingSizes.h2.fontSize > 0) {
      ratio = (headingSizes.h1.fontSize / headingSizes.h2.fontSize).toFixed(3);
    } else if (headingSizes.h2 && headingSizes.h3 && headingSizes.h3.fontSize > 0) {
      ratio = (headingSizes.h2.fontSize / headingSizes.h3.fontSize).toFixed(3);
    }

    // Sort by frequency
    const sortedLineHeights = [...lineHeights.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val]) => val)
      .slice(0, 5);

    const sortedFontWeights = [...fontWeights.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val]) => val)
      .slice(0, 5);

    const sortedLetterSpacing = [...letterSpacings.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val]) => val)
      .slice(0, 5);

    return {
      base: baseFontSize,
      headings: headingSizes,
      lineHeights: sortedLineHeights,
      fontWeights: sortedFontWeights,
      letterSpacing: sortedLetterSpacing,
      ratio: ratio ? parseFloat(ratio) : null,
    };
  },

  // ===========================================
  // BORDER/SHADOW PATTERN DETECTION
  // ===========================================

  /**
   * Detect border-radius and box-shadow patterns
   */
  detectBorderShadowPatterns() {
    const borderRadii = new Map();
    const boxShadows = new Map();
    const borderStyles = new Map();
    const borderColors = new Map();

    const elements = document.querySelectorAll('*');
    const maxCheck = Math.min(elements.length, 500);

    for (let i = 0; i < maxCheck; i++) {
      const el = elements[i];
      try {
        const style = getComputedStyle(el);

        // Border radius
        const br = style.borderRadius;
        if (br && br !== '0px') {
          // Normalize to single value if all corners are same
          const parts = br.split(' ');
          const normalized = parts.every(p => p === parts[0]) ? parts[0] : br;
          borderRadii.set(normalized, (borderRadii.get(normalized) || 0) + 1);
        }

        // Box shadow
        const bs = style.boxShadow;
        if (bs && bs !== 'none') {
          // Simplify shadow for grouping (truncate if too long)
          const simplified = bs.length > 60 ? bs.substring(0, 60) + '...' : bs;
          boxShadows.set(simplified, (boxShadows.get(simplified) || 0) + 1);
        }

        // Border style
        const bStyle = style.borderStyle;
        if (bStyle && bStyle !== 'none') {
          borderStyles.set(bStyle, (borderStyles.get(bStyle) || 0) + 1);
        }

        // Border color (if border exists)
        if (style.borderWidth && style.borderWidth !== '0px') {
          const bColor = this.normalizeColor(style.borderColor);
          if (bColor && bColor !== 'transparent') {
            borderColors.set(bColor, (borderColors.get(bColor) || 0) + 1);
          }
        }
      } catch (e) {}
    }

    // Sort by frequency
    const sortedRadii = [...borderRadii.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val, count]) => ({ value: val, count }))
      .slice(0, 10);

    const sortedShadows = [...boxShadows.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([val, count]) => ({ value: val, count }))
      .slice(0, 10);

    const sortedBorderStyles = [...borderStyles.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const sortedBorderColors = [...borderColors.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color)
      .slice(0, 8);

    // Categorize radii
    const radiusCategories = {
      none: 0,
      small: 0,    // 1-4px
      medium: 0,   // 5-12px
      large: 0,    // 13-24px
      pill: 0,     // 9999px or 50%
    };

    sortedRadii.forEach(({ value, count }) => {
      const numVal = parseInt(value);
      if (value === '0px') radiusCategories.none += count;
      else if (numVal >= 9999 || value.includes('50%')) radiusCategories.pill += count;
      else if (numVal <= 4) radiusCategories.small += count;
      else if (numVal <= 12) radiusCategories.medium += count;
      else radiusCategories.large += count;
    });

    // Categorize shadows by intensity
    const shadowLevels = {
      none: 0,
      subtle: 0,   // small blur, low opacity
      medium: 0,   // medium blur
      strong: 0,   // large blur or multiple shadows
    };

    sortedShadows.forEach(({ value, count }) => {
      if (value === 'none') {
        shadowLevels.none += count;
      } else {
        // Simple heuristic based on blur radius
        const blurMatch = value.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
        if (blurMatch) {
          const blur = parseInt(blurMatch[3]);
          if (blur <= 3) shadowLevels.subtle += count;
          else if (blur <= 10) shadowLevels.medium += count;
          else shadowLevels.strong += count;
        } else {
          shadowLevels.medium += count;
        }
      }
    });

    return {
      borderRadius: sortedRadii.map(r => r.value),
      boxShadow: sortedShadows.map(s => s.value),
      borderStyles: sortedBorderStyles.map(([style]) => style),
      borderColors: sortedBorderColors,
      radiusCategories: radiusCategories,
      shadowLevels: shadowLevels,
    };
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analyzer;
}
