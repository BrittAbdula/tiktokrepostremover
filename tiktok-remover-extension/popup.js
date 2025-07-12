class ClearTokExtension {
  constructor() {
    this.currentState = 'welcome';
    this.isProcessing = false;
    this.isPaused = false;
    this.totalVideos = 0;
    this.processedVideos = 0;
    this.removedVideos = 0;
    this.actionLog = [];
    this.removedUrls = []; // Track removed video URLs
    this.pendingUrls = []; // Track pending video URLs
    this.currentTikTokTab = null;
    this.processedMessages = new Set(); // Track processed messages to prevent duplicates
    this.lastMessageTimestamp = 0; // Track last message timestamp
    
    // 会话追踪
    this.sessionId = null;
    this.sessionStartTime = null;
    this.tikTokUsername = null;
    
    // Session管理配置
    this.SESSION_EXPIRY_TIME = 60 * 60 * 1000; // 1小时过期
    this.SESSION_STORAGE_KEY = 'clearTokSessionData';
    
    // 定时更新配置
    this.periodicUpdateInterval = null;
    this.UPDATE_INTERVAL_MS = 10000; // 每10秒更新一次
    
    // 状态缓存，避免重复调用updateSession
    this.currentLoginStatus = null;
    
    this.initializeEventListeners();
    this.cleanupExpiredSessions(); // 清理过期session
    this.checkTikTokLogin();
    this.initializeSession();
    
    // Delegated click listener for video link buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.video-link-btn');
      if (btn && btn.dataset.url) {
        this.openVideoInNewTab(btn.dataset.url);
      }
    });
  }

  // 初始化会话（智能管理）
  async initializeSession() {
    try {
      // 首先检查是否有有效的现有session
      const existingSession = await this.getStoredSession();
      
      if (existingSession && this.isSessionValid(existingSession)) {
        // 复用现有session
        this.sessionId = existingSession.sessionId;
        this.sessionStartTime = existingSession.sessionStartTime;
        this.tikTokUsername = existingSession.tikTokUsername;
        
        console.log('复用现有session:', this.sessionId);
        
        // 更新最后活跃时间
        await this.updateStoredSession({
          ...existingSession,
          lastActiveTime: Date.now()
        });
        
        return;
      }
      
      // 创建新session
      this.sessionStartTime = Date.now();
      const response = await window.apiService.createSession();
      this.sessionId = response.session_id;
      
      console.log('创建新session:', this.sessionId);
      
      // 保存新session到存储
      await this.saveSessionToStorage();
      
    } catch (error) {
      console.warn('Failed to initialize session:', error);
    }
  }

  // 更新会话状态
  async updateSession(updateData) {
    if (!this.sessionId) return;
    
    try {
      await window.apiService.updateSession(this.sessionId, updateData);
      
      // 同时更新存储的session数据
      if (updateData.tiktok_username) {
        this.tikTokUsername = updateData.tiktok_username;
        await this.saveSessionToStorage();
      }
      
    } catch (error) {
      console.warn('Failed to update session:', error);
    }
  }

  // Session存储管理方法
  
  // 获取存储的session
  async getStoredSession() {
    try {
      const result = await chrome.storage.local.get([this.SESSION_STORAGE_KEY]);
      return result[this.SESSION_STORAGE_KEY] || null;
    } catch (error) {
      console.warn('Failed to get stored session:', error);
      return null;
    }
  }
  
  // 检查session是否有效
  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.sessionId || !sessionData.createdTime) {
      return false;
    }
    
    const now = Date.now();
    const sessionAge = now - sessionData.createdTime;
    
    // 检查是否超过过期时间
    if (sessionAge > this.SESSION_EXPIRY_TIME) {
      console.log('Session expired, age:', Math.floor(sessionAge / 1000 / 60), 'minutes');
      return false;
    }
    
    return true;
  }
  
  // 保存session到存储
  async saveSessionToStorage() {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        sessionStartTime: this.sessionStartTime,
        tikTokUsername: this.tikTokUsername,
        createdTime: Date.now(),
        lastActiveTime: Date.now()
      };
      
      await chrome.storage.local.set({
        [this.SESSION_STORAGE_KEY]: sessionData
      });
      
      console.log('Session saved to storage:', sessionData);
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  }
  
  // 更新存储的session
  async updateStoredSession(sessionData) {
    try {
      await chrome.storage.local.set({
        [this.SESSION_STORAGE_KEY]: sessionData
      });
    } catch (error) {
      console.warn('Failed to update stored session:', error);
    }
  }
  
  // 清除存储的session
  async clearStoredSession() {
    try {
      await chrome.storage.local.remove([this.SESSION_STORAGE_KEY]);
      console.log('Stored session cleared');
    } catch (error) {
      console.warn('Failed to clear stored session:', error);
    }
  }
  
  // 清理过期的session
  async cleanupExpiredSessions() {
    try {
      const existingSession = await this.getStoredSession();
      if (existingSession && !this.isSessionValid(existingSession)) {
        await this.clearStoredSession();
        console.log('Expired session cleaned up');
      }
    } catch (error) {
      console.warn('Failed to cleanup expired sessions:', error);
    }
  }

  // 开始定时更新session状态
  startPeriodicUpdate() {
    if (this.periodicUpdateInterval) {
      clearInterval(this.periodicUpdateInterval);
    }
    
    this.periodicUpdateInterval = setInterval(() => {
      this.periodicSessionUpdate();
    }, this.UPDATE_INTERVAL_MS);
    
    console.log('Started periodic session updates');
  }

  // 停止定时更新session状态
  stopPeriodicUpdate() {
    if (this.periodicUpdateInterval) {
      clearInterval(this.periodicUpdateInterval);
      this.periodicUpdateInterval = null;
      console.log('Stopped periodic session updates');
    }
  }

  // 执行定时的session更新
  async periodicSessionUpdate() {
    if (!this.sessionId || !this.isProcessing) {
      return;
    }

    try {
      const updateData = {
        process_status: this.isPaused ? 'paused' : 'in_progress',
        total_reposts_found: this.totalVideos,
        reposts_removed: this.removedVideos,
        reposts_skipped: this.processedVideos - this.removedVideos
      };

      await window.apiService.updateSession(this.sessionId, updateData);
      
    } catch (error) {
      console.warn('Failed to perform periodic session update:', error);
    }
  }

  // Helper method to get translated text with substitutions
  getText(key, substitutions = {}) {
    if (window.i18n && window.i18n.getMessage) {
      return window.i18n.getMessage(key, substitutions);
    }
    // Fallback to Chrome i18n API if available
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      let message = chrome.i18n.getMessage(key);
      if (message) {
        // Handle simple substitutions for Chrome API
        Object.keys(substitutions).forEach(placeholder => {
          message = message.replace(new RegExp(`{${placeholder}}`, 'g'), substitutions[placeholder]);
        });
        return message;
      }
    }
    // Ultimate fallback
    return key;
  }

  initializeEventListeners() {
    // Step 1: Click to open TikTok
    document.getElementById('openTikTokStep')?.addEventListener('click', () => this.openTikTok());
    
    // Main action buttons
    document.getElementById('startButton')?.addEventListener('click', () => this.startRemoval());
    document.getElementById('pauseButton')?.addEventListener('click', () => this.togglePause());
    document.getElementById('viewLogButton')?.addEventListener('click', () => this.showDetailedLog());
    document.getElementById('restartButton')?.addEventListener('click', () => this.restart());
    document.getElementById('retryButton')?.addEventListener('click', () => this.restart());

    // Rating related buttons
    document.getElementById('rateUsButton')?.addEventListener('click', () => this.showRatingModal());
    document.getElementById('rateUsButtonComplete')?.addEventListener('click', () => this.showRatingModal());
    document.getElementById('rateUsActionButton')?.addEventListener('click', () => this.handleRatingAction());
    document.getElementById('alreadyRatedButton')?.addEventListener('click', () => this.closeRatingModal());
    
    // Rating modal interactions
    this.initializeRatingModal();

    // Listen for messages from content script with deduplication
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessageWithDeduplication(message);
    });
  }

  handleMessageWithDeduplication(message) {
    // Create a unique identifier for the message
    const messageId = `${message.action}_${message.timestamp || Date.now()}_${message.instanceId || 'default'}`;
    
    // Check if we've already processed this message
    if (this.processedMessages.has(messageId)) {
      console.log('Duplicate message detected, skipping:', messageId);
      return;
    }
    
    // Check for very similar messages within 500ms
    const now = Date.now();
    if (message.timestamp && Math.abs(now - message.timestamp) < 500) {
      // Check for similar recent messages
      const recentSimilar = Array.from(this.processedMessages).some(id => {
        const parts = id.split('_');
        if (parts[0] === message.action && parts[2] !== message.instanceId) {
          const msgTime = parseInt(parts[1]);
          return Math.abs(msgTime - message.timestamp) < 500;
        }
        return false;
      });
      
      if (recentSimilar) {
        console.log('Similar recent message detected, skipping:', messageId);
        return;
      }
    }
    
    // Mark this message as processed
    this.processedMessages.add(messageId);
    
    // Clean up old message IDs (keep only last 100)
    if (this.processedMessages.size > 100) {
      const ids = Array.from(this.processedMessages);
      ids.slice(0, 50).forEach(id => this.processedMessages.delete(id));
    }
    
    // Process the message
    this.handleMessage(message);
  }

  async openTikTok() {
    try {
      // Open TikTok.com in a new tab
      const tab = await chrome.tabs.create({
        url: "https://www.tiktok.com/",
        active: true,
      });
      
      this.currentTikTokTab = tab;
      
      // Update the status to indicate TikTok was opened
      this.updateLoginStatus('opening');
      
      // After a delay, check login status by injecting content script
      setTimeout(async () => {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["script.js"],
          });
          
          // Request login status check
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'checkLoginStatus' });
          }, 2000);
        } catch (error) {
          console.log('Error injecting script:', error);
          this.updateLoginStatus('error');
        }
      }, 4000);
      
    } catch (error) {
      console.log('Error opening TikTok:', error);
      this.updateLoginStatus('error');
    }
  }

  async checkTikTokLogin() {
    try {
      // Check if TikTok tab is open
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length > 0) {
        this.currentTikTokTab = tabs[0];
        
        // Try to inject script and check login status
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["script.js"],
          });
          
          // Request login status check
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'checkLoginStatus' });
          }, 1000);
        } catch (error) {
          console.log('Error checking login status:', error);
          this.updateLoginStatus('ready');
        }
      } else {
        this.updateLoginStatus('waiting');
      }
    } catch (error) {
      console.log('Error checking TikTok tabs:', error);
      this.updateLoginStatus('waiting');
    }
  }

  updateLoginStatus(status) {
    // 避免重复更新相同状态
    if (this.currentLoginStatus === status) {
      return;
    }
    
    this.currentLoginStatus = status;
    
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) {
      switch (status) {
        case 'loggedIn':
          loginStatus.innerHTML = `
            <span class="status-indicator">✅</span>
            <span>${this.getText('loginStatusLoggedIn')}</span>
          `;
          break;
        case 'notLoggedIn':
          loginStatus.innerHTML = `
            <span class="status-indicator">⚠️</span>
            <span style="color: var(--color-warning)">${this.getText('loginStatusNotLoggedIn')}</span>
          `;
          break;
        case 'ready':
          loginStatus.innerHTML = `
            <span class="status-indicator">✅</span>
            <span>${this.getText('loginStatusReady')}</span>
          `;
          break;
        case 'opening':
          loginStatus.innerHTML = `
            <span class="status-indicator">🔄</span>
            <span>${this.getText('loginStatusOpening')}</span>
          `;
          break;
        case 'error':
          loginStatus.innerHTML = `
            <span class="status-indicator">❌</span>
            <span>${this.getText('loginStatusError')}</span>
          `;
          break;
        default:
          loginStatus.innerHTML = `
            <span class="status-indicator">👆</span>
            <span>${this.getText('loginStatusDefault')}</span>
          `;
      }
    }
  }

  async startRemoval() {
    if (this.isProcessing) return;

    // Check if TikTok tab is available first
    try {
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length === 0) {
        alert(this.getText('alertOpenTikTokFirst'));
        return;
      }
      
      // Check login status before starting
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkLoginStatus' });
      
      // Wait a bit for login status response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('Error checking tabs:', error);
    }

    this.isProcessing = true;
    
    // 更新会话：开始删除流程
    this.updateSession({ process_status: 'in_progress' });
    
    // 启动定时更新
    this.startPeriodicUpdate();
    
    // Clear previous data and switch to processing state
    this.clearProcessingData();
    this.setState('processing');
    
    // Initialize with real starting status
    this.updateStatus(this.getText('statusInitializing'));
    this.updateProgress(0, 1);
    this.addLogEntry(this.getText('logStartingProcess'), 'info');
    
    try {
      // Send message to background script to start the process
      chrome.runtime.sendMessage({ 
        action: "removeRepostedVideos",
        extensionId: chrome.runtime.id
      });
      
    } catch (error) {
      this.handleError('Failed to start removal process', error);
    }
  }

  clearProcessingData() {
    // Reset counters
    this.totalVideos = 0;
    this.processedVideos = 0;
    this.removedVideos = 0;
    this.actionLog = [];
    this.removedUrls = [];
    this.pendingUrls = [];
    
    
    // Clear the demo log content
    const actionLog = document.getElementById('actionLog');
    if (actionLog) {
      actionLog.innerHTML = '';
    }
    
    // Clear removed videos lists
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
    
    // Reset progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    
    const progressText = document.getElementById('progressText');
    if (progressText) {
      progressText.textContent = '0 / 0';
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseButton = document.getElementById('pauseButton');
    
    if (this.isPaused) {
      pauseButton.textContent = this.getText('resumeButton');
      pauseButton.className = 'control-button resume';
      this.addLogEntry(this.getText('logProcessPaused'), 'info');
      chrome.runtime.sendMessage({ action: "pauseRemoval" });
    } else {
      pauseButton.textContent = this.getText('pauseButton');
      pauseButton.className = 'control-button pause';
      this.addLogEntry(this.getText('logProcessResumed'), 'info');
      chrome.runtime.sendMessage({ action: "resumeRemoval" });
    }
  }

  showDetailedLog() {
    // Create URL-only log content
    let logContent = '';
    
    if (this.removedUrls.length > 0) {
      logContent += this.getText('removedVideosHeader', {count: this.removedUrls.length}) + '\n';
      this.removedUrls.forEach((item, index) => {
        logContent += `${index + 1}. ${item.title || this.getText('videoUnknownTitle')} by ${item.author || this.getText('videoUnknownAuthor')}\n`;
        logContent += `   ${item.url}\n`;
        logContent += `   ${this.getText('videoRemovedAt', {timestamp: item.timestamp})}\n\n`;
      });
    }
    
    if (this.pendingUrls.length > 0) {
      logContent += this.getText('pendingVideosHeader') + '\n';
      this.pendingUrls.forEach((item, index) => {
        // Check if this URL was actually removed
        const wasRemoved = this.removedUrls.find(removed => removed.url === item.url);
        if (!wasRemoved) {
          logContent += `${index + 1}. ${item.title || this.getText('videoUnknownTitle')} by ${item.author || this.getText('videoUnknownAuthor')}\n`;
          logContent += `   ${item.url}\n`;
          logContent += `   ${this.getText('videoStatusPending')}\n\n`;
        }
      });
    }
    
    if (logContent.trim() === '') {
      // Show notification for empty log
      this.showNotification(this.getText('notificationNoUrls'), 'info');
      return;
    }
    
          // Copy to clipboard
      navigator.clipboard.writeText(logContent).then(() => {
        this.addLogEntry(this.getText('logVideoUrlsCopied'), 'info');
        this.showNotification(this.getText('notificationUrlsCopied'), 'success');
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = logContent;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.addLogEntry(this.getText('logVideoUrlsCopied'), 'info');
          this.showNotification(this.getText('notificationUrlsCopied'), 'success');
        } catch (err) {
          this.addLogEntry(this.getText('logFailedToCopyUrls'), 'error');
          this.showNotification(this.getText('notificationFailedToCopyUrls'), 'error');
        }
        document.body.removeChild(textArea);
      });
  }

  showNotification(message, type = 'info') {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    // Add styles for notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-surface);
      border: 1px solid ${type === 'error' ? 'var(--color-warning)' : type === 'success' ? 'var(--color-success)' : 'var(--color-accent-alt)'};
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--color-text);
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  restart() {
    this.isProcessing = false;
    this.isPaused = false;
    
    // 停止定时更新
    this.stopPeriodicUpdate();
    
    // 只重置状态，不重新创建session（除非当前session无效）
    if (!this.sessionId) {
      this.initializeSession();
    } else {
      // 更新session状态为重新开始
      this.updateSession({ process_status: 'restarted' });
    }
    
    // Clear all data and reset to welcome state
    this.clearProcessingData();
    this.setState('welcome');
    
    // Reset pause button
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
      pauseButton.textContent = this.getText('pauseButton');
      pauseButton.className = 'control-button pause';
    }
    
    // Check login status again
    this.checkTikTokLogin();
  }

  setState(newState) {
    this.currentState = newState;
    
    // Hide all state containers
    const states = ['welcome', 'processing', 'complete', 'error'];
    states.forEach(state => {
      const element = document.getElementById(`${state}State`);
      if (element) {
        element.style.display = 'none';
      }
    });
    
    // Show current state
    const currentElement = document.getElementById(`${newState}State`);
    if (currentElement) {
      currentElement.style.display = 'block';
    }
  }

  updateStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  updateProgress(current, total) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      const percentage = total > 0 ? (current / total) * 100 : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${current} / ${total}`;
      
      // 更新会话进度
      if (total > 0) {
        this.updateSession({ 
          total_reposts_found: total,
          reposts_removed: current
        });
      }
    }
  }

  addLogEntry(message, type = 'info', videoInfo = null) {
    const actionLog = document.getElementById('actionLog');
    if (!actionLog) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    const icon = this.getLogIcon(type);
    
    let content = `<span class="log-time">${timestamp}</span> <span class="log-icon">${icon}</span> <span class="log-message">${message}</span>`;
    
    // Add video info if provided
    if (videoInfo && videoInfo.url) {
      content += `<div class="log-video-info">
        <button class="video-link-btn" onclick="window.extension.openVideoInNewTab('${videoInfo.url}')">
          🔗 Open Video
        </button>
      </div>`;
    }
    
    logEntry.innerHTML = content;
    actionLog.appendChild(logEntry);
    
    // Auto-scroll to bottom
    actionLog.scrollTop = actionLog.scrollHeight;
    
    // Keep only last 100 entries for performance
    while (actionLog.children.length > 100) {
      actionLog.removeChild(actionLog.firstChild);
    }
    
    // Track in action log array
    this.actionLog.push({
      timestamp: timestamp,
      type: type,
      message: message,
      videoInfo: videoInfo
    });
    
    // Keep only last 100 entries in array too
    if (this.actionLog.length > 100) {
      this.actionLog = this.actionLog.slice(-100);
    }
  }

  getLogIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'waiting': return '⏳';
      default: return 'ℹ️';
    }
  }

  addRemovedVideo(videoInfo) {
    this.removedUrls.push({
      ...videoInfo,
      timestamp: new Date().toLocaleString()
    });
    
    // Update both lists
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
  }

  updateRemovedVideosList(listId, countId) {
    const list = document.getElementById(listId);
    const count = document.getElementById(countId);
    
    if (list && count) {
      count.textContent = this.removedUrls.length;
      
      if (this.removedUrls.length > 0) {
        list.innerHTML = this.removedUrls.slice(-10).map((video, index) => {
          const displayTitle = video.title || this.getText('videoUnknownTitle');
          const displayAuthor = video.author || this.getText('videoUnknownAuthor');
          
          return `
            <div class="removed-video-item">
              <div class="video-info">
                <strong>${this.escapeHtml(displayTitle)}</strong>
                <span class="video-author">by ${this.escapeHtml(displayAuthor)}</span>
              </div>
              <button class="video-link-btn" data-url="${video.url}" aria-label="Open video link">
                🔗
              </button>
            </div>
          `;
        }).join('');
      } else {
        list.innerHTML = `<div class="no-videos">${this.getText('noRemovedVideos')}</div>`;
      }
    }
  }

  openVideoInNewTab(url) {
    if (url && url.startsWith('http')) {
      chrome.tabs.create({ url: url, active: false });
      this.showNotification('🔗 Video opened in new tab', 'info');
    } else {
      this.showNotification('❌ Invalid video URL', 'error');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleMessage(message) {
    switch (message.action) {
      case 'loginStatusUpdate':
        if (message.method === 'username-check' && message.isLoggedIn) {
          // 保存TikTok用户名
          if (message.username && message.username !== this.tikTokUsername) {
            console.log('TikTok username detected:', message.username);
            
            // 更新会话中的TikTok用户名
            this.updateSession({ 
              login_status: 'logged_in',
              tiktok_username: message.username
            });
          } else if (this.currentLoginStatus !== 'loggedIn') {
            // 只有当登录状态真的变化时才更新
            this.updateSession({ login_status: 'logged_in' });
          }
          this.updateLoginStatus('loggedIn');
        } else if (message.method === 'username-check' && !message.isLoggedIn) {
          if (this.tikTokUsername !== null || this.currentLoginStatus !== 'notLoggedIn') {
            // 只有当状态真的变化时才更新
            this.tikTokUsername = null;
            this.updateSession({ login_status: 'not_logged_in' });
          }
          this.updateLoginStatus('notLoggedIn');
          this.showNotification('⚠️ Please log in to TikTok.com to continue', 'error');
        } else {
          this.updateLoginStatus('ready');
        }
        break;
        
      case 'updateProgress':
        this.processedVideos = message.current;
        this.totalVideos = message.total;
        this.updateProgress(message.current, message.total);
        this.updateStatus(`Processing video ${message.current} of ${message.total}`);
        // Don't add a separate log entry for progress updates - too much noise
        break;
        
      case 'videoRemoved':
        this.removedVideos++;
        
        // Add video to removed list with all info
        if (message.title || message.author || message.url) {
          this.addRemovedVideo({
            title: message.title,
            author: message.author,
            url: message.url
          });
        }
        
        // Create detailed log message with video info
        let removeLogMessage = this.getText('logVideoRemoved', {number: message.index});
        if (message.title && message.author) {
          removeLogMessage = this.getText('logVideoRemovedWithTitle', {title: message.title, author: message.author});
        } else if (message.title) {
          removeLogMessage = this.getText('logVideoRemovedTitleOnly', {title: message.title});
        } else if (message.author) {
          removeLogMessage = this.getText('logVideoRemovedAuthorOnly', {author: message.author});
        }
        
        this.addLogEntry(removeLogMessage, 'success', {
          title: message.title,
          author: message.author,
          url: message.url
        });
        break;
        
      case 'videoSkipped':
        // Create detailed skip message
        let skipLogMessage = this.getText('logVideoSkipped', {number: message.index});
        if (message.title && message.author) {
          skipLogMessage = this.getText('logVideoSkippedWithTitle', {title: message.title, author: message.author});
        } else if (message.title) {
          skipLogMessage = this.getText('logVideoSkippedTitleOnly', {title: message.title});
        } else if (message.author) {
          skipLogMessage = this.getText('logVideoSkippedAuthorOnly', {author: message.author});
        }
        skipLogMessage = this.getText('logVideoSkippedWithReason', {message: skipLogMessage, reason: message.reason});
        this.addLogEntry(skipLogMessage, 'info');
        break;
        
      case 'waiting':
        if (message.seconds === 'paused') {
          this.addLogEntry(this.getText('logWaitingPaused'), 'waiting');
        } else if (typeof message.seconds === 'number') {
          // Show waiting countdown
          this.addLogEntry(this.getText('logWaitingSeconds', {seconds: message.seconds}), 'waiting');
        }
        break;
        
      case 'statusUpdate':
        this.updateStatus(message.status);
        // Only log important status updates, and avoid duplicates
        if (message.status.includes('Starting') || 
            message.status.includes('Navigating') || 
            message.status.includes('Looking') ||
            message.status.includes('Loading') ||
            message.status.includes('Found') ||
            message.status.includes('Opening') ||
            message.status.includes('Resuming') ||
            message.status.includes('Closing')) {
          this.addLogEntry(message.status, 'info');
        }
        break;
        
      case 'error':
        this.handleError(message.message, message.error);
        break;
        
      case 'complete':
        this.handleCompletion(message);
        break;
        
      case 'noRepostsFound':
        this.handleNoReposts(message);
        break;
        
      default:
        console.log('Unknown message:', message);
    }
  }

  handleError(message, error = null) {
    this.isProcessing = false;
    
    // 停止定时更新
    this.stopPeriodicUpdate();
    
    this.setState('error');
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    
    // 更新会话：发生错误
    this.updateSession({ 
      error_message: message,
      process_status: 'error'
    });
    
    this.addLogEntry(this.getText('logError', {message: message}), 'error');
    if (error) {
      console.error('Extension error:', error);
    }
  }

  handleCompletion(message) {
    this.isProcessing = false;
    
    // 停止定时更新
    this.stopPeriodicUpdate();
    
    this.setState('complete');
    
    const removedCount = message.removedCount || 0;
    const duration = message.duration;
    let durationText = '';
    
    // 计算总耗时
    const totalDurationSeconds = this.sessionStartTime ? 
      Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0;
    
    // 更新会话：完成
    this.updateSession({
      process_status: 'completed',
      reposts_removed: removedCount,
      total_duration_seconds: totalDurationSeconds
    });
    
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
      if (duration) {
        if (duration.minutes > 0) {
          durationText = this.getText('durationMinutes', {minutes: duration.minutes, seconds: duration.seconds});
        } else {
          durationText = this.getText('durationSeconds', {seconds: duration.seconds});
        }
      }
      
      completionMessage.textContent = this.getText('completionMessageSuccess', {
        count: removedCount,
        plural: removedCount !== 1 ? 's' : '',
        duration: durationText
      });
    }
    
    // Update removed videos list for complete state
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
    
    // Show copy button if there are removed videos
    const copyRemovedButton = document.getElementById('copyRemovedButton');
    
    if (copyRemovedButton) {
      if (this.removedUrls.length > 0) {
        copyRemovedButton.style.display = 'block';
        copyRemovedButton.onclick = () => this.copyRemovedList();
      } else {
        copyRemovedButton.style.display = 'none';
      }
    }
    
    this.addLogEntry(this.getText('logProcessCompleted', {count: removedCount, duration: durationText}), 'success');
    
    // add refresh page function
    if (removedCount > 0) {
      this.refreshTikTokPage();
    }
  }
  
  // refresh tiktok page and navigate to reposts tab
  async refreshTikTokPage() {
    try {
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length > 0) {
        // refresh tiktok page
        await chrome.tabs.reload(tabs[0].id);
        
        this.addLogEntry(this.getText('logRefreshingPage'), 'info');
        this.showNotification(this.getText('notificationPageRefreshed'), 'success');
        
        // wait for page to load, then navigate to reposts tab
        setTimeout(async () => {
          try {
            // Inject script to navigate to reposts tab
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ["script.js"],
            });
            
            // Send message to navigate to reposts tab
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'navigateToReposts' });
            }, 3000);
            
          } catch (error) {
            console.log('Error navigating to reposts:', error);
          }
        }, 5000);
      }
    } catch (error) {
      console.log('Error refreshing page:', error);
    }
  }

  copyRemovedList() {
    if (this.removedUrls.length === 0) {
      this.showNotification(this.getText('notificationNoUrls'), 'info');
      return;
    }
    
    const listText = this.removedUrls.map((video, index) => {
      const title = video.title || this.getText('videoUnknownTitle');
      const author = video.author || this.getText('videoUnknownAuthor');
      return `${index + 1}. ${title} by ${author}\n   ${video.url}\n   ${this.getText('videoRemovedAt', {timestamp: video.timestamp})}\n`;
    }).join('\n');
    
    const fullText = this.getText('removedVideosHeader', {count: this.removedUrls.length}) + '\n\n' + listText;
    
    navigator.clipboard.writeText(fullText).then(() => {
      this.showNotification(this.getText('notificationUrlsCopied'), 'success');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.showNotification(this.getText('notificationUrlsCopied'), 'success');
      } catch (err) {
        this.showNotification(this.getText('notificationFailedToCopyUrls'), 'error');
      }
      document.body.removeChild(textArea);
    });
  }

  handleNoReposts(message) {
    this.isProcessing = false;
    
    // 停止定时更新
    this.stopPeriodicUpdate();
    
    this.setState('complete');
    
    this.updateSession({ process_status: 'no_reposts', total_reposts_found: 0, reposts_removed: 0 });
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
      completionMessage.textContent = this.getText('noRepostsFoundMessage');
    }
    const copyRemovedButton = document.getElementById('copyRemovedButton');
    if (copyRemovedButton) copyRemovedButton.style.display = 'none';
    this.addLogEntry(this.getText('logNoRepostsFound', {duration: ''}), 'info');
    this.showNotification(this.getText('notificationNoRepostsFound'), 'info');
  }

  // Rating Modal Functions
  initializeRatingModal() {
    this.selectedRating = 0;
    this.ratingLabels = ['Bad', 'Okay', 'Good', 'Great', 'Love it!'];
    
    // Initialize star clicks
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.addEventListener('click', () => this.selectRating(index + 1));
      star.addEventListener('mouseenter', () => this.hoverRating(index + 1));
    });
    
    // Initialize label clicks
    const labels = document.querySelectorAll('.rating-label');
    labels.forEach((label, index) => {
      label.addEventListener('click', () => this.selectRating(index + 1));
    });
    
    // Initialize modal overlay click to close
    document.getElementById('ratingModal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeRatingModal();
      }
    });
    
    // Reset stars when mouse leaves container
    document.querySelector('.stars-container')?.addEventListener('mouseleave', () => {
      this.updateStarDisplay(this.selectedRating);
    });
  }

  showRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
      modal.classList.remove('hidden');
      this.resetRatingModal();
    }
  }

  closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  resetRatingModal() {
    this.selectedRating = 0;
    this.updateStarDisplay(0);
    this.updateRatingMessage();
    this.updateActionButton();
  }

  selectRating(rating) {
    this.selectedRating = rating;
    this.updateStarDisplay(rating);
    this.updateRatingMessage();
    this.updateActionButton();
  }

  hoverRating(rating) {
    if (this.selectedRating === 0) {
      this.updateStarDisplay(rating);
    }
  }

  updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    const labels = document.querySelectorAll('.rating-label');
    
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
    
    labels.forEach((label, index) => {
      if (index === rating - 1) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  updateRatingMessage() {
    const messageElement = document.querySelector('.rating-message p');
    if (messageElement) {
      if (this.selectedRating === 0) {
        messageElement.textContent = this.getText('pleaseRateUs');
      } else {
        const selectedLabel = this.ratingLabels[this.selectedRating - 1];
        messageElement.textContent = selectedLabel + '!';
      }
    }
  }

  updateActionButton() {
    const actionButton = document.getElementById('rateUsActionButton');
    if (actionButton) {
      if (this.selectedRating > 0) {
        actionButton.classList.add('active');
      } else {
        actionButton.classList.remove('active');
      }
    }
  }

  handleRatingAction() {
    if (this.selectedRating === 0) {
      return;
    }
    
    // If rating is 3 (Good) or higher, redirect to Chrome Web Store
    if (this.selectedRating >= 3) {
      chrome.tabs.create({
        url: 'https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb/reviews/my-review'
      });
    }
    
    // Close the modal
    this.closeRatingModal();
    
    // Show a thank you message
    this.showNotification(this.getText('thankYouForRating'), 'success');
    
    // Record the rating (optional - for analytics)
    this.recordRating(this.selectedRating);
  }

  recordRating(rating) {
    // You can implement rating tracking here if needed
    console.log('User rated:', rating, 'stars');
    
    // Save to local storage to prevent showing again
    try {
      chrome.storage.local.set({
        'userRated': true,
        'ratingValue': rating,
        'ratingDate': Date.now()
      });
    } catch (error) {
      console.warn('Failed to save rating:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  window.i18n = new I18n();
  await window.i18n.init();
  new ClearTokExtension();
});
