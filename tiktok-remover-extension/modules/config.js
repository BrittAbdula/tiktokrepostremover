// /modules/config.js

class ConfigManager {
    constructor() {
      this.selectors = {};
    }
  
    /**
     * 初始化配置，从Chrome存储或后备文件加载选择器
     * @returns {Promise<void>}
     */
    async init() {
      try {
        const { selectors } = await chrome.storage.local.get('selectors');
        if (selectors && Object.keys(selectors).length > 0) {
          this.selectors = selectors;
          console.log('[ClearTok] Selectors loaded from storage.');
          // 异步检查更新，但不阻塞初始化
          this.listenForUpdates();
          return;
        }
      } catch (error) {
        console.error('[ClearTok] Error loading selectors from storage:', error);
      }
  
      // 如果存储中没有，则从后备文件加载
      const fallbackUrl = chrome.runtime.getURL('assets/selectors-fallback.json');
      console.log('[ClearTok] No selectors in storage, loading from fallback:', fallbackUrl);
      try {
        const res = await fetch(fallbackUrl);
        const json = await res.json();
        this.selectors = json.selectors;
        console.log('[ClearTok] Selectors loaded from fallback JSON.');
      } catch (error) {
        console.error('[ClearTok] Failed to load fallback selectors:', error);
      }
      this.listenForUpdates();
    }
  
    /**
     * 监听来自后台脚本的选择器更新消息
     */
    listenForUpdates() {
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === 'selectorsUpdated') {
          chrome.storage.local.get('selectors').then(({ selectors }) => {
            if (selectors) {
              this.selectors = selectors;
              console.log('[ClearTok] ✨ Selectors hot-reloaded!');
            }
            // 确认消息已处理
            sendResponse({ status: 'reloaded selectors' });
          });
          // 保持通道开放以进行异步响应
          return true;
        }
      });
    }
  
    /**
     * 获取指定键的选择器
     * @param {string} key - 例如 'video.title' 或 'navigation'
     * @returns {string|string[]|object|null}
     */
    get(key) {
      // 支持路径嵌套获取, e.g., "video.title"
      const keys = key.split('.');
      let result = this.selectors;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          console.warn(`[ClearTok] Selector key not found: ${key}`);
          return null;
        }
      }
      return result;
    }
  }