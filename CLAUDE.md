# Paintbrush - Developer Guide

This document describes the code structure and architecture for AI assistants working on this project.

## Overview

Paintbrush is a browser extension (Chrome + Firefox) that uses Claude AI to generate custom CSS themes for any website. The core philosophy is "one prompt → entire site fixed → forever."

## Project Structure

```
paintbrush/
├── extension/
│   ├── manifest.json       # Chrome extension manifest (v3)
│   ├── ...
├── firefox/
│   ├── manifest.json       # Firefox extension manifest (v2)
│   ├── build.sh            # Copies extension files for Firefox
│   └── ...                 # Built files (run build.sh to populate)
│   ├── background.js       # Service worker (minimal)
│   ├── lib/
│   │   ├── storage.js      # Theme persistence & settings
│   │   ├── sounds.js       # UI sound effects (Web Audio API)
│   │   ├── prompter.js     # Prompt construction for Claude
│   │   └── generator.js    # Claude API calls & CSS validation
│   ├── content/
│   │   ├── analyzer.js     # Page structure analysis
│   │   ├── injector.js     # CSS injection with transitions
│   │   ├── ui.js           # Inline Paintbrush UI panel
│   │   └── index.js        # Main orchestrator
│   ├── popup/
│   │   ├── popup.html      # Extension popup
│   │   ├── popup.css       # Popup styles
│   │   └── popup.js        # Theme list management
│   └── icons/              # Extension icons
├── README.md               # User documentation
├── CLAUDE.md               # This file
└── ARCHITECTURE.md         # Original design doc
```

## Key Components

### Content Scripts (loaded on every page)

#### `content/index.js` - Main Orchestrator
- Entry point for content scripts
- Handles theme generation flow
- Manages preview state
- Routes between fast path (hiding) and full generation

Key functions:
- `generateTheme(prompt, onStatus)` - Main generation flow
- `isHidingRequest(prompt)` - Detects hide/remove requests for fast path
- `applyPreview(css)` - Confirms and saves previewed theme
- `cancelPreview()` - Reverts preview without saving

#### `content/analyzer.js` - Page Analysis
Core analysis:
- Scans page structure (header, nav, main, footer, sidebar)
- Extracts current colors (backgrounds, text, borders)
- Finds CSS variables for direct override
- Detects features (cards, tables, modals, forms, code blocks)

Enhanced analysis (v1.3.0):
- `extractTestIds()` - data-testid attributes for precise targeting
- `extractTestIdsByType()` - testIds grouped by element type (button, div, etc.)
- `extractAriaLabels()` - aria-label/aria-labelledby for accessibility targeting
- `generateDomSnapshot()` - Simplified DOM structure for LLM context
- `extractElementContext()` - Interactive elements with parent context and dimensions
- `detectFrameworks()` - Tailwind, Bootstrap, React, Vue, Material UI detection
- `extractMediaQueries()` - Breakpoints and prefers-* features
- `detectAnimations()` - Keyframes, transitions, animated elements
- `detectShadowDOM()` - Web component shadow root detection
- `detectCSSInJS()` - styled-components, emotion, CSS modules detection
- `extractLayers()` - Z-index values and stacking context mapping

Design system analysis (v1.4.0):
- `extractElementTypes()` - All unique element types on page for complete coverage
- `countElements()` - Element counts for understanding page complexity
- `categorizeElements()` - Elements grouped by category (typography, semantic, media, lists)
- `detectIcons()` - SVG icons, icon fonts (FontAwesome, Material Icons, etc.)
- `detectSVGs()` - SVG detection with sprite support and sizing info
- `detectForms()` - Enhanced form analysis (input types, states, fieldsets, selects, radios/checkboxes)
- `analyzeColorHarmony()` - Color roles, semantic colors, scheme type, contrast analysis
- `detectPseudoElements()` - ::before/::after detection with content info
- `trackStyleInheritance()` - Root styles and font inheritance chain
- `detectSpacingPatterns()` - Padding, margin, gap values; identifies spacing scale
- `detectTypographyScale()` - Heading sizes, base font, line heights, font weights, scale ratio
- `detectBorderShadowPatterns()` - Border-radius and box-shadow categorization (small/medium/large/pill)

#### `content/injector.js` - CSS Injection
- `injectEarly(css)` - Immediate injection (for saved themes on load)
- `inject(css)` - Standard injection
- `injectWithTransition(css)` - Smooth fade transition
- `remove()` - Clean removal

