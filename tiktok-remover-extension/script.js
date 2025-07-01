// Prevent duplicate script execution with stronger checks
if (window.clearTokExtensionLoaded && window.clearTokRemover) {
  console.log('ClearTok script already loaded and instance exists, skipping...');
} else {
  window.clearTokExtensionLoaded = true;

  class TikTokRepostRemover {
    constructor() {
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
        // find the profile link
        const profileLink = document.querySelector('[data-e2e="nav-profile"]');
        
        if (!profileLink) {
          // if the profile link is not found, the page may still be loading or the structure may have changed
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
        // if there is nothing after @ or only whitespace, then the user is not logged in
        const isLoggedIn = usernamePart && usernamePart.trim().length > 0;
        
        // extra check: logged in users usually have an avatar image instead of an SVG icon
        const hasAvatar = profileLink.querySelector('img') !== null;
        const hasSvgIcon = profileLink.querySelector('svg') !== null;
        
        this.sendMessage('loginStatusUpdate', { 
          isLoggedIn: isLoggedIn,
          hasLoginButton: false, // this method no longer checks for the login button
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
        // when an error occurs, send the default status
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
          
          const element = document.querySelector(selector);
          if (element) return resolve(element);
          if (Date.now() - start >= timeout) {
            return reject(new Error(`Timeout: Element ${selector} not found`));
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
        // Try to get video information from the current page
        const videoInfo = {
          title: '',
          url: window.location.href,
          author: ''
        };

        // Try to get video title/description with more selectors
        const titleSelectors = [
          '[data-e2e="video-desc"]',
          '[data-e2e="browse-video-desc"]',
          '.video-meta-title',
          '.tt-video-meta-caption',
          'h1[data-e2e="video-title"]',
          '.video-description',
          '.tt-video-title',
          '[data-testid="video-desc"]'
        ];

        for (const selector of titleSelectors) {
          const titleElement = document.querySelector(selector);
          if (titleElement && titleElement.textContent.trim()) {
            videoInfo.title = titleElement.textContent.trim();
            break;
          }
        }

        // Try to get author name with more selectors
        const authorSelectors = [
          '[data-e2e="video-author-uniqueid"]',
          '[data-e2e="browse-username"]',
          '[data-e2e="video-author-nickname"]',
          '.author-uniqueid',
          '.username',
          '.user-uniqueid',
          '[data-testid="video-author"]'
        ];

        for (const selector of authorSelectors) {
          const authorElement = document.querySelector(selector);
          if (authorElement && authorElement.textContent.trim()) {
            let authorText = authorElement.textContent.trim();
            // Clean up author text
            if (!authorText.startsWith('@')) {
              authorText = '@' + authorText;
            }
            videoInfo.author = authorText;
            break;
          }
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

        const profileButton = await this.waitForElement('[data-e2e="nav-profile"]');
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

    async clickRepostTab() {
      try {
        this.sendMessage('statusUpdate', { status: 'Looking for Reposts tab...' });
        
        // Try multiple selectors for the reposts tab
        let repostTab = null;
        const selectors = [
          '[class*="PRepost"]',
          '[data-e2e="profile-repost-tab"]',
          'a[href*="repost"]',
          'button[data-testid="repost-tab"]'
        ];
        
        for (const selector of selectors) {
          repostTab = document.querySelector(selector);
          if (repostTab) break;
        }
        
        if (!repostTab) {
          // Try to find by text content
          const tabElements = document.querySelectorAll('a, button, div[role="tab"]');
          for (const element of tabElements) {
            const text = element.textContent?.toLowerCase().trim();
            if (text === 'reposts' || text === 'repost' || text.includes('repost')) {
              repostTab = element;
              break;
            }
          }
        }
        
        if (!repostTab) {
          throw new Error('Reposts tab not found');
        }
        
        repostTab.click();
        console.log("Successfully clicked the 'Reposts' tab.");
        
        this.sendMessage('statusUpdate', { status: 'Loading reposts...' });
        await this.waitWithProgress(3, 'Loading reposts');
        
        // Count total reposts
        await this.sleep(2000);
        const repostVideos = document.querySelectorAll('[class*="DivPlayerContainer"], [data-e2e="user-post-item"]');
        this.totalReposts = repostVideos.length;
        
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
        
        const firstVideo = await this.waitForElement('[class*="DivPlayerContainer"], [data-e2e="user-post-item"]');
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

          // Try to find the repost button
          const repostButton = document.querySelector('[data-e2e="video-share-repost"]') ||
                              document.querySelector('[class*="repost"]') ||
                              document.querySelector('button[aria-label*="repost" i]');
          
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

          // Try to go to next video
          const nextVideoButton = document.querySelector('[data-e2e="arrow-right"]') ||
                                 document.querySelector('[class*="arrow-right"]') ||
                                 document.querySelector('button[aria-label*="next" i]');
          
          if (!nextVideoButton || nextVideoButton.disabled) {
            // No more videos, we're done
            console.log('No more videos to process');
            break;
          }

          try {
            nextVideoButton.click();
            console.log("Moved to next reposted video.");
            
            // Wait between videos to avoid being too aggressive (using sleep to avoid duplicate countdown)
            await this.sleep(1000);
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
      // Check various indicators that the video is currently reposted
      const isPressed = repostButton.getAttribute('aria-pressed') === 'true';
      const hasRepostedClass = repostButton.classList.contains('reposted') ||
                              repostButton.querySelector('[class*="reposted"]') ||
                              repostButton.querySelector('[class*="active"]');
      
      // Check for visual indicators (different colors, filled icons, etc.)
      const computedStyle = window.getComputedStyle(repostButton);
      const hasActiveColor = computedStyle.color !== 'rgb(255, 255, 255)' && 
                            computedStyle.color !== 'rgba(255, 255, 255, 1)';
      
      // Check for SVG fill or other visual indicators
      const svgIcon = repostButton.querySelector('svg');
      const hasFilledIcon = svgIcon && (
        svgIcon.getAttribute('fill') !== 'none' ||
        svgIcon.querySelector('[fill]:not([fill="none"])')
      );
      
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
        
        const closeVideoButton = document.querySelector('[data-e2e="browse-close"]') ||
                                 document.querySelector('[class*="close"]') ||
                                 document.querySelector('button[aria-label*="close" i]');
        
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
        
        // Try to find and click reposts tab
        let repostTab = null;
        const selectors = [
          '[class*="PRepost"]',
          '[data-e2e="profile-repost-tab"]',
          'a[href*="repost"]',
          'button[data-testid="repost-tab"]'
        ];
        
        for (const selector of selectors) {
          repostTab = document.querySelector(selector);
          if (repostTab) {
            console.log('Found reposts tab with selector:', selector);
            break;
          }
        }
        
        if (!repostTab) {
          // Try to find by text content
          const tabElements = document.querySelectorAll('a, button, div[role="tab"]');
          for (const element of tabElements) {
            const text = element.textContent?.toLowerCase().trim();
            if (text === 'reposts' || text === 'repost' || text.includes('repost')) {
              repostTab = element;
              console.log('Found reposts tab by text content:', text);
              break;
            }
          }
        }
        
        if (repostTab) {
          repostTab.click();
          console.log('Successfully clicked reposts tab');
          this.sendMessage('statusUpdate', { status: 'Reposts tab opened - You can see the results!' });
          
          // Wait a moment to let the tab load
          setTimeout(() => {
            // Check if there are any reposts left
            const repostVideos = document.querySelectorAll('[class*="DivPlayerContainer"], [data-e2e="user-post-item"]');
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
        const wentToProfile = await this.clickProfileTab();
        if (!wentToProfile) return;

        // Step 2: Open reposts tab and count videos
        const hasReposts = await this.clickRepostTab();
        if (!hasReposts) return;

        // Step 3: Open first video
        const openedVideo = await this.clickRepostVideo();
        if (!openedVideo) return;

        // Step 4: Process all repost videos
        await this.processRepostVideos();
        
      } catch (error) {
        this.stopScript("Unexpected error in main flow", error);
      }
    }
  }

  // Check if we're on TikTok before starting
  if (window.location.hostname.includes('tiktok.com')) {
    // Create a global instance to prevent multiple instances with stronger checks
    if (!window.clearTokRemover) {
      window.clearTokRemover = new TikTokRepostRemover();
      window.clearTokRemover.instanceId = `instance_${Date.now()}`; // Unique ID
      console.log('ClearTok remover instance created with ID:', window.clearTokRemover.instanceId);
    } else {
      console.log('ClearTok remover instance already exists, using existing one');
    }
    
    // Wait a bit for the page to fully load, then check login status
    setTimeout(() => {
      if (window.clearTokRemover) {
        window.clearTokRemover.checkLoginStatus();
      }
    }, 3000);

  } else {
    console.log("This script only works on TikTok.com");
  }
}
