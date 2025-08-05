chrome.runtime.sendMessage({ action: 'ensureSelectors' });

class ClearTokExtension {
  constructor() {
    this.currentState = 'welcome';
    this.isProcessing = false;
    this.isPaused = false;
    this.authorCounts = new Map();
    this.totalVideos = 0;
    this.processedVideos = 0;
    this.removedVideos = 0;
    this.actionLog = [];
    this.removedUrls = []; // Track removed video URLs
    this.pendingUrls = []; // Track pending video URLs
    this.currentTikTokTab = null;
    this.processedMessages = new Set(); // Track processed messages to prevent duplicates
    this.lastMessageTimestamp = 0; // Track last message timestamp
    
    // --- 会话追踪 (Session Tracking) ---
    this.sessionId = null;
    this.sessionStartTime = null;
    this.tikTokUsername = null;
    
    // Session管理配置
    this.SESSION_EXPIRY_TIME = 60 * 60 * 1000; // 1小时过期
    this.SESSION_STORAGE_KEY = 'clearTokSessionData';
    
    // 状态缓存
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

  // 初始化会话
  async initializeSession() {
    try {
      const existingSession = await this.getStoredSession();
      if (existingSession && this.isSessionValid(existingSession)) {
        this.sessionId = existingSession.sessionId;
        this.sessionStartTime = existingSession.sessionStartTime;
        this.tikTokUsername = existingSession.tikTokUsername;
        console.log('复用现有session:', this.sessionId);
        await this.updateStoredSession({ ...existingSession, lastActiveTime: Date.now() });
        return;
      }
      
      // 如果没有有效会话，则创建新的
      this.sessionStartTime = Date.now();
      // 假设 window.apiService.createSession() 是一个真实存在的函数
      const response = await window.apiService.createSession(); 
      this.sessionId = response.session_id;
      console.log('创建新session:', this.sessionId);
      await this.saveSessionToStorage();
      
      // 追踪会话创建事件
      this.trackEvent('session_initialized');
      
    } catch (error) {
      console.warn('Failed to initialize session:', error);
    }
  }

  // 追踪关键事件的函数
  async trackEvent(eventName, data = {}) {
    if (!this.sessionId) {
      // 等待 2000ms 后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!this.sessionId) {
        console.warn(`Cannot track event "${eventName}", no session ID.`);
        return;
      }
      console.warn(`Cannot track event "${eventName}", no session ID.`);
      return;
    }
    
    try {
      const payload = {
        event_name: eventName,
        ...data,
      };
      
      // 使用现有的API更新函数来发送事件
      await window.apiService.updateSession(this.sessionId, payload);
      console.log(`✅ Event tracked: ${eventName}`, payload);
      
      // 如果事件中包含用户名，则更新本地存储
      if (data.tiktok_username) {
          this.tikTokUsername = data.tiktok_username;
          await this.saveSessionToStorage();
      }

    } catch (error) {
      console.warn(`Failed to track event "${eventName}":`, error);
    }
  }

  // --- Session 存储管理方法 (保持不变) ---
  
