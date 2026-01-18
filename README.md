# Paintbrush

Repaint any website! Sometimes breaks!

## Requirements

**You need an Anthropic API key to use this extension.**

1. Get your API key at [console.anthropic.com](https://console.anthropic.com/)
2. Add it in the extension settings (click the gear icon in the Paintbrush UI)

> **Cost note:** Each theme generation uses Claude Haiku and costs approximately $0.01-0.03 USD. Refinements and hiding requests are cheaper.

## Installation

### Chrome

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. Click the Paintbrush icon and add your API key in settings
7. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) on any site to start

### Firefox

1. Run the build script: `./firefox/build.sh`
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Select `firefox/manifest.json`
6. Use `Alt+Shift+P` or `Ctrl+Shift+Y` (`Ctrl+Shift+P` opens Private Browsing in Firefox)

Note: Firefox temporary add-ons are removed when the browser closes.

## Quick Start

1. **Open any website** you want to restyle
2. **Press `Ctrl+Shift+P`** to open Paintbrush
3. **Describe the theme** you want (e.g., "dark mode with blue accents")
4. **Preview** the generated theme
5. **Click "Apply Theme"** to save, or "Cancel" to revert

The theme will automatically apply every time you visit that site.

## Example Prompts

**Full themes:**
- "dark mode with purple accents"
- "sepia tones, easy on the eyes for night reading"
- "high contrast black and white"
- "cozy warm colors, like a coffee shop"

**Refinements:**
- "make the links more visible"
- "hide ads"
- "remove the newsletter popup"
- "make headings larger"

## Features

- **Preview before applying** - See color swatches and live preview before saving
- **Smart refinements** - Describe changes to update your existing theme
- **Fast hiding** - "hide ads" uses a quick append-only path (~3s vs ~15s)
- **Undo** - Revert to your previous theme anytime
- **Multiple themes per site** - Create and switch between different looks
- **Persistent** - Themes auto-apply on every visit

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Toggle Paintbrush UI |
| `Alt+Shift+P` | Toggle Paintbrush UI (alternate) |
| `Ctrl+Shift+Y` | Toggle Paintbrush UI (alternate) |

Shortcuts can be enabled/disabled in the settings panel.

## Limitations

- **CSS only** - Paintbrush injects CSS; it cannot modify page structure or block network requests
- **Site compatibility** - Some sites with heavy CSS-in-JS, Shadow DOM, or aggressive styling may not theme perfectly
- **Not an ad blocker** - "Hide ads" hides elements visually but ads still load and track

## How It Works

1. **Analyzer** - Scans the page for colors, structure, CSS variables, frameworks
2. **Prompter** - Builds a detailed prompt with all site context
3. **Generator** - Calls Claude Haiku to generate CSS
4. **Injector** - Applies CSS with smooth transitions
5. **Storage** - Saves themes per-hostname for persistence

## Development

See [CLAUDE.md](CLAUDE.md) for code structure and architecture details.

```
extension/
├── manifest.json       # Chrome MV3 manifest
├── background.js       # Service worker
├── lib/
│   ├── storage.js      # Theme persistence
│   ├── sounds.js       # UI sound effects
│   ├── prompter.js     # Prompt construction
│   └── generator.js    # Claude API calls
├── content/
│   ├── analyzer.js     # Page analysis
│   ├── injector.js     # CSS injection
│   ├── ui.js           # Inline UI panel
│   └── index.js        # Main orchestrator
└── popup/              # Extension popup
```

## License

MIT License - see [LICENSE](LICENSE)

---

Built with [Claude](https://claude.ai)
