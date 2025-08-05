/* ========== 1. 最新版本 ========== */
const META_URL = 'https://api.tiktokrepostremover.com/cdn/selectors';
const CONTENT_SCRIPTS = [
  "modules/config.js",
  "modules/state.js",
  "modules/ui.js",
  "modules/workflow.js",
  "modules/comm.js",
  "main.js"
];

/**
 * 确保内容脚本被注入到指定的标签页中。
 * 如果脚本已存在，则直接返回 true。
 * 如果脚本不存在，则尝试注入，成功后返回 true，失败则返回 false。
 * @param {number} tabId - 目标标签页的ID
 * @returns {Promise<boolean>} - 脚本是否就绪
 */
async function ensureScriptsInjected(tabId) {
  try {
    // 1. 尝试 Ping
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    if (response?.status === 'pong') {
      console.log(`[ClearTok BG] Scripts already exist in tab ${tabId}.`);
      return true; // 脚本已存在
    }
  } catch (e) {
    // 2. Ping 失败 (通常是 Receiving end does not exist)
    console.log(`[ClearTok BG] Scripts not found in tab ${tabId}. Injecting...`);
    try {
      // 尝试注入
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: CONTENT_SCRIPTS,
      });
      // 短暂等待脚本初始化
      await new Promise(r => setTimeout(r, 500));
      console.log(`[ClearTok BG] Scripts injected successfully into tab ${tabId}.`);
      return true; // 注入成功
    } catch (injectionError) {
      console.error(`Failed to inject scripts into tab ${tabId}:`, injectionError);
      return false; // 注入失败
    }
  }
  // 如果 Ping 成功但回复不是 pong，也视为异常情况
  return false;
}

/* ========== 2. 比对并更新 ========== */
async function checkMetaAndUpdate(force = false) {
  const { selectorsMeta } = await chrome.storage.local.get('selectorsMeta');

  /* 60 秒内已检查过且没强制刷新 → 直接返回 */
  if (!force && selectorsMeta && Date.now() - selectorsMeta.fetchedAt < 60_000) {
    return;
  }

  /* ---------- 1. 拉取单一 JSON ---------- */
  let meta;
  try {
    const res = await fetch(META_URL, { cache: 'no-cache' });
    if (!res.ok) return;                 // 网络错误 / 404
    meta = await res.json();
  } catch (e) {
    console.warn('[ClearTok] fetch selectors meta failed:', e);
    return;
  }

  /* ---------- 2. 基本字段校验 ---------- */
  if (!meta?.version || !meta?.selectors) {
    console.warn('[ClearTok] meta file missing version or selectors');
    return;
  }

  /* ---------- 3. 版本一样就跳过 ---------- */
  if (selectorsMeta?.version === meta.version) {
    console.log('[ClearTok] selectors already up-to-date →', meta.version);
    return;
  }

  /* ---------- 4. 写入缓存 ---------- */
  await chrome.storage.local.set({
    selectors    : meta.selectors,
    selectorsMeta: { version: meta.version, fetchedAt: Date.now() }
  });
  console.log('[ClearTok] selectors upgraded →', meta.version);

  /* ---------- 5. 通知所有 TikTok 页热替换 ---------- */
  const tabs = await chrome.tabs.query({ url: '*://*.tiktok.com/*' });
  tabs.forEach(t =>
    chrome.tabs.sendMessage(t.id, { action: 'selectorsUpdated' }).catch(() => {})
  );
}

/* ========== 3. 安装 / 启动触发一次 ========== */
chrome.runtime.onStartup?.addListener(() => checkMetaAndUpdate(true));


// Initialize side panel when extension is installed or enabled
chrome.runtime.onInstalled.addListener(() => {
  console.log("ClearTok extension installed");
  checkMetaAndUpdate(true);
  
  // Initialize side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Track processed messages to prevent duplicates
const processedMessages = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);
  
  // Create a unique identifier for the message
  const messageId = `${message.action}_${message.timestamp || Date.now()}_${message.instanceId || 'default'}_${sender.tab?.id || 'popup'}`;
  
  // Check for duplicate messages
  if (processedMessages.has(messageId)) {
    console.log('Duplicate message in background, skipping:', messageId);
    return;
  }
  
  // Check for similar recent messages
  const now = Date.now();
  const recentSimilar = Array.from(processedMessages).some(id => {
    const parts = id.split('_');
    if (parts[0] === message.action && parts[3] === (sender.tab?.id || 'popup').toString()) {
      const msgTime = parseInt(parts[1]);
      return Math.abs(msgTime - (message.timestamp || now)) < 300; // 300ms window
    }
    return false;
  });
  
  if (recentSimilar) {
    console.log('Similar recent message in background, skipping:', messageId);
    return;
  }
  
  // Mark this message as processed
  processedMessages.add(messageId);
  
  // Clean up old message IDs periodically
  if (processedMessages.size > 200) {
    const ids = Array.from(processedMessages);
    ids.slice(0, 100).forEach(id => processedMessages.delete(id));
  }
  
  if (message.action === 'ensureAndCheckLogin') {
    (async () => {
      const isReady = await ensureScriptsInjected(message.tabId);
      if (isReady) {
        chrome.tabs.sendMessage(message.tabId, { action: 'checkLoginStatus' });
      }
    })();
    return; // 无需同步返回
  }
  if (message.action === 'ensureSelectors') {
    checkMetaAndUpdate().then(() => sendResponse({ ok: true }));
    return true;  // 让 Chrome 知道是异步
  } else if (message.action === "removeRepostedVideos") {
    handleRemoveRepostedVideos(message);
  } else if (message.action === "pauseRemoval" || message.action === "resumeRemoval") {
    // Forward pause/resume commands to content script
    forwardToTikTokTab(message);
  } else {
    // Forward other messages to popup (status updates, progress, etc.)
    // Only forward if the message came from a content script (has sender.tab)
    if (sender.tab && message.action !== 'videoRemoved') {
      forwardToPopup(message);
    }
  }
});

async function handleRemoveRepostedVideos(message) {
  try {
    const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
    let tab;

    if (tabs.length === 0) {
      tab = await chrome.tabs.create({ url: "https://www.tiktok.com/", active: true });
      // 给新标签页足够的时间加载
      await new Promise(resolve => setTimeout(resolve, 3000)); 
    } else {
      tab = tabs[tabs.length - 1];
      await chrome.tabs.update(tab.id, { active: true });
    }

    // ▼▼▼ 看，现在多么简洁！▼▼▼
    const isReady = await ensureScriptsInjected(tab.id);

    if (isReady) {
      // 脚本就绪，直接发送指令
      chrome.tabs.sendMessage(tab.id, { action: 'startRemoval' });
    } else {
      // 错误处理
      chrome.runtime.sendMessage({ 
        action: 'error', 
        message: 'Failed to prepare content scripts for removal process.'
      });
    }
    // ▲▲▲ 代码变得非常清晰 ▲▲▲

  }  catch (error) {
    console.error('Error handling remove reposts:', error);
    chrome.runtime.sendMessage({ 
      action: 'error', 
      message: 'Failed to start removal process',
      error: error.toString() 
    });
  }
}

async function forwardToTikTokTab(message) {
  try {
    const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  } catch (error) {
    console.error('Error forwarding message to TikTok tab:', error);
  }
}

function forwardToPopup(message) {
  try {
    // Try to send to any listening popups/sidepanels
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors if no popup is listening
    });
  } catch (error) {
    console.error('Error forwarding message to popup:', error);
  }
}