  async getStoredSession() {
    try {
      const result = await chrome.storage.local.get([this.SESSION_STORAGE_KEY]);
      return result[this.SESSION_STORAGE_KEY] || null;
    } catch (error) {
      console.warn('Failed to get stored session:', error); return null;
    }
  }
  
  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.sessionId || !sessionData.createdTime) return false;
    const sessionAge = Date.now() - sessionData.createdTime;
    if (sessionAge > this.SESSION_EXPIRY_TIME) {
        console.log('Session expired, age:', Math.floor(sessionAge / 1000 / 60), 'minutes');
        return false;
    }
    return true;
  }
  
  async saveSessionToStorage() {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        sessionStartTime: this.sessionStartTime,
        tikTokUsername: this.tikTokUsername,
        createdTime: Date.now(),
        lastActiveTime: Date.now(),
      };
      await chrome.storage.local.set({ [this.SESSION_STORAGE_KEY]: sessionData });
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  }
  
  async updateStoredSession(sessionData) {
      try {
          await chrome.storage.local.set({ [this.SESSION_STORAGE_KEY]: sessionData });
      } catch (error) {
          console.warn('Failed to update stored session:', error);
      }
  }
  
  async clearStoredSession() {
      try {
          await chrome.storage.local.remove([this.SESSION_STORAGE_KEY]);
          console.log('Stored session cleared');
      } catch (error) {
          console.warn('Failed to clear stored session:', error);
      }
  }
  
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

  // Helper method to get translated text with substitutions
  getText(key, substitutions = {}) {
    if (window.i18n && window.i18n.getMessage) {
      return window.i18n.getMessage(key, substitutions);
    }
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      let message = chrome.i18n.getMessage(key);
      if (message) {
        Object.keys(substitutions).forEach(placeholder => {
          message = message.replace(new RegExp(`{${placeholder}}`, 'g'), substitutions[placeholder]);
        });
        return message;
      }
    }
    return key;
  }

  initializeEventListeners() {
    document.getElementById('openTikTokStep')?.addEventListener('click', () => this.openTikTok());
    document.getElementById('startButton')?.addEventListener('click', () => this.startRemoval());
    document.getElementById('pauseButton')?.addEventListener('click', () => this.togglePause());
    document.getElementById('viewLogButton')?.addEventListener('click', () => this.showDetailedLog());
    document.getElementById('retryButton')?.addEventListener('click', () => this.restart());
    document.getElementById('rateUsButton')?.addEventListener('click', () => this.showRatingModal());
    document.getElementById('rateUsButtonComplete')?.addEventListener('click', () => this.showRatingModal());
    document.getElementById('rateUsActionButton')?.addEventListener('click', () => this.handleRatingAction());
    document.getElementById('submitFeedbackButton')?.addEventListener('click', () => this.handleFeedbackSubmit());
    document.getElementById('alreadyRatedButton')?.addEventListener('click', () => this.closeRatingModal());
    
    this.initializeRatingModal();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessageWithDeduplication(message);
    });
  }

  handleMessageWithDeduplication(message) {
    const messageId = `${message.action}_${message.timestamp || Date.now()}_${message.instanceId || 'default'}`;
    if (this.processedMessages.has(messageId)) {
      console.log('Duplicate message detected, skipping:', messageId);
      return;
    }
    const now = Date.now();
    if (message.timestamp && Math.abs(now - message.timestamp) < 500) {
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
    this.processedMessages.add(messageId);
    if (this.processedMessages.size > 100) {
      const ids = Array.from(this.processedMessages);
      ids.slice(0, 50).forEach(id => this.processedMessages.delete(id));
    }
    this.handleMessage(message);
  }

  async openTikTok() {
    try {
      const tab = await chrome.tabs.create({ url: "https://www.tiktok.com/", active: true });
      this.currentTikTokTab = tab;
      this.updateLoginStatus('opening');
      setTimeout(async () => {
        chrome.runtime.sendMessage({
          action: 'ensureAndCheckLogin',
          tabId: tab.id  
        });
      }, 4000);
    } catch (error) {
      console.log('Error opening TikTok:', error);
      this.updateLoginStatus('error');
    }
  }

  async checkTikTokLogin() {
    try {
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length > 0) {
        this.currentTikTokTab = tabs[0];
        chrome.runtime.sendMessage({
          action: 'ensureAndCheckLogin',
          tabId: tabs[0].id
        });
      } else {
        this.updateLoginStatus('waiting');
      }
    } catch (error) {
      console.log('Error checking TikTok tabs:', error);
      this.updateLoginStatus('waiting');
    }
  }

  updateLoginStatus(status) {
    if (this.currentLoginStatus === status) return;
    this.currentLoginStatus = status;
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) {
      switch (status) {
        case 'loggedIn':
          loginStatus.innerHTML = `<span class="status-indicator">✅</span> <span>${this.getText('loginStatusLoggedIn')}</span>`;
          break;
        case 'notLoggedIn':
          loginStatus.innerHTML = `<span class="status-indicator">⚠️</span> <span style="color: var(--color-warning)">${this.getText('loginStatusNotLoggedIn')}</span>`;
          break;
        case 'ready':
          loginStatus.innerHTML = `<span class="status-indicator">✅</span> <span>${this.getText('loginStatusReady')}</span>`;
          break;
        case 'opening':
          loginStatus.innerHTML = `<span class="status-indicator">🔄</span> <span>${this.getText('loginStatusOpening')}</span>`;
          break;
        case 'error':
          loginStatus.innerHTML = `<span class="status-indicator">❌</span> <span>${this.getText('loginStatusError')}</span>`;
          break;
        default:
          loginStatus.innerHTML = `<span class="status-indicator">👆</span> <span>${this.getText('loginStatusDefault')}</span>`;
      }
    }
  }

  async startRemoval() {
    if (this.isProcessing) return;
    try {
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length === 0) {
        alert(this.getText('alertOpenTikTokFirst'));
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkLoginStatus' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log('Error checking tabs:', error);
    }
    this.isProcessing = true;
    
    // 追踪 "处理开始" 事件
    this.trackEvent('process_started');
    
    this.clearProcessingData();
    this.setState('processing');
    this.updateStatus(this.getText('statusInitializing'));
    this.updateProgress(0, 1);
    this.addLogEntry(this.getText('logStartingProcess'), 'info');
    
    try {
      chrome.runtime.sendMessage({ 
        action: "removeRepostedVideos",
        extensionId: chrome.runtime.id
      });
    } catch (error) {
      this.handleError('Failed to start removal process', error);
    }
  }

  clearProcessingData() {
    this.totalVideos = 0;
    this.processedVideos = 0;
    this.removedVideos = 0;
    this.actionLog = [];
    this.removedUrls = [];
    this.pendingUrls = [];
    this.authorCounts = new Map();
    
    const actionLog = document.getElementById('actionLog');
    if (actionLog) actionLog.innerHTML = '';

    const statsList = document.getElementById('repostStatsList');
    if (statsList) {
      statsList.innerHTML = `<li class="stats-item-placeholder" data-i18n="loadingStats">Scanning for your favorite creators...</li>`;
    }
    
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
    
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = '0 / 0';
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
        const wasRemoved = this.removedUrls.find(removed => removed.url === item.url);
        if (!wasRemoved) {
          logContent += `${index + 1}. ${item.title || this.getText('videoUnknownTitle')} by ${item.author || this.getText('videoUnknownAuthor')}\n`;
          logContent += `   ${item.url}\n`;
          logContent += `   ${this.getText('videoStatusPending')}\n\n`;
        }
      });
    }
    if (logContent.trim() === '') {
      this.showNotification(this.getText('notificationNoUrls'), 'info');
      return;
    }
    navigator.clipboard.writeText(logContent).then(() => {
      this.addLogEntry(this.getText('logVideoUrlsCopied'), 'info');
      this.showNotification(this.getText('notificationUrlsCopied'), 'success');
    }).catch(() => {
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
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: var(--color-surface);
      border: 1px solid ${type === 'error' ? 'var(--color-warning)' : type === 'success' ? 'var(--color-success)' : 'var(--color-accent-alt)'};
      border-radius: 8px; padding: 12px 16px; color: var(--color-text);
      z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 300px; animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
      }, 300);
    }, 3000);
  }

  restart() {
    this.isProcessing = false;
    this.isPaused = false;
    
    // 追踪 "重启" 事件
    if (this.sessionId) {
      this.trackEvent('process_restarted');
    }
    
    this.clearProcessingData();
    this.setState('welcome');
    
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
      pauseButton.textContent = this.getText('pauseButton');
      pauseButton.className = 'control-button pause';
    }
    this.checkTikTokLogin();
  }

  setState(newState) {
    this.currentState = newState;
    const states = ['welcome', 'processing', 'complete', 'error'];
    states.forEach(state => {
      const element = document.getElementById(`${state}State`);
      if (element) element.style.display = 'none';
    });
    const currentElement = document.getElementById(`${newState}State`);
    if (currentElement) currentElement.style.display = 'block';
  }

  updateStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) statusElement.textContent = message;
  }

  updateProgress(current, total) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (progressFill && progressText) {
      const percentage = total > 0 ? (current / total) * 100 : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${current} / ${total}`;
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
    if (videoInfo && videoInfo.url) {
      content += `<div class="log-video-info"><button class="video-link-btn" data-url="${videoInfo.url}">🔗 Open Video</button></div>`;
    }
    logEntry.innerHTML = content;
    actionLog.appendChild(logEntry);
    actionLog.scrollTop = actionLog.scrollHeight;
    while (actionLog.children.length > 100) {
      actionLog.removeChild(actionLog.firstChild);
    }
    this.actionLog.push({ timestamp, type, message, videoInfo });
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
    this.removedUrls.push({ ...videoInfo, timestamp: new Date().toLocaleString() });
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
  }

  updateRemovedVideosList(listId, countId) {
    const list = document.getElementById(listId);
    const count = document.getElementById(countId);
    if (list && count) {
      count.textContent = this.removedUrls.length;
      if (this.removedUrls.length > 0) {
        list.innerHTML = this.removedUrls.slice(-10).map((video, index) => `
          <div class="removed-video-item">
            <div class="video-info">
              <strong>${this.escapeHtml(video.title || this.getText('videoUnknownTitle'))}</strong>
              <span class="video-author">by ${this.escapeHtml(video.author || this.getText('videoUnknownAuthor'))}</span>
            </div>
            <button class="video-link-btn" data-url="${video.url}" aria-label="Open video link">🔗</button>
          </div>
        `).join('');
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
          if (message.username && message.username !== this.tikTokUsername) {
            console.log('TikTok username detected:', message.username);
            this.trackEvent('user_logged_in', { tiktok_username: message.username });
          }
          this.updateLoginStatus('loggedIn');
        } else if (message.method === 'username-check' && !message.isLoggedIn) {
          if (this.tikTokUsername !== null) {
              this.tikTokUsername = null;
              this.trackEvent('user_logged_out');
          }
          this.updateLoginStatus('notLoggedIn');
          this.showNotification('⚠️ Please log in to TikTok.com to continue', 'error');
        } else {
          this.updateLoginStatus('ready');
        }
        break;
      case 'updateProgress':
        // 追踪 totalVideos 初始化事件
        if (this.totalVideos === 0 && message.total > 0) {
          this.trackEvent('total_reposts_found', { 
            total_reposts_found: message.total 
          });
        }
        this.processedVideos = message.current;
        this.totalVideos = message.total;
        this.updateProgress(message.current, message.total);
        this.updateStatus(`Processing video ${message.current} of ${message.total}`);
        break;
      case 'videoRemoved':
        console.log('------------videoRemoved', message);
        this.removedVideos++;
        if (message.title || message.author || message.url) {
          this.addRemovedVideo({ title: message.title, author: message.author, url: message.url });
        }
        
        // 在这里添加作者统计逻辑
        if (message.author) {
          const currentCount = this.authorCounts.get(message.author) || 0;
          this.authorCounts.set(message.author, currentCount + 1);
          this.updateStatsChart(); // 更新统计图表
        }
        
        let removeLogMessage = this.getText('logVideoRemoved', {number: message.index});
        if (message.title && message.author) removeLogMessage = this.getText('logVideoRemovedWithTitle', {title: message.title, author: message.author});
        else if (message.title) removeLogMessage = this.getText('logVideoRemovedTitleOnly', {title: message.title});
        else if (message.author) removeLogMessage = this.getText('logVideoRemovedAuthorOnly', {author: message.author});
        this.addLogEntry(removeLogMessage, 'success', { title: message.title, author: message.author, url: message.url });
        break;
      case 'videoSkipped':
        let skipLogMessage = this.getText('logVideoSkipped', {number: message.index});
        if (message.title && message.author) skipLogMessage = this.getText('logVideoSkippedWithTitle', {title: message.title, author: message.author});
        else if (message.title) skipLogMessage = this.getText('logVideoSkippedTitleOnly', {title: message.title});
        else if (message.author) skipLogMessage = this.getText('logVideoSkippedAuthorOnly', {author: message.author});
        skipLogMessage = this.getText('logVideoSkippedWithReason', {message: skipLogMessage, reason: message.reason});
        this.addLogEntry(skipLogMessage, 'info');
        break;
      case 'waiting':
        if (message.seconds === 'paused') this.addLogEntry(this.getText('logWaitingPaused'), 'waiting');
        else if (typeof message.seconds === 'number') this.addLogEntry(this.getText('logWaitingSeconds', {seconds: message.seconds}), 'waiting');
        break;
      case 'statusUpdate':
        this.updateStatus(message.status);
        if (['Starting', 'Navigating', 'Looking', 'Loading', 'Found', 'Opening', 'Resuming', 'Closing'].some(term => message.status.includes(term))) {
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
    this.setState('error');
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) errorMessage.textContent = message;
    
    // 追踪 "错误" 事件
    this.trackEvent('process_error', { 
      error_message: message,
      error_details: error ? error.toString() : ''
    });
    
    this.addLogEntry(this.getText('logError', {message: message}), 'error');
    if (error) console.error('Extension error:', error);
  }

  handleCompletion(message) {
    this.isProcessing = false;
    this.setState('complete');
    const removedCount = message.removedCount || 0;
    const duration = message.duration;
    let durationText = '';
    const totalDurationSeconds = this.sessionStartTime ? Math.floor((Date.now() - this.sessionStartTime) / 1000) : (duration ? Math.floor(duration.total / 1000) : 0);
    
    // 追踪 "完成" 事件，并附上最终数据
    this.trackEvent('process_completed', {
      reposts_removed: removedCount,
      total_duration_seconds: totalDurationSeconds
    });

    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
      if (duration) {
        durationText = duration.minutes > 0 ? this.getText('durationMinutes', {minutes: duration.minutes, seconds: duration.seconds}) : this.getText('durationSeconds', {seconds: duration.seconds});
      }
      completionMessage.textContent = this.getText('completionMessageSuccess', { count: removedCount, plural: removedCount !== 1 ? 's' : '', duration: durationText });
    }
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
    const copyRemovedButton = document.getElementById('copyRemovedButton');
    if (copyRemovedButton) {
      copyRemovedButton.style.display = this.removedUrls.length > 0 ? 'block' : 'none';
      copyRemovedButton.onclick = () => this.copyRemovedList();
    }
    this.addLogEntry(this.getText('logProcessCompleted', {count: removedCount, duration: durationText}), 'success');
    if (removedCount > 0) {
      this.refreshTikTokPage();
    }
  }
  
  async refreshTikTokPage() {
    try {
      const tabs = await chrome.tabs.query({ url: "*://www.tiktok.com/*" });
      if (tabs.length > 0) {
        await chrome.tabs.reload(tabs[0].id);
        this.addLogEntry(this.getText('logRefreshingPage'), 'info');
        this.showNotification(this.getText('notificationPageRefreshed'), 'success');
        setTimeout(async () => {
          chrome.runtime.sendMessage({
            action: 'ensureAndCheckLogin',
            tabId: tabs[0].id
          });
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
    this.setState('complete');
    
    // 追踪 "未找到转帖" 事件
    this.trackEvent('no_reposts_found');
    
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) completionMessage.textContent = this.getText('noRepostsFoundMessage');
    const copyRemovedButton = document.getElementById('copyRemovedButton');
    if (copyRemovedButton) copyRemovedButton.style.display = 'none';
    this.addLogEntry(this.getText('logNoRepostsFound', {duration: ''}), 'info');
    this.showNotification(this.getText('notificationNoRepostsFound'), 'info');
  }

  // Rating Modal Functions
  initializeRatingModal() {
    this.selectedRating = 0;
    this.ratingLabels = ['Bad', 'Okay', 'Good', 'Great', 'Love it!'];
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.addEventListener('click', () => this.selectRating(index + 1));
      star.addEventListener('mouseenter', () => this.hoverRating(index + 1));
    });
    const labels = document.querySelectorAll('.rating-label');
    labels.forEach((label, index) => {
      label.addEventListener('click', () => this.selectRating(index + 1));
    });
    document.getElementById('ratingModal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) this.closeRatingModal();
    });
    document.querySelector('.stars-container')?.addEventListener('mouseleave', () => {
      this.updateStarDisplay(this.selectedRating);
    });
    
    // 添加反馈输入框的字符计数功能
    const feedbackInput = document.getElementById('feedbackInput');
    const feedbackCharCount = document.getElementById('feedbackCharCount');
    if (feedbackInput && feedbackCharCount) {
      feedbackInput.addEventListener('input', () => {
        const currentLength = feedbackInput.value.length;
        feedbackCharCount.textContent = currentLength;
        
        // 更新字符计数颜色
        if (currentLength > 450) {
          feedbackCharCount.style.color = 'var(--color-warning)';
        } else {
          feedbackCharCount.style.color = 'var(--color-text-secondary)';
        }
      });
    }
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
    if (modal) modal.classList.add('hidden');
  }

  resetRatingModal() {
    this.selectedRating = 0;
    this.updateStarDisplay(0);
    this.updateRatingMessage();
    this.updateActionButton();
    this.updateFeedbackSection();
    
    // 重置反馈输入框
    const feedbackInput = document.getElementById('feedbackInput');
    const feedbackCharCount = document.getElementById('feedbackCharCount');
    if (feedbackInput) {
      feedbackInput.value = '';
    }
    if (feedbackCharCount) {
      feedbackCharCount.textContent = '0';
      feedbackCharCount.style.color = 'var(--color-text-secondary)';
    }
  }

  selectRating(rating) {
    this.selectedRating = rating;
    this.updateStarDisplay(rating);
    this.updateRatingMessage();
    this.updateActionButton();
    this.updateFeedbackSection();
  }

  hoverRating(rating) {
    if (this.selectedRating === 0) this.updateStarDisplay(rating);
  }

  updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    const labels = document.querySelectorAll('.rating-label');
    stars.forEach((star, index) => star.classList.toggle('active', index < rating));
    labels.forEach((label, index) => label.classList.toggle('active', index === rating - 1));
  }

  updateRatingMessage() {
    const messageElement = document.querySelector('.rating-message p');
    if (messageElement) {
      if (this.selectedRating === 0) messageElement.textContent = this.getText('pleaseRateUs');
      else messageElement.textContent = this.ratingLabels[this.selectedRating - 1] + '!';
    }
  }

  updateActionButton() {
    const actionButton = document.getElementById('rateUsActionButton');
    const feedbackButton = document.getElementById('submitFeedbackButton');
    
    if (actionButton) {
      actionButton.classList.toggle('active', this.selectedRating > 0);
      // 当评分≤3时，隐藏评分按钮，显示反馈按钮
      actionButton.classList.toggle('hidden', this.selectedRating > 0 && this.selectedRating <= 3);
    }
    
    if (feedbackButton) {
      // 只有当评分≤3时才显示反馈提交按钮
      feedbackButton.classList.toggle('hidden', this.selectedRating === 0 || this.selectedRating > 3);
      feedbackButton.classList.toggle('active', this.selectedRating > 0 && this.selectedRating <= 3);
    }
  }

  updateFeedbackSection() {
    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) {
      // 评分≤3时显示反馈区域
      if (this.selectedRating > 0 && this.selectedRating <= 3) {
        feedbackSection.classList.remove('hidden');
      } else {
        feedbackSection.classList.add('hidden');
      }
    }
  }

  async handleFeedbackSubmit() {
    if (this.selectedRating === 0 || this.selectedRating > 3) {
      return;
    }

    const feedbackInput = document.getElementById('feedbackInput');
    const feedbackText = feedbackInput ? feedbackInput.value.trim() : '';
    
    // 记录评分和反馈
    this.recordRating(this.selectedRating, feedbackText);
    
    // 发送反馈到后端
    try {
      if (this.sessionId && window.apiService) {
        await window.apiService.submitFeedback(this.sessionId, {
          rating: this.selectedRating,
          feedback: feedbackText
        });
      }
    } catch (error) {
      console.warn('Failed to submit feedback to backend:', error);
    }
    
    // 关闭模态框并显示感谢消息
    this.closeRatingModal();
    this.showNotification(this.getText('thankYouForFeedback', { rating: this.selectedRating }), 'success');
  }

  // 添加浏览器检测函数
  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('edg/') || userAgent.includes('edge/')) {
      return 'edge';
    } else if (userAgent.includes('chrome/') || userAgent.includes('chromium/')) {
      return 'chrome';
    }
    return 'chrome'; // 默认返回chrome
  }

  // 获取对应的商店URL
  getStoreUrl() {
    const browser = this.detectBrowser();
    if (browser === 'edge') {
      return 'https://microsoftedge.microsoft.com/addons/login?ru=/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc';
    } else {
      return 'https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb/reviews/my-review';
    }
  }

  async handleRatingAction() {
    if (this.selectedRating === 0) return;
    
    // 记录评分
    this.recordRating(this.selectedRating);
    
    // 发送反馈到后端（对于高分用户，反馈为空）
    try {
      if (this.sessionId && window.apiService) {
        await window.apiService.submitFeedback(this.sessionId, {
          rating: this.selectedRating,
          feedback: '' // 高分用户的反馈为空
        });
      }
    } catch (error) {
      console.warn('Failed to submit feedback to backend:', error);
    }
    
    // 只有高分（4-5星）才跳转到商店页面
    if (this.selectedRating >= 4) {
      const storeUrl = this.getStoreUrl();
      chrome.tabs.create({ url: storeUrl });
    }
    
    this.closeRatingModal();
    this.showNotification(this.getText('thankYouForRating'), 'success');
  }

  recordRating(rating, feedback = '') {
    console.log('User rated:', rating, 'stars', feedback ? 'with feedback' : 'without feedback');
    try {
      chrome.storage.local.set({ 
        'userRated': true, 
        'ratingValue': rating, 
        'ratingFeedback': feedback,
        'ratingDate': Date.now() 
      });
    } catch (error) {
      console.warn('Failed to save rating:', error);
    }
  }

  updateStatsChart() {
    const statsList = document.getElementById('repostStatsList');
    if (!statsList) return;

    // 1. 将Map转换为数组并排序
    const sortedAuthors = Array.from(this.authorCounts.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count);

    // 2. 取前10名
    const topAuthors = sortedAuthors.slice(0, 6);
    if (topAuthors.length === 0) return;

    // 3. 计算最大值用于标准化宽度
    const maxCount = topAuthors[0].count;

    // 4. 生成HTML
    statsList.innerHTML = topAuthors.map((item, index) => {
      const widthPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
      const rankIcons = ['🥇', '🥈', '🥉'];
      const rank = index < 3 ? rankIcons[index] : `#${index + 1}`;

      // 使用 escapeHtml 防止XSS
      const authorName = this.escapeHtml(item.author);

      return `
        <li class="stats-item">
          <span class="stats-rank">${rank}</span>
          <span class="stats-author-name" title="${authorName}">${authorName}</span>
          <div class="stats-bar-wrapper">
            <div class="stats-bar" style="width: ${widthPercentage}%;"></div>
          </div>
          <span class="stats-count">${item.count}</span>
        </li>
      `;
    }).join('');
  }
}

// 确保在 DOM 加载完成后初始化
// 假设你有一个 I18n 类用于国际化
document.addEventListener('DOMContentLoaded', async () => {
  // 假设 window.i18n 和 window.apiService 已经通过其他脚本注入
  if (typeof I18n !== 'undefined') {
    window.i18n = new I18n();
    await window.i18n.init();
  }
  new ClearTokExtension();
});