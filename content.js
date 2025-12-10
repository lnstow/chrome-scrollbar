// content.js
// Ensure OverlayScrollbars is loaded from the vendor file

// https://github.com/KingSora/OverlayScrollbars

const STORAGE_KEY = 'transparentScrollbarBlockedDomains';

const TOGGLE_BUTTON_ID = 'tsb-toggle-handle-button';

const config = {
  scrollbars: {
    theme: 'os-theme-custom',
    clickScroll: false,
    dragScroll: true,
    autoHide: 'never'
  }
};

const setupToggleButton = (instance) => {
  if (!instance?.elements || document.getElementById(TOGGLE_BUTTON_ID)) return;

  const elements = instance.elements?.() || {};
  const vertical = elements.scrollbarVertical;
  if (!vertical?.handle) return;

  let isHidden = false;

  const toggleButton = document.createElement('button');
  toggleButton.id = TOGGLE_BUTTON_ID;
  toggleButton.type = 'button';
  toggleButton.textContent = '>';

  const updateHandleVisibility = () => {
    const handleEl = vertical.handle;
    if (!handleEl) return;
    handleEl.style.opacity = isHidden ? '0' : '1';
    handleEl.style.pointerEvents = isHidden ? 'none' : '';

    const horizontal = elements.scrollbarHorizontal;
    if (horizontal?.handle) {
      horizontal.handle.style.opacity = isHidden ? '0' : '1';
      horizontal.handle.style.pointerEvents = isHidden ? 'none' : '';
    }
    toggleButton.textContent = isHidden ? '<' : '>';
  };

  toggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    isHidden = !isHidden;
    updateHandleVisibility();
  });

  updateHandleVisibility();
  document.body.appendChild(toggleButton);
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

  const instance = globalApi.OverlayScrollbars(document.body, {
    ...config,
    nativeScrollbarsOverlaid: {
      initialize: false
    }
  });

  setupToggleButton(instance);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollbar, { once: true });
} else {
  initScrollbar();
}
