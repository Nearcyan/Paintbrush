// Paintbrush Popup
// Theme management interface with multi-theme support

// Chrome/Firefox compatibility
const browser = globalThis.browser || globalThis.chrome;

// Platform detection
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const keybindDisplay = isMac ? '⌘⇧P' : 'Ctrl+Shift+P';

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  let hostname = '';

  try {
    hostname = new URL(tab.url).hostname;
  } catch (e) {
    hostname = 'N/A';
  }

  // Display current site
  document.getElementById('site-hostname').textContent = hostname;

  // Check themes for current site
  const themes = await getThemes(hostname);
  const activeThemeId = await getActiveThemeId(hostname);
  const statusEl = document.getElementById('site-status');

  if (themes.length > 0) {
    statusEl.textContent = `${themes.length} theme${themes.length > 1 ? 's' : ''}`;
    statusEl.className = 'site-status themed';
  } else {
    statusEl.textContent = 'no themes';
    statusEl.className = 'site-status no-theme';
  }

  // Open UI button
  document.getElementById('open-ui').addEventListener('click', async () => {
    await browser.tabs.sendMessage(tab.id, { action: 'show-ui' });
    window.close();
  });

  // Set platform-aware keybind hint
  document.getElementById('keybind-hint').textContent = `${keybindDisplay} on any page`;

  // Load all themes grouped by hostname
  await loadAllThemes();
});

async function getThemes(hostname) {
  const result = await browser.storage.local.get(`themes:${hostname}`);
  return result[`themes:${hostname}`] || [];
}

async function getActiveThemeId(hostname) {
  const result = await browser.storage.local.get(`activeTheme:${hostname}`);
  return result[`activeTheme:${hostname}`] || null;
}

async function loadAllThemes() {
  const all = await browser.storage.local.get(null);
  const hostnames = [];

  // Collect all hostnames with themes
  for (const key of Object.keys(all)) {
    if (key.startsWith('themes:')) {
      const hostname = key.replace('themes:', '');
      const themes = all[key];
      const activeId = all[`activeTheme:${hostname}`];

      if (themes.length > 0) {
        hostnames.push({
          hostname,
          themes,
          activeId,
        });
      }
    }
  }

  // Sort by most recent activity
  hostnames.sort((a, b) => {
    const aMax = Math.max(...a.themes.map(t => t.updatedAt || 0));
    const bMax = Math.max(...b.themes.map(t => t.updatedAt || 0));
    return bMax - aMax;
  });

  renderThemesList(hostnames);
}

function renderThemesList(hostnames) {
  const container = document.getElementById('themes-list');

  if (hostnames.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No themes yet</p>
        <p>Press ${keybindDisplay} on any page to create one</p>
      </div>
    `;
    return;
  }

  container.innerHTML = hostnames.map(({ hostname, themes, activeId }) => `
    <div class="site-group" data-hostname="${escapeHTML(hostname)}">
      <div class="site-header">
        <span class="site-name">${escapeHTML(hostname)}</span>
        <span class="site-count">${themes.length}</span>
      </div>
      <div class="site-themes">
        ${themes.map(theme => `
          <div class="theme-item ${theme.id === activeId ? 'theme-item--active' : ''}"
               data-hostname="${escapeHTML(hostname)}"
               data-theme-id="${theme.id}">
            ${renderThemeIcon(theme.colors)}
            <div class="theme-info">
              <div class="theme-name">${escapeHTML(theme.name || 'Custom Theme')}</div>
            </div>
            <div class="theme-actions">
              ${theme.id === activeId
                ? '<span class="theme-active-badge">active</span>'
                : '<button class="theme-btn activate" title="Activate">▶</button>'
              }
              <button class="theme-btn edit" title="Rename">✎</button>
              <button class="theme-btn delete" title="Delete">×</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="site-actions">
        <button class="site-btn visit">Visit site ↗</button>
        ${activeId ? '<button class="site-btn disable">Disable</button>' : ''}
      </div>
    </div>
  `).join('');

  // Add event listeners
  bindEvents(container);
}

function bindEvents(container) {
  container.querySelectorAll('.site-group').forEach(group => {
    const hostname = group.dataset.hostname;

    // Visit site
    group.querySelector('.visit')?.addEventListener('click', () => {
      browser.tabs.create({ url: `https://${hostname}` });
      window.close();
    });

    // Disable themes for site
    group.querySelector('.disable')?.addEventListener('click', async () => {
      await browser.storage.local.remove(`activeTheme:${hostname}`);
      await loadAllThemes();
    });

    // Theme actions
    group.querySelectorAll('.theme-item').forEach(item => {
      const themeId = item.dataset.themeId;

      // Activate theme
      item.querySelector('.activate')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await browser.storage.local.set({ [`activeTheme:${hostname}`]: themeId });
        await loadAllThemes();
      });

      // Rename theme
      item.querySelector('.edit')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const currentName = item.querySelector('.theme-name')?.textContent || '';
        const newName = prompt('Rename theme:', currentName);
        if (newName && newName !== currentName) {
          const themes = await getThemes(hostname);
          const theme = themes.find(t => t.id === themeId);
          if (theme) {
            theme.name = newName;
            theme.updatedAt = Date.now();
            await browser.storage.local.set({ [`themes:${hostname}`]: themes });
            await loadAllThemes();
          }
        }
      });

      // Delete theme
      item.querySelector('.delete')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const themeName = item.querySelector('.theme-name')?.textContent || 'this theme';
        if (confirm(`Delete "${themeName}"?`)) {
          const themes = await getThemes(hostname);
          const filtered = themes.filter(t => t.id !== themeId);
          await browser.storage.local.set({ [`themes:${hostname}`]: filtered });

          // If deleted theme was active, clear active
          const activeId = await getActiveThemeId(hostname);
          if (activeId === themeId) {
            await browser.storage.local.remove(`activeTheme:${hostname}`);
          }

          await loadAllThemes();
        }
      });
    });
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function renderThemeIcon(colors) {
  let bg = 'var(--primary)';

  if (colors && colors.length > 0) {
    if (colors.length === 1) {
      bg = colors[0];
    } else {
      bg = `linear-gradient(135deg, ${colors.join(', ')})`;
    }
  }

  return `<div class="theme-icon" style="background: ${bg}"></div>`;
}