#### `content/ui.js` - Inline UI Panel
- Floating panel in top-right corner
- Uses Shadow DOM for style isolation from page themes
- Shows current theme name, preview colors
- Theme list with rename/delete buttons always visible
- Handles generate/clear/undo/apply/cancel actions
- Timer shows generation progress
- Settings panel (sliders icon) for keybinds and sound toggle
- Multiple keybind support (Ctrl+Shift+P, Alt+Shift+P, Ctrl+Shift+Y)
- Cross-platform keybind display (⌘⇧P on Mac vs Ctrl+Shift+P)

Callbacks:
- `onGenerate(prompt, onStatus)` - Generate new theme
- `onSwitchTheme(themeId)` - Switch active theme
- `onRenameTheme(themeId, newName)` - Rename a theme
- `onDeleteTheme(themeId)` - Delete a theme
- `onDisableThemes()` - Disable all themes for site
- `onApplyPreview(css, saveAsNew)` - Confirm preview
- `onCancelPreview()` - Revert preview
- `onRevert()` - Undo to previous version

### Library Modules

#### `lib/storage.js` - Persistence
Storage keys:
- `themes:{hostname}` - Array of themes per site
- `activeTheme:{hostname}` - Currently active theme ID
- `paintbrush:corrections` - Undo tracking for learning
- `paintbrush:settings` - User settings (API key, soundEnabled)
- `paintbrush:keybinds` - Enabled keyboard shortcuts

Theme object structure:
```javascript
{
  hostname: "example.com",
  prompt: "dark mode with blue accents",
  css: "/* generated CSS */",
  name: "Dark Mode Blue",      // Auto-generated or custom
  colors: ["#1a1a2e", "#16213e", "#0f3460"],  // For icon
  createdAt: 1234567890,
  updatedAt: 1234567890,
  previousCSS: "/* for undo */",
  previousPrompt: "previous prompt",
  previousName: "Previous Name"
}
```

#### `lib/prompter.js` - Prompt Construction
- `buildPrompt(request, analysis, existing, corrections)` - New theme
- `buildRefinementPrompt(request, analysis, existing, corrections)` - Updates

Prompts include:
- Site context (hostname, structure, current colors)
- CSS variables found on page
- Detected features (cards, tables, etc.)
- Past corrections (what user rejected)
- data-testid selectors for precise targeting (v1.3.0)
- aria-label selectors for purpose-based targeting (v1.3.0)
- Framework-specific guidance (Tailwind utilities, Bootstrap classes, etc.)
- CSS-in-JS warnings with recommendation to use stable selectors
- Responsive breakpoints for theme consideration
- Animation/transition info to preserve
- Z-index layer hierarchy for modals/overlays
- Element types for complete styling coverage (v1.4.0)
- Icon/SVG info with styling recommendations (v1.4.0)
- Form element details (input types, states, structure) (v1.4.0)
- Color harmony analysis (roles, semantic colors, scheme type) (v1.4.0)
- Pseudo-element info (::before/::after selectors) (v1.4.0)
- Style inheritance chain (root styles, font cascade) (v1.4.0)
- Spacing system (detected scale, common values) (v1.4.0)
- Typography scale (heading sizes, ratio, line heights) (v1.4.0)
- Border/shadow patterns (radius categories, shadow levels) (v1.4.0)

Prompt improvements (v1.5.0):
- Critical rules for never making elements invisible
- Featured content/special panels guidance (AI Overview, snippets, knowledge panels)
- Visual depth & polish (box-shadows, borders, border-radius)
- Better SVG/icon visibility requirements
- Button styling balance (visibility vs restraint)
- Secondary text/metadata visibility
- Code block contrast requirements

#### `lib/generator.js` - Claude API
- Model: `claude-haiku-4-5-20251001`
- `generate(system, user)` - Full theme generation
- `generateHidingCSS(elements, context)` - Fast path for hiding
- `cleanCSS(css)` - Remove markdown fences, explanations
- `repairCSS(css)` - Fix brace mismatches
- `validateCSS(css)` - Basic validation

#### `lib/sounds.js` - UI Sound Effects
Uses Web Audio API to play melodic arpeggios for UI feedback.

