// Paintbrush Generator
// Handles Claude API calls and CSS validation

const Generator = {
  API_URL: 'https://api.anthropic.com/v1/messages',
  MODEL: 'claude-haiku-4-5-20251001',
  MAX_TOKENS: 4000,

  /**
   * Generate CSS from a prompt
   */
  async generate(systemPrompt, userPrompt, apiKey = null) {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required. Click the gear icon to add your Anthropic API key.',
      };
    }
    const key = apiKey;

    console.log('[Paintbrush] Calling Claude API...');
    const startTime = performance.now();

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: this.MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(this._friendlyError(response.status, errorText));
      }

      const data = await response.json();
      let css = data.content[0].text;

      // Clean, repair, and validate
      css = this.cleanCSS(css);
      css = this.repairCSS(css);

      if (!this.validateCSS(css)) {
        console.warn('[Paintbrush] CSS validation failed but continuing anyway');
      }

      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[Paintbrush] Generated ${css.length} chars of CSS in ${elapsed}ms`);

      return {
        success: true,
        css: css,
        tokens: data.usage,
        elapsed: elapsed,
      };
    } catch (error) {
      console.error('[Paintbrush] Generation failed:', error);

      // Handle network errors
      let userMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        userMessage = 'Network error. Please check your connection.';
      } else if (error.name === 'AbortError') {
        userMessage = 'Request timed out. Please try again.';
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  },

  /**
   * Clean up CSS output from Claude
   */
  cleanCSS(css) {
    // Remove markdown code fences if present
    css = css.replace(/```css\n?/gi, '');
    css = css.replace(/```\n?/g, '');

    // Remove any leading/trailing explanation text
    // Look for the first { and last } to extract just CSS
    const firstBrace = css.indexOf('{');
    const lastBrace = css.lastIndexOf('}');

    if (firstBrace > 50) {
      // There might be explanation text before the CSS
      // Try to find where CSS actually starts
      const cssStart = css.search(/^\s*[a-zA-Z*#.:[\]@]/m);
      if (cssStart !== -1 && cssStart < firstBrace) {
        css = css.slice(cssStart);
      }
    }

    // Trim whitespace
    css = css.trim();

    // Ensure it doesn't start with non-CSS content
    if (css.startsWith('Here') || css.startsWith('I ') || css.startsWith('The ')) {
      // Find the first selector-like pattern
      const match = css.match(/\n\s*[a-zA-Z*#.:[\]@][^{]*\{/);
      if (match) {
        css = css.slice(match.index).trim();
      }
    }

    return css;
  },

  /**
   * Repair common CSS issues
   */
  repairCSS(css) {
    let openCount = 0;
    let result = '';
    let inString = false;
    let stringChar = '';

    // Process character by character to handle brace balancing
    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      const prevChar = css[i - 1];

      // Track string boundaries
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      // Only count braces outside strings
      if (!inString) {
        if (char === '{') {
          openCount++;
        } else if (char === '}') {
          if (openCount > 0) {
            openCount--;
          } else {
            // Skip extra closing brace
            console.log('[Paintbrush] Removed extra closing brace');
            continue;
          }
        }
      }

      result += char;
    }

    // Add missing closing braces
    if (openCount > 0) {
      console.log(`[Paintbrush] Added ${openCount} missing closing brace(s)`);
      result += '}'.repeat(openCount);
    }

    // Fix common issues
    // Remove empty rule blocks
    result = result.replace(/[^{}]+\{\s*\}/g, '');

    // Fix double semicolons
    result = result.replace(/;+/g, ';');

    // Fix semicolon before closing brace (add if missing)
    result = result.replace(/([^;{}\s])\s*\}/g, '$1; }');

    return result;
  },

  /**
   * Basic CSS validation
   */
  validateCSS(css) {
    // Check for balanced braces
    const openBraces = (css.match(/\{/g) || []).length;
    const closeBraces = (css.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      console.warn(`[Paintbrush] CSS brace mismatch: ${openBraces} open, ${closeBraces} close`);
      return false;
    }

    // Check for obviously invalid patterns
    if (/\{\s*\{/.test(css)) {
      console.warn('[Paintbrush] Double open brace detected');
      return false;
    }

    // Check minimum viable CSS
    if (css.length < 100) {
      console.warn('[Paintbrush] Generated CSS seems too short');
      return false;
    }

    return true;
  },

  /**
   * Convert API errors to user-friendly messages
   */
  _friendlyError(status, errorText) {
    // Parse error if JSON
    let errorData = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      // Not JSON, use raw text
    }

    const errorType = errorData.error?.type || '';
    const errorMessage = errorData.error?.message || errorText;

    switch (status) {
      case 401:
        return 'Invalid API key. Please check your settings.';
      case 403:
        return 'API access forbidden. Your key may not have permission.';
      case 429:
        if (errorMessage.includes('rate')) {
          return 'Rate limited. Please wait a moment and try again.';
        }
        return 'Too many requests. Please wait a moment.';
      case 500:
      case 502:
      case 503:
        return 'AI service temporarily unavailable. Please try again.';
      case 529:
        return 'AI service overloaded. Please try again in a few seconds.';
      default:
        if (errorType === 'overloaded_error') {
          return 'AI is busy. Please try again in a moment.';
        }
        if (errorMessage.length > 100) {
          return `Generation failed (${status}). Please try again.`;
        }
        return `Generation failed: ${errorMessage}`;
    }
  },

  /**
   * Quick generation for hiding elements - much faster than full theme
   * Returns ONLY the hiding CSS rules to append
   */
  async generateHidingCSS(elementsToHide, pageContext, apiKey = null) {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required. Click the gear icon to add your Anthropic API key.',
      };
    }
    const key = apiKey;

    console.log('[Paintbrush] Quick hide generation...');
    const startTime = performance.now();

    const systemPrompt = `You are a CSS expert. Generate ONLY display:none rules to hide elements.
Output ONLY valid CSS - no explanations, no markdown.
Use !important on all rules.
Target common patterns for: ads, banners, popups, modals, newsletters, cookie notices, subscription prompts.`;

    const userPrompt = `Hide these elements on ${pageContext.hostname}:
"${elementsToHide}"

Generate CSS rules using common selector patterns like:
- [class*="ad"], [id*="ad"], [class*="banner"]
- [class*="popup"], [class*="modal"], [class*="overlay"]
- [class*="newsletter"], [class*="subscribe"], [class*="promo"]
- [class*="cookie"], [class*="consent"], [class*="gdpr"]
- Fixed position elements at bottom/top of page

Output ONLY the CSS rules, nothing else.`;

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 1000, // Much smaller - just hiding rules
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(this._friendlyError(response.status, errorText));
      }

      const data = await response.json();
      let css = data.content[0].text;
      css = this.cleanCSS(css);

      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[Paintbrush] Generated ${css.length} chars of hiding CSS in ${elapsed}ms`);

      return {
        success: true,
        css: css,
        elapsed: elapsed,
        isAppend: true, // Flag to indicate this should be appended
      };
    } catch (error) {
      console.error('[Paintbrush] Hiding CSS generation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Test if API key is valid
   */
  async testApiKey(apiKey) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Generator;
}
