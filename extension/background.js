// Paintbrush Background Service Worker

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_paintbrush') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'show-ui' });
    }
  }
});

// Listen for extension icon click (if popup is not set)
chrome.action.onClicked?.addListener(async (tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'show-ui' });
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'log') {
    console.log('[Paintbrush]', message.data);
  }

  if (message.action === 'get-all-themes') {
    // Forward to content script or handle directly
    sendResponse({ success: true });
  }

  return false;
});

// On install, log
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Paintbrush] Installed:', details.reason);
});