Sound triggers:
- `playStart()` - Minor arpeggio up (A C E) - when generation begins
- `playSuccess()` - Major arpeggio up (C E G) - when generation completes
- `playApply()` - Major + octave (C E G C5) - when applying/selecting theme
- `playCancel()` - Minor arpeggio down (E C A) - when canceling

Implementation:
- Pure Web Audio API (no dependencies)
- Lazy AudioContext initialization
- Notes played as sine waves with 70ms intervals
- Volume and envelope tuned for pleasant, non-intrusive feedback
- Can be disabled via `setEnabled(false)` or in UI settings

## Key Flows

### New Theme Generation
1. User opens UI (Ctrl+Shift+P)
2. User enters prompt
3. `Analyzer.analyze()` scans page
4. `Prompter.buildPrompt()` constructs prompt
5. `Generator.generate()` calls Claude API
6. CSS cleaned and validated
7. `Injector.injectWithTransition()` applies preview
8. User clicks "Apply Theme" to save

### Theme Refinement
1. User has existing theme
2. User enters refinement ("make links brighter")
3. `Prompter.buildRefinementPrompt()` includes full existing CSS
4. Claude modifies existing theme
5. Preview shown, user confirms

### Fast Hiding Path
1. User says "hide ads" (detected by `isHidingRequest()`)
2. `Generator.generateHidingCSS()` generates only hiding rules
3. Rules appended to existing CSS (not replaced)
4. Much faster (~3s vs ~15s)

### Undo & Learning
1. User clicks "Undo"
2. `Storage.revertTheme()` restores previous CSS
3. Correction recorded: `{ rejectedPrompt, acceptedPrompt }`
4. Future prompts include corrections to avoid similar mistakes

## Design Decisions

### Why Haiku?
- Fast enough for interactive use (~10-15s)
- Cost-effective for frequent regeneration
- Quality sufficient for CSS generation

### Why Preview?
- Themes can be dramatic changes
- Let user see colors before committing
- Easy cancel if wrong

### Why Fast Path for Hiding?
- Common use case (ads, popups)
- Doesn't need full regeneration
- Append-only preserves existing theme

### CSS Injection Strategy
- Use `<style>` element with high specificity
- `!important` on colors to override site styles
- Avoid `!important` on layout to prevent breaking
- MutationObserver to handle dynamic content

## UI Design

The UI uses a warm, artistic color palette:
- Primary: Terracotta/coral `#d4856a`
- Backgrounds: Warm dark browns
- Softer border radius (5-6px)
- Relaxed, studio-like feel

## API Key

Users must provide their own Anthropic API key in the settings panel (click the gear icon in the Paintbrush UI). Get a key at [console.anthropic.com](https://console.anthropic.com/).

## Testing

### Manual Testing
Test on diverse sites:
- Simple: example.com
- Complex: Hacker News, Stack Overflow, Wikipedia
- Heavy: BBC, news sites with ads
- Apps: GitHub, web apps
- CSS-in-JS: X/Twitter, modern React apps
- Search: Google (test AI Overview visibility)
- Video: YouTube (test sidebar icons, action buttons)

Check for:
- Theme applies correctly
- Refinements preserve existing theme
- Undo works
- Preview/cancel reverts properly
- Fast path triggers on hiding requests

### Automated Tests
The `extension/tests/` directory contains browser-based tests for the analyzer:

```
extension/tests/
├── test.html         # Test runner page
├── test-utils.js     # Simple test framework (describe/test/assert)
├── fixtures.js       # HTML fixtures mimicking real sites
└── analyzer.test.js  # Comprehensive analyzer tests
```

Run tests by opening `extension/tests/test.html` in a browser (serve via local HTTP server).

Test coverage includes:
- Basic analysis (colors, selectors, structure)
- data-testid extraction and deduplication
- aria-label extraction with element types
- DOM snapshot generation
- Element context mapping
- Framework detection (Tailwind, Bootstrap, React, Vue, MUI)
- Media query extraction
- Animation/transition detection
- Shadow DOM detection
- CSS-in-JS pattern detection
- Z-index layer mapping
- Complete element coverage (v1.4.0)
- SVG/icon detection (v1.4.0)
- Enhanced form detection (v1.4.0)
- Color harmony analysis (v1.4.0)
- Pseudo-element detection (v1.4.0)
- Style inheritance tracking (v1.4.0)
- Spacing pattern detection (v1.4.0)
- Typography scale detection (v1.4.0)
- Border/shadow pattern detection (v1.4.0)

Total: 103 automated tests
