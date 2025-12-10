// content.js
// Ensure OverlayScrollbars is loaded from the vendor file

// https://github.com/KingSora/OverlayScrollbars

const STORAGE_KEY = 'transparentScrollbarBlockedDomains';

const config = {
  scrollbars: {
    theme: 'os-theme-custom',
    clickScroll: false,
    dragScroll: true,
    autoHide: 'never'
  }
};

const shouldEnableOnHost = async (host) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const blocked = new Set(result[STORAGE_KEY] || []);
      resolve(!blocked.has(host));
    });
  });
};

const initScrollbar = async () => {
  const host = window.location.hostname;
  const enabled = await shouldEnableOnHost(host);
  if (!enabled) return;

  const globalApi = window.OverlayScrollbarsGlobal;
  if (!globalApi || !globalApi.OverlayScrollbars) return;

  globalApi.OverlayScrollbars(document.body, {
    ...config,
    nativeScrollbarsOverlaid: {
      initialize: false
    }
  });


};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollbar, { once: true });
} else {
  initScrollbar();
}
