/* ================================================================
 *  1) 载入最新 SELECTORS（本地缓存 ➜ fallback JSON）
 * ================================================================ */
async function loadSelectors() {
  const { selectors } = await chrome.storage.local.get('selectors');
  if (selectors) {
    console.log('[DEBUG] selectors from storage', JSON.stringify(selectors, null, 2));
    return selectors;
  }

  const fallbackUrl = chrome.runtime.getURL('assets/selectors-fallback.json');
  console.log('[DEBUG] loading fallback selectors →', fallbackUrl);

  const res = await fetch(fallbackUrl);
  const json = await res.json();
  console.log('[DEBUG] selectors from fallback', JSON.stringify(json.selectors, null, 2));
  return json.selectors;
}


/* ================================================================
 *  2) SelectorUtils
 * ================================================================ */
// Helper function for random number generation
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (typeof window.SelectorUtils === 'undefined') {
  window.SelectorUtils = {
    // 尝试多个选择器，返回第一个找到的元素
    findElement: function (selectors, parent = document) {
      if (typeof selectors === 'string') {
        return parent.querySelector(selectors);
      }

      if (Array.isArray(selectors)) {
        for (const selector of selectors) {
          const element = parent.querySelector(selector);
          if (element) return element;
        }
      }

      return null;
    },

    // 通过文本内容查找元素
    findByText: function (selector, text, caseSensitive = false) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const elementText = element.textContent?.trim();
        if (!elementText) continue;

        if (caseSensitive) {
          if (elementText === text || elementText.includes(text)) {
            return element;
          }
        } else {
          const lowerText = elementText.toLowerCase();
          const lowerTarget = text.toLowerCase();
          if (lowerText === lowerTarget || lowerText.includes(lowerTarget)) {
            return element;
          }
        }
      }
      return null;
    },

    // 等待元素出现
    waitForElement: function (selectors, timeout = 10000, interval = 200) {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          const element = this.findElement(selectors);
          if (element) return resolve(element);
          if (Date.now() - start >= timeout) {
            return reject(new Error(`Timeout: Element not found`));
          }
          setTimeout(check, interval);
        };
        check();
      });
    }
  };
}


/* ================================================================
 *  3) **初始化：先异步加载 SELECTORS，再执行后续业务**
 * ================================================================ */
