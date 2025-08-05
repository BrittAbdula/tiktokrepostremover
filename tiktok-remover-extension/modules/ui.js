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
  async waitForElement(selectorKey, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 200;
      const endTime = Date.now() + timeout;

      const check = () => {
        const element = this.findElement(selectorKey);
        if (element) {
          resolve(element);
        } else if (Date.now() > endTime) {
          reject(new Error(`[ClearTok] Timeout waiting for element with key: "${selectorKey}"`));
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
   * @param {function(number)} onProgress - 回调函数，用于报告进度
   * @returns {Promise<number>} - 返回找到的元素总数
   */
  async autoScrollToBottom(itemSelectorKey, onProgress) {
    return new Promise(async (resolve) => {
        let totalItems = 0;
        let lastHeight = 0;
        let noChangeCount = 0;
        const maxNoChangeCount = 2; // 连续2次高度不变则认为到底

        const scrollInterval = setInterval(() => {
            window.scrollTo(0, document.body.scrollHeight);
            
            const currentItems = this.findAllElements(itemSelectorKey);
            if (currentItems.length > totalItems) {
                totalItems = currentItems.length;
                if(onProgress) onProgress(totalItems);
            }

            const currentHeight = document.body.scrollHeight;
            if (currentHeight === lastHeight) {
                noChangeCount++;
            } else {
                noChangeCount = 0;
                lastHeight = currentHeight;
            }

            if (noChangeCount >= maxNoChangeCount) {
                clearInterval(scrollInterval);
                // 最后再确认一次数量
                const finalItems = this.findAllElements(itemSelectorKey);
                resolve(finalItems.length);
            }
        }, 1500); // 每1.5秒滚动一次

        // 设置一个超时保护
        setTimeout(() => {
            clearInterval(scrollInterval);
            const finalItems = this.findAllElements(itemSelectorKey);
            console.warn('[ClearTok] Auto-scroll timed out.');
            resolve(finalItems.length);
        }, 120000); // 2分钟超时
    });
  }
}