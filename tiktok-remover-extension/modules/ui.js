// /modules/ui.js

class UIManager {
  /**
   * @param {ConfigManager} config - 配置模块的实例
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * 查找单个元素，支持多个选择器
   * @param {string} selectorKey - 在config中定义的键
   * @param {Element} parent - 父元素，默认为 document
   * @returns {Element|null}
   */
  findElement(selectorKey, parent = document) {
    const selectors = this.config.get(selectorKey);
    if (!selectors) return null;

    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    for (const selector of selectorList) {
      try {
        const element = parent.querySelector(selector);
        if (element) return element;
      } catch (error) {
        console.error(`[ClearTok] Invalid selector: "${selector}" from key "${selectorKey}"`, error);
      }
    }
    return null;
  }

  /**
   * 查找所有匹配的元素
   * @param {string} selectorKey
   * @param {Element} parent
   * @returns {NodeListOf<Element>}
   */
  findAllElements(selectorKey, parent = document) {
    const selectors = this.config.get(selectorKey);
    if (!selectors) return document.querySelectorAll(''); // 返回空的NodeList
    const selectorString = Array.isArray(selectors) ? selectors.join(', ') : selectors;
    return parent.querySelectorAll(selectorString);
  }


  /**
   * 通过文本内容查找元素
   * @param {string} selectorKey 
   * @param {string} text 
   * @param {boolean} caseSensitive 
   * @returns {Element|null}
   */
  findByText(selectorKey, text, caseSensitive = false) {
    const elements = this.findAllElements(selectorKey);
    const targetText = caseSensitive ? text : text.toLowerCase();

    for (const element of elements) {
      const elementText = element.textContent?.trim() || '';
      const comparableText = caseSensitive ? elementText : elementText.toLowerCase();
      if (comparableText.includes(targetText)) {
        return element;
      }
    }
    return null;
  }

  /**
   * 等待元素出现
   * @param {string} selectorKey
   * @param {number} timeout
   * @returns {Promise<Element>}
   */
  // 超时时原来是 reject(...) → 改成发送上报消息后 resolve(null)
  async waitForElement(selectorKey, timeout = 10000) {
    return new Promise((resolve) => {
      const interval = 200;
      const endTime = Date.now() + timeout;

      const check = () => {
        const element = this.findElement(selectorKey);
        if (element) {
          resolve(element);
        } else if (Date.now() > endTime) {
          try {
            chrome.runtime?.sendMessage({
              action: 'uiWaitTimeout',
              selectorKey,
              timeout,
              url: window.location.href
            });
          } catch (_) { }
          resolve(null);
        } else {
          setTimeout(check, interval);
        }
      };
      check();
    });
  }

  /**
   * 点击一个元素
   * @param {string} selectorKey
   * @returns {Promise<boolean>} 是否成功
   */
  async click(selectorKey) {
    try {
      const element = await this.waitForElement(selectorKey, 5000);
      if (element) {
        element.click();
        return true;
      }
    } catch (error) {
      console.error(`[ClearTok] Failed to click element with key "${selectorKey}":`, error);
    }
    return false;
  }

  /**
   * 异步等待
   * @param {number} ms - 毫秒
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取元素的文本内容
   * @param {string} selectorKey
   * @returns {string}
   */
  getText(selectorKey) {
    const element = this.findElement(selectorKey);
    return element ? element.textContent.trim() : '';
  }

  /**
   * 自动滚动页面到底部以加载所有内容
   * 仅在两次时机触发回调：
   * 1) 第一次检测到内容数量（首次滚动后）
   * 2) 最终完成时
   * @param {function(number)} onProgress - 回调函数（最多回调两次：首次与最终）
   * @returns {Promise<number>} - 返回找到的元素总数
   */
  async autoScrollToBottom(itemSelectorKey, onProgress) {
    return new Promise(async (resolve) => {
      let totalItems = 0;
      let lastHeight = 0;
      let noChangeCount = 0;
      const maxNoChangeCount = 2;
      let finished = false;
      let firstProgressReported = false;
      let tickCount = 0;

      const finalize = () => {
        if (finished) return;
        finished = true;
        clearInterval(scrollInterval);
        clearTimeout(timeoutId);
        const finalItems = this.findAllElements(itemSelectorKey);
        if (onProgress) onProgress(finalItems.length, true);
        resolve(finalItems.length);
      };

      const scrollInterval = setInterval(() => {
        tickCount += 1;
        window.scrollTo(0, document.body.scrollHeight);

        const currentItems = this.findAllElements(itemSelectorKey);
        // 第一次滚动后，无论数量多少都回调一次
        if (!firstProgressReported && tickCount === 1) {
          firstProgressReported = true;
          if (onProgress) onProgress(currentItems.length, false);
        }
        if (currentItems.length > totalItems) {
          totalItems = currentItems.length;
        }

        const currentHeight = document.body.scrollHeight;
        if (currentHeight === lastHeight) {
          noChangeCount++;
        } else {
          noChangeCount = 0;
          lastHeight = currentHeight;
        }

        if (noChangeCount >= maxNoChangeCount) {
          finalize();
        }
      }, 1500);

      const timeoutId = setTimeout(() => {
        console.warn('[ClearTok] Auto-scroll timed out.');
        finalize();
      }, 120000);
    });
  }
}