(async () => {
  /* ----------------- 3-1 赋值全局 SELECTORS ------------------ */
  // ★新增：确保下面的业务类拿到最新选择器
  window.SELECTORS = await loadSelectors();
  console.log('[ClearTok] SELECTORS initialized');

  /* ----------------- 3-2 热更新监听 -------------------------- */
  // ★监听：后台发现新版本时，热替换全局 SELECTORS
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'selectorsUpdated') {
      chrome.storage.local.get('selectors').then(({ selectors }) => {
        if (selectors) {
          console.log('[ClearTok] SELECTORS hot-reloaded', selectors);
          window.SELECTORS = selectors;
          console.log('[ClearTok] SELECTORS hot-reloaded');
        }
      });
    }
  });
  // Prevent duplicate script execution with stronger checks
  if (window.clearTokExtensionLoaded && window.clearTokRemover) {
    console.log('ClearTok script already loaded and instance exists, skipping...');
  } else {
    window.clearTokExtensionLoaded = true;

    /* ============================================================
   *  TikTokRepostRemover 业务类（整合滚动加载 & 人性化节奏）
   * ============================================================ */
    class TikTokRepostRemover {
      constructor() {
        // 直接使用全局变量
        this.selectors = window.SELECTORS;
        this.utils = window.SelectorUtils;
        this.isPaused = false;
        this.isRunning = false;
        this.removedCount = 0;
        this.totalReposts = 0;
        this.currentIndex = 0;
        this.pauseMessageSent = false; // Flag to prevent duplicate pause messages
        this.messageListenerAdded = false; // Flag to prevent duplicate listeners
        this.startTime = null; // Track when the removal process started

        // Remove any existing listener first
        if (chrome.runtime.onMessage.hasListeners()) {
          chrome.runtime.onMessage.removeListener(this.handleMessage.bind(this));
        }

        // Add message listener only once
        if (!this.messageListenerAdded) {
          chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
          this.messageListenerAdded = true;
        }
      }

      handleMessage = (message, sender, sendResponse) => {
        if (message.action === 'pauseRemoval') {
          this.isPaused = true;
          this.pauseMessageSent = false; // Reset when pausing
        } else if (message.action === 'resumeRemoval') {
          this.isPaused = false;
          this.pauseMessageSent = false; // Reset when resuming
          this.sendMessage('statusUpdate', { status: 'Resuming process...' });
          console.log('Process resumed by user');
        } else if (message.action === 'checkLoginStatus') {
          this.checkLoginStatus();
        } else if (message.action === 'startRemoval') {
          this.start();
        } else if (message.action === 'navigateToReposts') {
          this.navigateToRepostsTab();
        }
      }

      sendMessage(action, data = {}) {
        try {
          // Add a unique identifier to prevent duplicate processing
          const messageData = {
            action,
            ...data,
            timestamp: Date.now(),
            instanceId: this.instanceId || 'default'
          };
          chrome.runtime.sendMessage(messageData);
        } catch (error) {
          console.log('Failed to send message:', error);
        }
      }

      checkLoginStatus() {
        try {
          // 使用配置的选择器查找个人资料链接
          const profileLink = this.utils.findElement(this.selectors.loginStatus.profileLink);

          if (!profileLink) {
            this.sendMessage('loginStatusUpdate', {
              isLoggedIn: false,
              hasLoginButton: false,
              hasUserAvatar: false,
              method: 'profile-link-not-found'
            });
            console.log('Profile link not found');
            return;
          }

          const href = profileLink.getAttribute('href');

          // check if href exists and contains /@
          if (!href || !href.includes('/@')) {
            this.sendMessage('loginStatusUpdate', {
              isLoggedIn: false,
              hasLoginButton: false,
              hasUserAvatar: false,
              method: 'invalid-href'
            });
            console.log('Invalid href format:', href);
            return;
          }

          // extract the part after /@
          const usernamePart = href.split('/@')[1];

          // if there is content after @, then the user is logged in
          const isLoggedIn = usernamePart && usernamePart.trim().length > 0;

          // 使用配置的选择器检查头像和SVG图标
          const hasAvatar = profileLink.querySelector(this.selectors.loginStatus.avatarImage) !== null;
          const hasSvgIcon = profileLink.querySelector(this.selectors.loginStatus.svgIcon) !== null;

          this.sendMessage('loginStatusUpdate', {
            isLoggedIn: isLoggedIn,
            hasLoginButton: false,
            hasUserAvatar: hasAvatar,
            method: 'username-check',
            username: isLoggedIn ? usernamePart.trim() : null,
            hasAvatar: hasAvatar,
            hasSvgIcon: hasSvgIcon
          });

          console.log('Login status checked:', {
            isLoggedIn,
            username: isLoggedIn ? usernamePart.trim() : 'none',
            href: href,
            hasAvatar: hasAvatar,
            hasSvgIcon: hasSvgIcon
          });

        } catch (error) {
          console.error('Error checking login status:', error);
          this.sendMessage('loginStatusUpdate', {
            isLoggedIn: false,
            hasLoginButton: false,
            hasUserAvatar: false,
            method: 'error',
            error: error.toString()
          });
        }
      }

      async sleep(ms) {
        return new Promise(resolve => {
          const checkPause = () => {
            if (this.isPaused) {
              // If paused, check again after a short delay
              setTimeout(checkPause, 200);
            } else {
              // If not paused, continue with normal sleep
              setTimeout(resolve, ms);
            }
          };
          checkPause();
        });
      }

      async waitForElement(selector, timeout = 10000, interval = 200) {
        const start = Date.now();
        return new Promise((resolve, reject) => {
          const check = () => {
            // Check for pause before each element check
            while (this.isPaused) {
              setTimeout(check, interval);
              return;
            }

            const element = this.utils.findElement(selector);
            if (element) return resolve(element);
            if (Date.now() - start >= timeout) {
              return reject(new Error(`Timeout: Element not found`));
            }
            setTimeout(check, interval);
          };
          check();
        });
      }

      async waitWithProgress(seconds, message = 'Waiting') {
        for (let i = seconds; i > 0; i--) {
          // Check for pause and wait until resumed
          while (this.isPaused) {
            // Only send pause message once
            if (!this.pauseMessageSent) {
              this.sendMessage('waiting', { seconds: 'paused' });
              this.pauseMessageSent = true;
            }
            await this.sleep(500);
          }

          // Send countdown message
          this.sendMessage('waiting', { seconds: i });
          await this.sleep(1000);
        }
      }

      getVideoInfo() {
        try {
          const videoInfo = {
            title: '',
            url: window.location.href,
            author: ''
          };

          // 使用配置的选择器获取视频标题
          const titleElement = this.utils.findElement(this.selectors.video.title);
          if (titleElement && titleElement.textContent.trim()) {
            videoInfo.title = titleElement.textContent.trim();
          }

          // 使用配置的选择器获取作者信息
          const authorElement = this.utils.findElement(this.selectors.video.author);
          if (authorElement && authorElement.textContent.trim()) {
            let authorText = authorElement.textContent.trim();
            // Clean up author text
            if (!authorText.startsWith('@')) {
              authorText = '@' + authorText;
            }
            videoInfo.author = authorText;
          }

          // Fallback: try to extract from URL
          if (!videoInfo.author && videoInfo.url.includes('/@')) {
            const urlParts = videoInfo.url.split('/@');
            if (urlParts.length > 1) {
              const authorPart = urlParts[1].split('/')[0];
              if (authorPart) {
                videoInfo.author = '@' + authorPart;
              }
            }
          }

          // Fallback: try to extract from video ID in URL
          if (!videoInfo.title && videoInfo.url.includes('/video/')) {
            const videoId = videoInfo.url.split('/video/')[1]?.split('?')[0];
            if (videoId) {
              videoInfo.title = `Video ${videoId.substring(0, 8)}...`;
            }
          }

          // Truncate long titles
          if (videoInfo.title.length > 50) {
            videoInfo.title = videoInfo.title.substring(0, 50) + '...';
          }

          // Default values if nothing found
          if (!videoInfo.title) {
            videoInfo.title = 'Untitled video';
          }
          if (!videoInfo.author) {
            videoInfo.author = '@unknown';
          }

          return videoInfo;
        } catch (error) {
          console.log('Error getting video info:', error);
          return {
            title: 'Unknown video',
            url: window.location.href,
            author: '@unknown'
          };
        }
      }

      async clickProfileTab() {
        try {
          this.sendMessage('statusUpdate', { status: 'Navigating to profile...' });

          // First check if user is logged in
          this.checkLoginStatus();
          await this.sleep(1000);

          // 使用配置的选择器查找个人资料按钮
          const profileButton = await this.waitForElement(this.selectors.navigation.profileButton);
          profileButton.click();
          console.log("Successfully clicked the 'Profile' button.");

          this.sendMessage('statusUpdate', { status: 'Loading profile page...' });
          await this.waitWithProgress(3, 'Loading profile');
          return true;
        } catch (error) {
          this.stopScript("The 'Profile' button was not found. Please make sure you are logged in to TikTok.", error);
          return false;
        }
      }

      async autoScroll() {
        return new Promise((resolve, reject) => {
          let scrollAttempts = 0;
          const maxScrollAttempts = 50; // 防止无限滚动
          let lastHeight = 0;
          let noChangeCount = 0;
          const maxNoChangeCount = 3; // 连续3次高度不变则认为到底
          let isPaused = false;
          
          this.sendMessage('statusUpdate', { status: 'Auto-scrolling to load all reposts...' });
          
          const performScroll = async () => {
            // 检查暂停状态
            while (this.isPaused) {
              await this.sleep(500);
            }
            
            window.scrollTo(0, document.body.scrollHeight);
            scrollAttempts++;
            
            // 更新当前发现的 reposts 数量
            const currentReposts = document.querySelectorAll(this.selectors.video.containers.join(', '));
            const currentCount = currentReposts.length;
            
            if (currentCount > this.totalReposts) {
              this.totalReposts = currentCount;
              this.sendMessage('updateProgress', { 
                current: 0, 
                total: this.totalReposts,
                status: `Loaded ${this.totalReposts} reposts so far...`
              });
            }
            
            // 检查是否到达底部
            const currentHeight = document.body.scrollHeight;
            if (currentHeight === lastHeight) {
              noChangeCount++;
            } else {
              noChangeCount = 0;
              lastHeight = currentHeight;
            }
            
            // 如果连续多次高度不变，或者达到最大尝试次数，则停止
            if (noChangeCount >= maxNoChangeCount || scrollAttempts >= maxScrollAttempts) {
              observer.disconnect();
              
              // 等待2秒确保所有内容加载完成
              setTimeout(async () => {
                // 最终统计 reposts 数量
                const finalReposts = document.querySelectorAll(this.selectors.video.containers.join(', '));
                this.totalReposts = finalReposts.length;
                
                this.sendMessage('statusUpdate', { 
                  status: `Auto-scroll complete. Found ${this.totalReposts} total reposts.` 
                });
                console.log(`Auto-scroll complete. Total reposts found: ${this.totalReposts}`);
                resolve();
              }, 2000);
            } else {
              // 继续滚动，间隔1-2秒
              setTimeout(performScroll, rand(1000, 2000));
            }
          };
          
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !isPaused) {
                performScroll();
              }
            });
          }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
          });
          
          // 开始观察底部元素
          const bottomElement = document.createElement('div');
          bottomElement.style.height = '1px';
          bottomElement.style.width = '100%';
          bottomElement.style.position = 'absolute';
          bottomElement.style.bottom = '0';
          document.body.appendChild(bottomElement);
          observer.observe(bottomElement);
          
          // 开始第一次滚动
          setTimeout(() => {
            performScroll();
          }, 500);
          
          // 设置超时保护
          setTimeout(() => {
            observer.disconnect();
            const finalReposts = document.querySelectorAll(this.selectors.video.containers.join(', '));
            this.totalReposts = finalReposts.length;
            this.sendMessage('statusUpdate', { 
              status: `Auto-scroll timeout. Found ${this.totalReposts} total reposts.` 
            });
            resolve();
          }, 120000); // 2分钟超时
        });
      }

      async clickRepostTab() {
        try {
          this.sendMessage('statusUpdate', { status: 'Looking for Reposts tab...' });

          // 使用配置的选择器查找转发标签页
          let repostTab = this.utils.findElement(this.selectors.navigation.repostTab);

          if (!repostTab) {
            // 使用文本内容查找作为备用方案
            repostTab = this.utils.findByText(this.selectors.navigation.repostTabFallback, 'repost');
          }

          if (!repostTab) {
            throw new Error('Reposts tab not found');
          }

          repostTab.click();
          console.log("Successfully clicked the 'Reposts' tab.");

          this.sendMessage('statusUpdate', { status: 'Loading reposts...' });
          await this.waitWithProgress(3, 'Loading reposts');

          // 执行自动滚动加载所有 reposts
          await this.autoScroll();

          if (this.totalReposts === 0) {
            // Calculate duration even for no reposts found
            const endTime = Date.now();
            const totalDuration = endTime - this.startTime;
            const minutes = Math.floor(totalDuration / 60000);
            const seconds = Math.floor((totalDuration % 60000) / 1000);

            this.sendMessage('noRepostsFound', {
              duration: {
                total: totalDuration,
                minutes: minutes,
                seconds: seconds
              }
            });
            return false;
          }

          this.sendMessage('updateProgress', { current: 0, total: this.totalReposts });
          this.sendMessage('statusUpdate', { status: `Found ${this.totalReposts} repost(s) to process` });
          console.log(`Found ${this.totalReposts} reposted videos to remove.`);
          return true;
        } catch (error) {
          this.stopScript("Error accessing the 'Reposts' tab. Make sure you have reposted videos.", error);
          return false;
        }
      }

      async clickRepostVideo() {
        try {
          this.sendMessage('statusUpdate', { status: 'Opening first repost...' });

          // 使用配置的选择器查找第一个视频
          const firstVideo = await this.waitForElement(this.selectors.video.containers);
          firstVideo.click();
          console.log("Successfully opened the first reposted video.");

          await this.waitWithProgress(3, 'Opening video');
          return true;
        } catch (error) {
          this.stopScript("No reposted videos found or unable to open", error);
          return false;
        }
      }

      async processRepostVideos() {
        try {
          let removedInSession = 0;

          while (this.currentIndex < this.totalReposts) {
            // Check for pause at the beginning of each iteration
            while (this.isPaused) {
              await this.sleep(500);
            }

            this.currentIndex++;

            // Get current video information first
            const videoInfo = this.getVideoInfo();
            console.log('Processing video:', videoInfo);

            this.sendMessage('updateProgress', {
              current: this.currentIndex,
              total: this.totalReposts,
              title: videoInfo.title,
              author: videoInfo.author,
              url: videoInfo.url
            });

            this.sendMessage('statusUpdate', {
              status: `Processing repost ${this.currentIndex} of ${this.totalReposts}...`
            });

            // 使用配置的选择器查找转发按钮
            const repostButton = this.utils.findElement(this.selectors.video.repostButton);

            if (repostButton) {
              // Check if the button indicates this is a repost
              const isReposted = this.isVideoReposted(repostButton);

              if (isReposted) {
                try {
                  repostButton.click();
                  this.removedCount++;
                  removedInSession++;

                  // Create detailed log message with video info
                  this.sendMessage('videoRemoved', {
                    index: this.currentIndex,
                    title: videoInfo.title,
                    author: videoInfo.author,
                    url: videoInfo.url
                  });
                  console.log(`Removed repost from video #${this.currentIndex}:`, videoInfo);

                  // Wait a bit after removing
                  await this.waitWithProgress(3, 'Processing removal');
                } catch (error) {
                  console.log(`Failed to remove repost from video #${this.currentIndex}:`, error);
                  this.sendMessage('videoSkipped', {
                    index: this.currentIndex,
                    reason: 'failed to click repost button',
                    title: videoInfo.title,
                    author: videoInfo.author,
                    url: videoInfo.url
                  });
                }
              } else {
                this.sendMessage('videoSkipped', {
                  index: this.currentIndex,
                  reason: 'not currently reposted',
                  title: videoInfo.title,
                  author: videoInfo.author,
                  url: videoInfo.url
                });
              }
            } else {
              this.sendMessage('videoSkipped', {
                index: this.currentIndex,
                reason: 'repost button not found',
                title: videoInfo.title,
                author: videoInfo.author,
                url: videoInfo.url
              });
            }

            // 使用配置的选择器查找下一个视频按钮
            const nextVideoButton = this.utils.findElement(this.selectors.video.nextButton);

            if (!nextVideoButton || nextVideoButton.disabled) {
              // No more videos, we're done
              console.log('No more videos to process');
              break;
            }

            try {
              nextVideoButton.click();
              await this.sleep(rand(800,2400));
              console.log("Moved to next reposted video after 800-2400ms.");
            } catch (error) {
              console.log('Failed to move to next video:', error);
              break;
            }
          }

          // Close the video view
          await this.closeVideo();

          // Calculate total duration
          const endTime = Date.now();
          const totalDuration = endTime - this.startTime;
          const minutes = Math.floor(totalDuration / 60000);
          const seconds = Math.floor((totalDuration % 60000) / 1000);

          this.sendMessage('complete', {
            removedCount: removedInSession,
            duration: {
              total: totalDuration,
              minutes: minutes,
              seconds: seconds
            }
          });

        } catch (error) {
          this.stopScript("Error during reposted video removal", error);
        }
      }

      isVideoReposted(repostButton) {
        // 使用配置的选择器检查转发状态
        const isPressed = repostButton.getAttribute(this.selectors.repostStatus.pressedAttribute) === 'true';

        // 检查配置的活动状态类名
        const hasRepostedClass = this.selectors.repostStatus.activeClasses.some(className =>
          repostButton.classList.contains(className) ||
          repostButton.querySelector(`[class*="${className}"]`)
        );

        // Check for visual indicators (different colors, filled icons, etc.)
        const computedStyle = window.getComputedStyle(repostButton);
        const hasActiveColor = computedStyle.color !== 'rgb(255, 255, 255)' &&
          computedStyle.color !== 'rgba(255, 255, 255, 1)';

        // 使用配置的选择器检查SVG填充
        const hasFilledIcon = repostButton.querySelector(this.selectors.repostStatus.svgFillSelector) !== null;

        console.log('Repost button analysis:', {
          isPressed,
          hasRepostedClass,
          hasActiveColor,
          hasFilledIcon,
          finalResult: isPressed || hasRepostedClass || hasActiveColor || hasFilledIcon
        });

        return isPressed || hasRepostedClass || hasActiveColor || hasFilledIcon;
      }

      async closeVideo() {
        try {
          this.sendMessage('statusUpdate', { status: 'Closing video player...' });

          // 使用配置的选择器查找关闭按钮
          const closeVideoButton = this.utils.findElement(this.selectors.video.closeButton);

          if (closeVideoButton) {
            closeVideoButton.click();
            console.log("Closed video view.");
            await this.sleep(1000);
          } else {
            // Try alternative close methods
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            await this.sleep(1000);
          }
        } catch (error) {
          console.log("Error closing the video:", error);
        }
      }

      stopScript(message, error = "") {
        this.isRunning = false;
        this.sendMessage('error', { message: message, error: error.toString() });
        console.log(`Script stopped: ${message}`, error);
      }

      // Add new method to navigate to reposts tab after refresh
      async navigateToRepostsTab() {
        try {
          this.sendMessage('statusUpdate', { status: 'Navigating to profile and reposts...' });

          // Step 1: Navigate to profile if not already there
          const currentUrl = window.location.href;
          const isOnProfile = currentUrl.includes('/@') && !currentUrl.includes('/video/');

          if (!isOnProfile) {
            // Click profile button to go to profile
            const success = await this.clickProfileTab();
            if (!success) {
              this.sendMessage('statusUpdate', { status: 'Unable to navigate to profile' });
              return;
            }

            // Wait for profile page to load
            await this.waitWithProgress(3, 'Loading profile');
          }

          // Step 2: Click reposts tab
          this.sendMessage('statusUpdate', { status: 'Opening reposts tab...' });

          // 使用配置的选择器查找转发标签页
          let repostTab = this.utils.findElement(this.selectors.navigation.repostTab);

          if (!repostTab) {
            // 使用文本内容查找作为备用方案
            repostTab = this.utils.findByText(this.selectors.navigation.repostTabFallback, 'repost');
          }

          if (repostTab) {
            repostTab.click();
            console.log('Successfully clicked reposts tab');
            this.sendMessage('statusUpdate', { status: 'Reposts tab opened - You can see the results!' });

            // Wait a moment to let the tab load
            setTimeout(() => {
              // 使用配置的选择器检查剩余的转发视频
              const repostVideos = document.querySelectorAll(this.selectors.video.containers.join(', '));
              const remainingCount = repostVideos.length;

              if (remainingCount === 0) {
                this.sendMessage('statusUpdate', { status: '🎉 All reposts successfully removed!' });
              } else {
                this.sendMessage('statusUpdate', { status: `${remainingCount} repost(s) remaining on your profile` });
              }
            }, 2000);

          } else {
            this.sendMessage('statusUpdate', { status: 'Reposts tab not found - please check manually' });
            console.log('Reposts tab not found');
          }

        } catch (error) {
          console.error('Error navigating to reposts tab:', error);
          this.sendMessage('statusUpdate', { status: 'Error navigating to reposts - please check manually' });
        }
      }

      async start() {
        if (this.isRunning) {
          console.log("Script is already running.");
          return;
        }

        this.isRunning = true;
        this.currentIndex = 0;
        this.removedCount = 0;
        this.startTime = Date.now(); // Record start time

        console.log("ClearTok script started...");
        this.sendMessage('statusUpdate', { status: 'Starting removal process...' });

        try {
          // Step 1: Navigate to profile
          if (!await this.clickProfileTab()) return;

          // Step 2: Open reposts tab and count videos
          if (!await this.clickRepostTab()) return;

          // Step 3: Open first video
          const openedVideo = await this.clickRepostVideo();
          if (!openedVideo) return;

          // Step 4: Process all repost videos
          await this.processRepostVideos();
          // log total reposts
          console.log('----total reposts count:', this.totalReposts);
          console.log('---- reposts', this.totalReposts);
        } catch (error) {
          this.stopScript("Unexpected error in main flow", error);
        }
      }
    }

    // Create a global instance to prevent multiple instances with stronger checks
    if (!window.clearTokRemover) {
      window.clearTokRemover = new TikTokRepostRemover();
      window.clearTokRemover.instanceId = `instance_${Date.now()}`; // Unique ID
      console.log('ClearTok remover instance created with ID:', window.clearTokRemover.instanceId);
    } else {
      console.log('ClearTok remover instance already exists, using existing one');
    }

    // Wait a bit for the page to fully load, then check login status
    setTimeout(()=> window.clearTokRemover.checkLoginStatus?.(), 3000);
  }
})();
