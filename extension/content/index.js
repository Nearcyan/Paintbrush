// Paintbrush Content Script
// Main orchestrator - ties all modules together

// Chrome/Firefox compatibility
const browser = globalThis.browser || globalThis.chrome;

// State
let currentAnalysis = null;
let isUIVisible = false;
let previewState = null; // { css, prompt, previousCSS, themeId, isNew } for preview mode

/**
 * Initialize Paintbrush on page load
 */
async function init() {
  const hostname = window.location.hostname;
  if (!hostname) return;

  console.log('[Paintbrush] Initializing for', hostname);

  // Load and apply saved theme immediately (before page renders)
  try {
    const theme = await Storage.loadTheme(hostname);
    if (theme?.css) {
      Injector.injectEarly(theme.css);
      console.log('[Paintbrush] Applied saved theme');
    }
  } catch (error) {
    console.error('[Paintbrush] Error loading saved theme:', error);
  }
}

/**
 * Check if a request is asking to hide/remove elements
 */
function isHidingRequest(prompt) {
  return /\b(hide|remove|block|delete|no more|get rid|disable|ads?|advert|banner|popup|cookie|newsletter)\b/i.test(prompt);
}

/**
 * Generate a new theme
 * @param {string} userPrompt - The user's theme description
 * @param {function} onStatus - Optional callback for progress updates
 */
async function generateTheme(userPrompt, onStatus = () => {}) {
  const hostname = window.location.hostname;

  // Load API key from settings
  const settings = await Storage.loadSettings();
  const apiKey = settings.apiKey;

  // Step 1: Analyze the page (if not already done)
  if (!currentAnalysis) {
    console.log('[Paintbrush] Analyzing page...');
    onStatus('Analyzing page...');
    currentAnalysis = await Analyzer.analyze();
  }

  // Step 2: Check for existing theme (for refinement context)
  const existingTheme = await Storage.loadTheme(hostname);

  // Step 3: Check if this is a hiding request with existing theme (fast path)
  if (existingTheme?.css && isHidingRequest(userPrompt)) {
    console.log('[Paintbrush] Using fast hiding path');
    onStatus('Generating hiding rules...');

    const hideResult = await Generator.generateHidingCSS(
      userPrompt,
      { hostname, pathname: window.location.pathname },
      apiKey
    );

    if (hideResult.success) {
      // Append hiding CSS to existing theme
      const combinedCSS = existingTheme.css + '\n\n/* Hidden elements */\n' + hideResult.css;

      onStatus('Applying...');
      Injector.injectWithTransition(combinedCSS);

      onStatus('Saving...');
      // Update prompt to reflect the hiding addition
      const combinedPrompt = existingTheme.prompt + ' + ' + userPrompt;
      await Storage.updateTheme(hostname, combinedPrompt, combinedCSS);

      return { ...hideResult, css: combinedCSS };
    }
    // If hiding generation failed, fall through to full generation
    console.log('[Paintbrush] Fast path failed, using full generation');
  }

  // Step 4: Build the prompt (use refinement prompt if updating existing theme)
  onStatus('Building prompt...');
  let systemPrompt, builtPrompt;

  // Get corrections for this site to avoid past mistakes
  const corrections = await Storage.getHostnameCorrections(hostname);

  if (existingTheme?.css) {
    // Use refinement prompt - includes actual CSS context
    const prompts = Prompter.buildRefinementPrompt(
      userPrompt,
      currentAnalysis,
      existingTheme,
      corrections
    );
    systemPrompt = prompts.systemPrompt;
    builtPrompt = prompts.userPrompt;
  } else {
    // New theme - use standard prompt with corrections
    const prompts = Prompter.buildPrompt(
      userPrompt,
      currentAnalysis,
      null,
      corrections
    );
    systemPrompt = prompts.systemPrompt;
    builtPrompt = prompts.userPrompt;
  }

  // Step 5: Generate CSS (this is the slow part)
  onStatus('Generating theme...');
  const result = await Generator.generate(systemPrompt, builtPrompt, apiKey);

  if (!result.success) {
    throw new Error(result.error);
  }

  // Step 6: Inject for preview (don't save yet)
  onStatus('Previewing...');
  const previousCSS = existingTheme?.css || null;
  Injector.injectWithTransition(result.css);

  // Store preview state for confirmation
  previewState = {
    css: result.css,
    prompt: userPrompt,
    previousCSS,
    hostname,
    themeId: existingTheme?.id || null,
    isNew: !existingTheme,
  };

  return result;
}

/**
 * Confirm and save the previewed theme
 * @param {string} css - The CSS to save
 * @param {boolean} saveAsNew - If true, create new theme even if updating
 */
async function applyPreview(css, saveAsNew = false) {
  if (!previewState) return;

  const { prompt, hostname, themeId, isNew } = previewState;

  if (isNew || saveAsNew) {
    // Create new theme
    await Storage.createAndActivateTheme(hostname, prompt, css);
    console.log('[Paintbrush] Created and activated new theme');
  } else {
    // Update existing theme
    await Storage.updateTheme(hostname, themeId, { css, prompt });
    console.log('[Paintbrush] Updated existing theme');
  }

  previewState = null;
}

