const STORAGE_KEY = 'transparentScrollbarBlockedDomains';

const getActiveTab = () =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });

const getBlocked = () =>
  new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      resolve(new Set(res[STORAGE_KEY] || []));
    });
  });

const setBlocked = (blockedSet) =>
  new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: Array.from(blockedSet) }, resolve);
  });

const updateStatus = (text) => {
  const el = document.getElementById('status');
  el.textContent = text;
};

const renderBlockedList = async (blocked) => {
  const listEl = document.getElementById('blockedList');
  listEl.innerHTML = '';
  const items = Array.from(blocked).sort();

  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'blocked-empty';
    li.textContent = '暂无禁用域名';
    listEl.appendChild(li);
    return;
  }

  items.forEach((host) => {
    const li = document.createElement('li');
    li.textContent = host;
    listEl.appendChild(li);
  });
};

const init = async () => {
  const tab = await getActiveTab();
  if (!tab?.url) {
    updateStatus('无法获取当前标签页 URL');
    return;
  }

  const url = new URL(tab.url);
  const host = url.hostname;
  const domainInfo = document.getElementById('domainInfo');
  domainInfo.textContent = host;

  const toggle = document.getElementById('toggleScrollbar');
  const blocked = await getBlocked();
  toggle.checked = !blocked.has(host);
  updateStatus(toggle.checked ? '当前域名已开启' : '当前域名已关闭');
  await renderBlockedList(blocked);

  toggle.addEventListener('change', async () => {
    const nextBlocked = await getBlocked();
    if (toggle.checked) {
      nextBlocked.delete(host);
      updateStatus('已开启，正在刷新…');
    } else {
      nextBlocked.add(host);
      updateStatus('已关闭，正在刷新…');
    }
    await setBlocked(nextBlocked);
    chrome.tabs.reload(tab.id);
    window.close();
  });
};

document.addEventListener('DOMContentLoaded', init);

