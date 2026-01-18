// Paintbrush Prompter
// Constructs the perfect prompt for Claude using site analysis

const Prompter = {
  /**
   * Build the complete prompt for theme generation
   */
  buildPrompt(userRequest, analysis, existingTheme = null, corrections = []) {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(userRequest, analysis, existingTheme, corrections);

    return { systemPrompt, userPrompt };
  },

  /**
   * System prompt - instructions for Claude
   */
  buildSystemPrompt() {
    return `You are an expert CSS developer specializing in website theming and restyling. Your job is to generate a complete, production-quality CSS stylesheet that transforms a website's appearance based on user requests.

CRITICAL RULES:
1. Output ONLY valid CSS code - no explanations, no markdown code fences, no comments
2. Use !important on color and background properties to ensure overrides work
3. Be COMPREHENSIVE - style ALL elements, not just the obvious ones
4. PRESERVE functionality - never use display:none on interactive elements
5. Ensure ACCESSIBILITY - maintain readable contrast (WCAG AA minimum)
6. Handle all STATES - :hover, :focus, :active, :visited, :disabled (see INTERACTIVE STATES below)
7. Include EDGE CASES - scrollbars, ::selection, ::placeholder, :focus-visible
8. NEVER MAKE THINGS INVISIBLE - every icon, button, and text element must remain visible
9. Sidebar/navigation icons MUST have a visible fill color that contrasts with the background
10. FEATURED CONTENT (AI overviews, snippets, info panels) needs DISTINCT backgrounds - never same as page bg
11. ALL text must contrast with its background - check every container individually

FEATURED CONTENT & SPECIAL PANELS (critical for search engines):
- AI Overview, Featured Snippets, Knowledge Panels: use a DISTINCT background color (slightly different shade)
- Info cards, expandable sections: ensure text contrasts with the card's specific background
- Nested containers: each level needs its own background consideration
- Pattern: [class*="overview"], [class*="snippet"], [class*="panel"], [class*="card"] { background-color: [distinct-shade] !important; color: [contrasting-text] !important; }
- NEVER let panel content blend into panel background - always verify text is readable

VISUAL DEPTH & POLISH (for prettier themes):
- Use subtle box-shadows on cards/panels: box-shadow: 0 2px 8px rgba(0,0,0,0.1);
- Elevate interactive elements on hover: box-shadow: 0 4px 12px rgba(0,0,0,0.15);
- Add subtle borders to define sections: border: 1px solid rgba(128,128,128,0.2);
- Consider subtle gradients for headers/hero sections
- Use consistent border-radius throughout (4px for small elements, 8px for cards)

SVG & ICON STYLING (critical - icons must be VISIBLE):
- FIRST ensure parent elements have a visible text color set
- SVG fill: svg { fill: currentColor !important; } - but ONLY if parent has color set!
- SVG paths: svg path, svg circle, svg rect { fill: currentColor !important; }
- Stroke icons: svg[stroke], svg path[stroke] { stroke: currentColor !important; }
- Icon containers MUST have explicit color: [class*="icon"], [class*="Icon"] { color: [visible-color] !important; }
- Icon fonts: .fa, .fas, .far, .fab, .material-icons { color: [visible-color] !important; }
- Sidebar/nav icons: these are CRITICAL - set explicit visible color, don't rely on inherit
- VERIFY: if icon fill is currentColor, the parent MUST have a contrasting color property
- Pattern for nav icons: nav svg, aside svg, [class*="sidebar"] svg { fill: [light-color] !important; }

INTERACTIVE STATES (be explicit and thorough):
- :hover - slightly lighter/brighter than base, smooth transition
- :focus - visible outline or ring (accessibility!), never remove focus indicators
- :focus-visible - keyboard focus styling
- :active - pressed state, slightly darker than hover
- :visited - for links, subtle differentiation from unvisited
- :disabled - reduced opacity (0.5-0.6), cursor: not-allowed
- Add transitions: transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

BUTTON STYLING (balance visibility with restraint):
- NEVER hide or make buttons invisible - all buttons must remain clickable and visible
- Icon buttons: style the ICON COLOR (svg fill/stroke) to be visible against the background
- Don't add heavy backgrounds to icon-only buttons, but DO ensure the icon is visible
- Primary action buttons (Submit, Save, Post, Subscribe): can have solid colored backgrounds
- Like/Share/Comment buttons: style them but keep them VISIBLE - they're critical UI
- CRITICAL: If a button contains only an SVG, ensure the SVG has a visible fill color, not transparent

SECONDARY TEXT & METADATA (ensure visibility):
- Timestamps, dates, counts: use 70-80% opacity of main text color (not too dim!)
- Metadata (author, category, tags): slightly muted but still readable
- Help text, descriptions: softer than body text but not invisible
- Pattern: [class*="meta"], [class*="timestamp"], [class*="date"], time { color: rgba(textcolor, 0.75) !important; }
- Never let secondary text drop below 0.6 opacity - it becomes unreadable

OUTPUT STRUCTURE (follow this order):
1. Root/CSS variable overrides (if site uses them)
2. Base resets (html, body, *)
3. Structural elements (header, nav, main, aside, footer)
4. Typography (headings, paragraphs, lists)
5. Links (all states)
6. Buttons and interactive elements (all states - but respect icon buttons!)
7. Form elements (inputs, selects, textareas)
8. Cards, panels, containers
9. Tables (if present)
10. Modals and overlays (if detected)
11. Code blocks (if present - ensure contrast with surroundings!)
12. SVGs and icons (fill, stroke, icon fonts)
13. Media elements (images, videos - preserve visibility)
14. Badges, tags, status indicators
15. Secondary text & metadata (timestamps, counts, help text)
16. Scrollbars (webkit and standard)
17. Selection highlighting
18. Escape hatches (inline styles, dynamic classes)
19. Transitions (subtle, 0.15s ease for polish)

CODE BLOCK STYLING (ensure readability):
- pre, code backgrounds: use a noticeably different shade from page background
- Dark theme: code blocks should be slightly darker OR use a distinct hue
- Light theme: code blocks should be slightly darker (light gray) than white
- Ensure at least 2:1 contrast between code block bg and surrounding content
- Inline code: subtle background tint to distinguish from prose
- Syntax highlighting: if colors present, ensure they work with new background
- Pattern: pre, code { background-color: [distinct-shade] !important; border-radius: 4px; }

SPECIFICITY STRATEGY:
- For colors/backgrounds: always use !important
- For layout properties: avoid !important to prevent breaking
- Use element + class selectors when provided
- Target both generic (button) and specific (.btn, .btn-primary) selectors
- PREFER [data-testid="..."] selectors when available - they're stable and specific
- Use [aria-label="..."] for targeting buttons/links by their purpose
- When DOM snapshot is provided, use it to understand nesting and target precisely

FRAMEWORK-AWARE THEMING:
- If Tailwind detected: use utility class patterns (bg-*, text-*, etc.)
- If Bootstrap detected: use Bootstrap classes (.btn-*, .card-*, etc.)
- If Material UI detected: use MUI classes (.MuiButton-*, etc.)
- If CSS-in-JS detected: AVOID hashed classes, use data-testid/aria-label instead
- Preserve existing animations and transitions when possible

COLOR CONSISTENCY (catch escaping elements - BUT NEVER HIDE ANYTHING):
- Override inline TEXT colors only: [style*="color"] { color: inherit !important; }
- DON'T blindly override backgrounds - this can make elements invisible!
- Only override backgrounds when you KNOW what color to use: [style*="background"] { background-color: [specific-theme-color] !important; }
- Badge/tag elements: give them a VISIBLE accent background, not inherit
- Status indicators: keep them visible with appropriate colors
- CRITICAL: Never use "inherit" for backgrounds unless you're certain the parent has a solid color
- If unsure, it's better to leave an element's background alone than make it invisible

DROPDOWNS & POPOVERS (often escape theming):
- Dropdown menus: [class*="dropdown"], [class*="menu"], [role="menu"], [role="listbox"]
- Tooltips: [class*="tooltip"], [role="tooltip"], [class*="popover"]
- Autocomplete: [class*="autocomplete"], [class*="suggestions"], [class*="typeahead"]
- These often render in portals - ensure they get themed too
- Match background to cards/panels, not page background`;
  },

  /**
   * User prompt - site context + request
   */
  buildUserPrompt(userRequest, analysis, existingTheme, corrections = []) {
    let prompt = `WEBSITE CONTEXT
===============
Site: ${analysis.hostname}
Page: ${analysis.pathname}
Title: ${analysis.title}

CURRENT APPEARANCE
------------------
Mode: ${analysis.colors.isDarkMode ? 'Currently DARK' : 'Currently LIGHT'}
Main backgrounds: ${analysis.colors.backgrounds.slice(0, 5).join(', ') || 'standard white'}
Main text colors: ${analysis.colors.text.slice(0, 5).join(', ') || 'standard black'}
Border colors: ${analysis.colors.borders.slice(0, 3).join(', ') || 'none detected'}

PAGE STRUCTURE
--------------
Header: ${analysis.selectors.header || '<header> (standard)'}${analysis.structure.hasFixedHeader ? ' [FIXED/STICKY]' : ''}
Navigation: ${analysis.selectors.nav || '<nav> (standard)'}
Main content: ${analysis.selectors.main || '<main> (standard)'}
Sidebar: ${analysis.selectors.sidebar || 'none detected'}
Footer: ${analysis.selectors.footer || '<footer> (standard)'}
Article/Post elements: ${analysis.selectors.article || 'none detected'}

INTERACTIVE ELEMENTS
--------------------
Buttons: ${analysis.selectors.buttons || 'button, .btn'}
Inputs: ${analysis.selectors.inputs || 'input, textarea, select'}
Cards/Panels: ${analysis.selectors.cards || 'none detected'}
Tables: ${analysis.selectors.tables || 'none detected'}

SITE-SPECIFIC SELECTORS
-----------------------
${analysis.selectors.custom?.length > 0
  ? analysis.selectors.custom.join('\n')
  : 'No site-specific patterns detected - use standard element selectors'}

`;

    // Add data-testid targeting (huge for React/modern sites)
    if (analysis.testIds?.length > 0) {
      prompt += `DATA-TESTID SELECTORS (use these for precise targeting!)
----------------------------------------------------
Available testIds: ${analysis.testIds.slice(0, 30).join(', ')}
${analysis.testIdsByType?.button?.length > 0 ? `Button testIds: ${analysis.testIdsByType.button.slice(0, 10).join(', ')}` : ''}
${analysis.testIdsByType?.div?.length > 0 ? `Container testIds: ${analysis.testIdsByType.div.slice(0, 10).join(', ')}` : ''}
${analysis.testIdsByType?.article?.length > 0 ? `Article testIds: ${analysis.testIdsByType.article.join(', ')}` : ''}

Use [data-testid="name"] selectors - they're stable and specific!

`;
    }

    // Add aria-label info for accessibility-conscious sites
    if (analysis.ariaLabels?.length > 0) {
      const buttonLabels = analysis.ariaLabels.filter(a => a.element === 'button').slice(0, 10);
      const linkLabels = analysis.ariaLabels.filter(a => a.element === 'a').slice(0, 5);

      prompt += `ARIA-LABELED ELEMENTS (useful for targeting by purpose)
-----------------------------------------------------
${buttonLabels.length > 0 ? `Buttons: ${buttonLabels.map(a => `"${a.label}"`).join(', ')}` : ''}
${linkLabels.length > 0 ? `Links: ${linkLabels.map(a => `"${a.label}"`).join(', ')}` : ''}

Use [aria-label="Label"] selectors for specific interactive elements.

`;
    }

    // Add element context for targeted styling
    if (analysis.elementContext?.length > 0) {
      const actionButtons = analysis.elementContext.filter(e =>
        e.testId && e.parentContext && e.element === 'button'
      ).slice(0, 8);

      if (actionButtons.length > 0) {
        prompt += `KEY INTERACTIVE ELEMENTS (with context)
--------------------------------------
${actionButtons.map(btn =>
  `- ${btn.selector} (${btn.size.width}x${btn.size.height}px, in ${btn.parentContext})`
).join('\n')}

These selectors are precise - use them for targeted styling.

`;
      }
    }

    // Add DOM snapshot for structure understanding
    if (analysis.domSnapshot) {
      // Include a truncated version to help Claude understand the structure
      const snapshotLines = analysis.domSnapshot.split('\n').slice(0, 40);
      prompt += `DOM STRUCTURE SNAPSHOT (simplified, for context)
-----------------------------------------------
${snapshotLines.join('\n')}
${snapshotLines.length < analysis.domSnapshot.split('\n').length ? '...(truncated)' : ''}

`;
    }

    // Add framework detection info
    if (analysis.frameworks) {
      const detected = Object.entries(analysis.frameworks)
        .filter(([, info]) => info.detected)
        .map(([name, info]) => ({name, ...info}));

      if (detected.length > 0) {
        prompt += `DETECTED FRAMEWORKS/LIBRARIES
-----------------------------
${detected.map(f => `✓ ${f.name.toUpperCase()}${f.selectors?.length ? ` - use selectors: ${f.selectors.slice(0, 5).join(', ')}` : ''}`).join('\n')}

Use framework-specific selectors for better targeting!

`;
      }
    }

    // Add CSS-in-JS warning
    if (analysis.cssInJs?.detected) {
      prompt += `⚠️ CSS-IN-JS DETECTED (${analysis.cssInJs.patterns.join(', ')})
------------------------------------------
This site uses hashed/generated class names that may change.
PREFER: [data-testid], [aria-label], [role], semantic elements
AVOID: Targeting classes like .css-*, .sc-*, .r-* directly

`;
    }

    // Add media query info for responsive themes
    if (analysis.mediaQueries?.breakpoints?.length > 0) {
      prompt += `RESPONSIVE BREAKPOINTS
---------------------
${analysis.mediaQueries.breakpoints.join(', ')}
${analysis.mediaQueries.features.prefersColorScheme ? '✓ Site supports prefers-color-scheme' : ''}
${analysis.mediaQueries.features.prefersReducedMotion ? '✓ Site respects prefers-reduced-motion' : ''}

Consider these breakpoints for responsive theming.

`;
    }

    // Add animation info
    if (analysis.animations?.keyframes?.length > 0 || analysis.animations?.hasTransitions) {
      prompt += `ANIMATIONS & TRANSITIONS
-----------------------
${analysis.animations.keyframes.length > 0 ? `Keyframes: ${analysis.animations.keyframes.join(', ')}` : ''}
${analysis.animations.hasTransitions ? '✓ Has CSS transitions - preserve or enhance them' : ''}

`;
    }

    // Add z-index layer info for modals/overlays
    if (analysis.layers?.max > 0) {
      prompt += `Z-INDEX LAYERS (for modals/overlays)
-----------------------------------
Max z-index: ${analysis.layers.max}
${Object.entries(analysis.layers.categories).map(([cat, z]) => `${cat}: ${z}`).join(', ')}

Use appropriate z-index values to maintain layer hierarchy.

`;
    }

    // Add CSS variables if found
    const cssVars = Object.entries(analysis.cssVariables || {});
    if (cssVars.length > 0) {
      prompt += `CSS VARIABLES (can override these directly)
------------------------------------------
${cssVars.map(([k, v]) => `${k}: ${v}`).join('\n')}

`;
    }

    // Add structure flags
    prompt += `PAGE FEATURES
-------------
${analysis.structure.hasCards ? '✓ Has cards/panels - style .card and similar' : ''}
${analysis.structure.hasTables ? '✓ Has tables - style table elements' : ''}
${analysis.structure.hasModals ? '✓ Has modals - style .modal, [role="dialog"]' : ''}
${analysis.structure.hasForms ? '✓ Has forms - style form elements thoroughly' : ''}
${analysis.structure.hasCode ? '✓ Has code blocks - style pre, code elements' : ''}
${analysis.structure.hasImages ? '✓ Has images - preserve visibility, maybe add subtle treatment' : ''}

`;

    // Add element types for comprehensive coverage
    if (analysis.elementTypes?.length > 0) {
      prompt += `ELEMENT TYPES TO STYLE (${analysis.elementTypes.length} types found)
-----------------------------------------
${analysis.elementTypes.join(', ')}

Style ALL of these element types for complete coverage.

`;
    }

    // Add element categories
    if (analysis.elementCategories) {
      const cats = analysis.elementCategories;
      const catInfo = [];
      if (cats.typography?.length > 0) catInfo.push(`Typography: ${cats.typography.join(', ')}`);
      if (cats.semantic?.length > 0) catInfo.push(`Semantic: ${cats.semantic.join(', ')}`);
      if (cats.media?.length > 0) catInfo.push(`Media: ${cats.media.join(', ')}`);
      if (cats.lists?.length > 0) catInfo.push(`Lists: ${cats.lists.join(', ')}`);

      if (catInfo.length > 0) {
        prompt += `ELEMENT CATEGORIES
------------------
${catInfo.join('\n')}

`;
      }
    }

    // Add icon detection info
    if (analysis.icons) {
      const { svgs, fonts, recommendations } = analysis.icons;
      const hasIcons = (svgs?.count > 0) || (fonts?.detected);

      if (hasIcons) {
        prompt += `ICONS DETECTED
--------------
${svgs?.count > 0 ? `✓ SVG icons: ${svgs.count} found${svgs.sizes?.length > 0 ? ` (sizes: ${svgs.sizes.slice(0, 5).join(', ')})` : ''}${svgs.hasSprite ? ' [uses sprite]' : ''}` : ''}
${fonts?.detected ? `✓ Icon fonts: ${fonts.libraries.join(', ')}` : ''}
${recommendations?.length > 0 ? `\nTips:\n${recommendations.map(r => `- ${r}`).join('\n')}` : ''}

`;
      }
    }

    // Add enhanced form info
    if (analysis.forms?.inputTypes?.length > 0) {
      prompt += `FORM ELEMENTS (comprehensive styling needed)
--------------------------------------------
Input types: ${analysis.forms.inputTypes.join(', ')}
${analysis.forms.states?.hasRequired ? '✓ Has required fields - style :required, :invalid' : ''}
${analysis.forms.states?.hasDisabled ? '✓ Has disabled fields - style :disabled' : ''}
${analysis.forms.states?.hasPlaceholder ? '✓ Has placeholders - style ::placeholder' : ''}
${analysis.forms.structure?.hasFieldsets ? '✓ Has fieldset/legend - style these elements' : ''}
${analysis.forms.selects?.hasMultiple ? '✓ Has multi-select - style select[multiple]' : ''}
${analysis.forms.groups?.radioGroups > 0 ? `✓ Has ${analysis.forms.groups.radioGroups} radio group(s)` : ''}
${analysis.forms.groups?.checkboxCount > 0 ? `✓ Has ${analysis.forms.groups.checkboxCount} checkbox(es)` : ''}
${analysis.forms.hasDatalist ? '✓ Has datalist - style datalist, option' : ''}

Selectors: ${analysis.forms.selectors?.slice(0, 15).join(', ')}

`;
    }

    // Add color harmony analysis
    if (analysis.colorAnalysis) {
      const { roles, semantic, scheme, dominant, contrast } = analysis.colorAnalysis;

      prompt += `COLOR ANALYSIS
--------------
Scheme type: ${scheme || 'mixed'}
Dominant colors: ${dominant?.slice(0, 5).join(', ') || 'various'}
${roles?.primary ? `Primary/accent: ${roles.primary}` : ''}
${semantic?.success ? `Semantic - Success: ${semantic.success}, Error: ${semantic.error}, Warning: ${semantic.warning}` : ''}
${contrast?.hasIssues ? `⚠️ Contrast issues detected - ensure WCAG AA compliance` : ''}

Use this color information to create a harmonious theme that respects the site's existing palette or transforms it cohesively.

`;
    }

    // Add pseudo-element info
    if (analysis.pseudoElements?.count > 0) {
      prompt += `PSEUDO-ELEMENTS (${analysis.pseudoElements.count} found)
--------------------------------------------
${analysis.pseudoElements.before?.length > 0 ? `::before elements: ${analysis.pseudoElements.before.slice(0, 5).map(p => p.selector).join(', ')}` : ''}
${analysis.pseudoElements.after?.length > 0 ? `::after elements: ${analysis.pseudoElements.after.slice(0, 5).map(p => p.selector).join(', ')}` : ''}
${analysis.pseudoElements.hasPlaceholders ? '✓ Has input placeholders - style ::placeholder' : ''}

Style these pseudo-elements to match the theme. Use appropriate colors for ::before/::after content.

`;
    }

    // Add style inheritance info
    if (analysis.styleInheritance) {
      const { rootStyles, fontChain } = analysis.styleInheritance;

      prompt += `STYLE INHERITANCE
-----------------
Root font: ${rootStyles?.fontFamily?.split(',')[0]?.trim() || 'system default'}
Root color: ${rootStyles?.color || 'default'}
Root line-height: ${rootStyles?.lineHeight || 'default'}
${fontChain?.length > 0 ? `Font chain: ${fontChain.slice(0, 3).map(f => f.fontFamily).join(' → ')}` : ''}

Consider the inheritance chain when setting base styles. Override at root level for broad changes.

`;
    }

    // Add spacing pattern info
    if (analysis.spacing?.scale?.length > 0) {
      prompt += `SPACING SYSTEM
--------------
Detected scale: ${analysis.spacing.scale.slice(0, 8).join(', ')}px
Common values: ${analysis.spacing.common?.slice(0, 5).join(', ')}px
${analysis.spacing.padding?.length > 0 ? `Padding range: ${Math.min(...analysis.spacing.padding)}px - ${Math.max(...analysis.spacing.padding)}px` : ''}
${analysis.spacing.gap?.length > 0 ? `Grid/flex gaps: ${analysis.spacing.gap.join(', ')}px` : ''}

Use consistent spacing values from this scale for a cohesive layout.

`;
    }

    // Add typography scale info
    if (analysis.typographyScale) {
      const { base, headings, ratio, lineHeights, fontWeights } = analysis.typographyScale;

      prompt += `TYPOGRAPHY SCALE
----------------
Base font size: ${base || 16}px
Scale ratio: ${ratio ? ratio.toFixed(2) : 'varies'}
${headings ? `Heading sizes: h1=${headings.h1 || 'default'}px, h2=${headings.h2 || 'default'}px, h3=${headings.h3 || 'default'}px` : ''}
${lineHeights?.length > 0 ? `Line heights: ${lineHeights.slice(0, 5).join(', ')}` : ''}
${fontWeights?.length > 0 ? `Font weights: ${fontWeights.join(', ')}` : ''}

Maintain this typographic hierarchy for visual consistency.

`;
    }

    // Add border/shadow pattern info
    if (analysis.borderShadow) {
      const { radiusCategories, shadowLevels, borderStyles } = analysis.borderShadow;

      const radiusInfo = [];
      if (radiusCategories?.small?.length > 0) radiusInfo.push(`small: ${radiusCategories.small[0]}px`);
      if (radiusCategories?.medium?.length > 0) radiusInfo.push(`medium: ${radiusCategories.medium[0]}px`);
      if (radiusCategories?.large?.length > 0) radiusInfo.push(`large: ${radiusCategories.large[0]}px`);
      if (radiusCategories?.pill?.length > 0) radiusInfo.push(`pill: ${radiusCategories.pill[0]}px`);

      prompt += `BORDER & SHADOW PATTERNS
------------------------
${radiusInfo.length > 0 ? `Border radius scale: ${radiusInfo.join(', ')}` : 'Border radius: none detected'}
${shadowLevels?.subtle?.length > 0 ? `✓ Has subtle shadows` : ''}
${shadowLevels?.medium?.length > 0 ? `✓ Has medium shadows` : ''}
${shadowLevels?.strong?.length > 0 ? `✓ Has strong shadows` : ''}
${borderStyles?.length > 0 ? `Border styles: ${borderStyles.slice(0, 3).join(', ')}` : ''}

Match the site's border-radius and shadow patterns for consistent styling.

`;
    }

    // Add existing theme context if refining
    if (existingTheme) {
      prompt += `CURRENT THEME (user wants to modify this)
-----------------------------------------
Previous request: "${existingTheme.prompt}"

The user wants to REFINE the existing theme, not start over.
Make targeted changes based on their new request while keeping the overall theme intact.

`;
    }

    // Add corrections if any (learning from past mistakes)
    if (corrections.length > 0) {
      prompt += `PAST CORRECTIONS (user undid these - avoid similar approaches)
-----------------------------------------------------
${corrections.slice(-3).map(c => `- Rejected: "${c.rejectedPrompt}" → Kept: "${c.acceptedPrompt}"`).join('\n')}

`;
    }

    // Add the user's request
    prompt += `USER REQUEST
============
"${userRequest}"

Generate a complete CSS stylesheet that fulfills this request. Be thorough - cover every element type that exists on this page. The goal is a polished, cohesive theme that the user never needs to adjust again.`;

    return prompt;
  },

  /**
   * Build a refinement prompt (when user wants to tweak existing theme)
   */
  buildRefinementPrompt(refinementRequest, analysis, existingTheme, corrections = []) {
    // Detect if this is a hiding/removal request (ad blocking, etc.)
    const isHidingRequest = /hide|remove|block|delete|no more|get rid|disable/i.test(refinementRequest);

    // Detect if this is a targeted component change
    const isTargetedChange = /just|only|specifically|the links|the buttons|the header|this button/i.test(refinementRequest);

    const systemPrompt = `You are a CSS expert making targeted refinements to an existing website theme.

CRITICAL RULES:
1. Output ONLY valid CSS code - no explanations, no markdown
2. PRESERVE the existing theme - start with the existing CSS and make targeted additions/modifications
3. For HIDING elements (ads, banners, popups): add "display: none !important" rules
4. For TARGETED changes: modify only the specific selectors mentioned, keep everything else
5. The existing CSS is working well - don't break it by removing styles

${isHidingRequest ? `AD/ELEMENT HIDING TIPS:
- Use [class*="ad"], [id*="ad"], [class*="sponsor"], [class*="promo"] patterns
- Target common ad containers: .ad, .ads, .advertisement, .banner-ad
- Hide newsletter popups: [class*="newsletter"], [class*="subscribe"], [class*="popup"]
- Hide cookie banners: [class*="cookie"], [class*="consent"], [class*="gdpr"]
- Always use display: none !important for hiding` : ''}

OUTPUT APPROACH:
1. Include ALL the existing CSS first (keeping the theme intact)
2. Then ADD your new/modified rules at the end
3. If modifying existing selectors, override with new values`;

    // Include the full existing CSS for context (truncated if too long)
    const existingCSS = existingTheme.css.length > 8000
      ? existingTheme.css.substring(0, 8000) + '\n/* ... truncated ... */'
      : existingTheme.css;

    let userPrompt = `EXISTING THEME (KEEP THIS - it's working well)
=============================================
Original request: "${existingTheme.prompt}"

EXISTING CSS:
\`\`\`css
${existingCSS}
\`\`\`

SITE: ${analysis.hostname}

`;

    // Add data-testid info for precise targeting in refinements
    if (analysis.testIds?.length > 0) {
      userPrompt += `AVAILABLE TESTID SELECTORS (use for precise targeting)
-----------------------------------------------------
${analysis.testIds.slice(0, 20).map(id => `[data-testid="${id}"]`).join('\n')}

`;
    }

    // Add element context for targeted refinements
    if (analysis.elementContext?.length > 0 && isTargetedChange) {
      const relevantElements = analysis.elementContext
        .filter(e => e.testId || e.ariaLabel)
        .slice(0, 15);

      if (relevantElements.length > 0) {
        userPrompt += `INTERACTIVE ELEMENTS (for targeted changes)
------------------------------------------
${relevantElements.map(el =>
  `${el.selector} - ${el.element} (${el.size.width}x${el.size.height}px)${el.parentContext ? ` in [${el.parentContext}]` : ''}`
).join('\n')}

`;
      }
    }

    // Add corrections if any
    if (corrections.length > 0) {
      userPrompt += `PAST CORRECTIONS (user undid these - avoid similar)
-------------------------------------------------
${corrections.slice(-3).map(c => `- Rejected: "${c.rejectedPrompt}"`).join('\n')}

`;
    }

    userPrompt += `USER'S REFINEMENT REQUEST
=========================
"${refinementRequest}"

Generate the COMPLETE updated CSS. Start with the existing CSS above, then add/modify rules to fulfill the refinement request. Keep the overall theme intact. Output only CSS.`;

    return { systemPrompt, userPrompt };
  },

  /**
   * Summarize CSS for refinement context (keep it short)
   */
  summarizeCSS(css) {
    // Extract key color values being used
    const colors = css.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g) || [];
    const uniqueColors = [...new Set(colors)].slice(0, 8);

    // Get a sense of what's being styled
    const selectors = css.match(/[^{}]+(?=\s*\{)/g) || [];
    const selectorSummary = selectors.slice(0, 10).map(s => s.trim()).join(', ');

    return `Colors used: ${uniqueColors.join(', ')}
Selectors styled: ${selectorSummary}...
(${css.length} chars total)`;
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Prompter;
}