/**
 * Cancel preview and revert to previous state
 */
async function cancelPreview() {
  if (!previewState) return;

  const { previousCSS } = previewState;

  if (previousCSS) {
    Injector.inject(previousCSS);
    console.log('[Paintbrush] Reverted to previous theme');
  } else {
    Injector.remove();
    console.log('[Paintbrush] Removed preview');
  }

  previewState = null;
}

/**
 * Clear theme for current site
 */
async function clearTheme() {
  const hostname = window.location.hostname;
  Injector.remove();
  await Storage.deleteTheme(hostname);
  console.log('[Paintbrush] Theme cleared');
}

/**
 * Revert to previous theme
 */
async function revertTheme() {
  const hostname = window.location.hostname;
  const activeTheme = await Storage.getActiveTheme(hostname);

  if (!activeTheme?.id) return false;

  const reverted = await Storage.revertTheme(hostname, activeTheme.id);

  if (reverted?.css) {
    Injector.inject(reverted.css);
    return true;
  }
  return false;
}

/**
 * Toggle the Paintbrush UI
 */
function toggleUI() {
  if (isUIVisible) {
    PaintbrushUI.hide();
    isUIVisible = false;
  } else {
    showUI();
  }
}

/**
 * Show the Paintbrush UI
 */
async function showUI() {
  const hostname = window.location.hostname;
  const themes = await Storage.getThemes(hostname);
  const activeTheme = await Storage.getActiveTheme(hostname);

  PaintbrushUI.show({
    hostname,
    themes,
    activeTheme,
    existingTheme: activeTheme, // Legacy compatibility
    onGenerate: async (prompt, onStatus) => {
      return await generateTheme(prompt, onStatus);
    },
    onClear: async () => {
      await clearTheme();
    },
    onRevert: async () => {
      return await revertTheme();
    },
    onApplyPreview: async (css, saveAsNew) => {
      await applyPreview(css, saveAsNew);
    },
    onCancelPreview: async () => {
      await cancelPreview();
    },
    onSwitchTheme: async (themeId) => {
      await Storage.setActiveTheme(hostname, themeId);
      const theme = themes.find(t => t.id === themeId);
      if (theme?.css) {
        Injector.injectWithTransition(theme.css);
      }
    },
    onDisableThemes: async () => {
      await Storage.setActiveTheme(hostname, null);
      Injector.remove();
    },
    onRenameTheme: async (themeId, newName) => {
      await Storage.renameTheme(hostname, themeId, newName);
    },
    onDeleteTheme: async (themeId) => {
      const wasActive = activeTheme?.id === themeId;
      await Storage.deleteTheme(hostname, themeId);
      if (wasActive) {
        // If we deleted the active theme, remove the injected CSS
        Injector.remove();
      }
    },
    onClose: () => {
      isUIVisible = false;
    },
  });

  isUIVisible = true;
}

// Listen for messages from popup/background
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'show-ui') {
    toggleUI();
    sendResponse({ success: true });
  }

  if (message.action === 'generate-theme') {
    generateTheme(message.prompt)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }

  if (message.action === 'clear-theme') {
    clearTheme()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'get-status') {
    Storage.loadTheme(window.location.hostname)
      .then(theme => sendResponse({
        hasTheme: !!theme,
        prompt: theme?.prompt,
        isInjected: Injector.isInjected(),
      }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Available keybinds - user can enable/disable these in settings
const KEYBINDS = {
  'ctrl+shift+p': { ctrl: true, shift: true, key: 'p', label: 'Ctrl+Shift+P', macLabel: '⌘⇧P' },
  'alt+shift+p': { alt: true, shift: true, key: 'p', label: 'Alt+Shift+P', macLabel: '⌥⇧P' },
  'ctrl+shift+y': { ctrl: true, shift: true, key: 'y', label: 'Ctrl+Shift+Y', macLabel: '⌘⇧Y' },
};

// Default enabled keybinds - exposed on window for UI to update
window.enabledKeybinds = ['ctrl+shift+p', 'alt+shift+p'];

// Load keybind preferences
Storage.getKeybinds().then(keybinds => {
  if (keybinds) window.enabledKeybinds = keybinds;
});

// Check if a keybind matches the event
function matchesKeybind(e, bind) {
  const ctrlOrMeta = e.ctrlKey || e.metaKey;
  return (
    (bind.ctrl ? ctrlOrMeta : !ctrlOrMeta || bind.alt) &&
    (bind.alt ? e.altKey : !e.altKey || bind.ctrl) &&
    (bind.shift ? e.shiftKey : !e.shiftKey) &&
    e.key.toLowerCase() === bind.key
  );
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
  for (const id of window.enabledKeybinds) {
    const bind = KEYBINDS[id];
    if (bind && matchesKeybind(e, bind)) {
      e.preventDefault();
      e.stopPropagation();
      toggleUI();
      return;
    }
  }
});

// Initialize immediately
init();
