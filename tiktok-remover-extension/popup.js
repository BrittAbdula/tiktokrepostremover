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
    
    this.initializeEventListeners();
    this.checkTikTokLogin();
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
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) {
      switch (status) {
        case 'loggedIn':
          loginStatus.innerHTML = `
            <span class="status-indicator">✅</span>
            <span>Logged in - Ready to start!</span>
          `;
          break;
        case 'notLoggedIn':
          loginStatus.innerHTML = `
            <span class="status-indicator">⚠️</span>
            <span style="color: var(--color-warning)">Please log in to TikTok first</span>
          `;
          break;
        case 'ready':
          loginStatus.innerHTML = `
            <span class="status-indicator">✅</span>
            <span>TikTok.com is open - Ready to start!</span>
          `;
          break;
        case 'opening':
          loginStatus.innerHTML = `
            <span class="status-indicator">🔄</span>
            <span>Opening TikTok.com...</span>
          `;
          break;
        case 'error':
          loginStatus.innerHTML = `
            <span class="status-indicator">❌</span>
            <span>Error opening TikTok - Try again</span>
          `;
          break;
        default:
          loginStatus.innerHTML = `
            <span class="status-indicator">👆</span>
            <span>Click to open TikTok.com</span>
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
        alert('Please open TikTok.com first by clicking Step 1');
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
    
    // Clear previous data and switch to processing state
    this.clearProcessingData();
    this.setState('processing');
    
    // Initialize with real starting status
    this.updateStatus('Initializing...');
    this.updateProgress(0, 1);
    this.addLogEntry('🚀 Starting repost removal process...', 'info');
    
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
      pauseButton.textContent = '▶️ Resume';
      pauseButton.className = 'control-button resume';
      this.addLogEntry('Process paused by user', 'info');
      chrome.runtime.sendMessage({ action: "pauseRemoval" });
    } else {
      pauseButton.textContent = '⏸️ Pause';
      pauseButton.className = 'control-button pause';
      this.addLogEntry('Process resumed', 'info');
      chrome.runtime.sendMessage({ action: "resumeRemoval" });
    }
  }

  showDetailedLog() {
    // Create URL-only log content
    let logContent = '';
    
    if (this.removedUrls.length > 0) {
      logContent += '=== REMOVED VIDEOS ===\n';
      this.removedUrls.forEach((item, index) => {
        logContent += `${index + 1}. ${item.title || 'Unknown'} by ${item.author || 'Unknown'}\n`;
        logContent += `   ${item.url}\n`;
        logContent += `   Removed at: ${item.timestamp}\n\n`;
      });
    }
    
    if (this.pendingUrls.length > 0) {
      logContent += '=== PENDING/PROCESSED VIDEOS ===\n';
      this.pendingUrls.forEach((item, index) => {
        // Check if this URL was actually removed
        const wasRemoved = this.removedUrls.find(removed => removed.url === item.url);
        if (!wasRemoved) {
          logContent += `${index + 1}. ${item.title || 'Unknown'} by ${item.author || 'Unknown'}\n`;
          logContent += `   ${item.url}\n`;
          logContent += `   Status: Pending/Skipped\n\n`;
        }
      });
    }
    
    if (logContent.trim() === '') {
      // Show notification for empty log
      this.showNotification('📝 No video URLs available yet. Start the removal process to see video URLs.', 'info');
      return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(logContent).then(() => {
      this.addLogEntry('📋 Video URLs copied to clipboard', 'info');
      this.showNotification('📋 Video URLs copied to clipboard successfully!', 'success');
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = logContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.addLogEntry('📋 Video URLs copied to clipboard', 'info');
        this.showNotification('📋 Video URLs copied to clipboard successfully!', 'success');
      } catch (err) {
        this.addLogEntry('❌ Failed to copy URLs', 'error');
        this.showNotification('❌ Failed to copy URLs to clipboard', 'error');
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
    this.currentState = 'welcome';
    this.isProcessing = false;
    this.isPaused = false;
    this.totalVideos = 0;
    this.processedVideos = 0;
    this.removedVideos = 0;
    this.actionLog = [];
    this.removedUrls = [];
    this.pendingUrls = [];
    
    this.setState('welcome');
    this.checkTikTokLogin();
    
    // Clear the action log display
    const actionLog = document.getElementById('actionLog');
    if (actionLog) {
      actionLog.innerHTML = '';
    }
    
    // Clear removed videos lists
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
  }

  setState(newState) {
    // Hide all states
    document.querySelectorAll('.state').forEach(state => {
      state.classList.add('hidden');
    });
    
    // Show the new state
    const stateElement = document.getElementById(`${newState}State`);
    if (stateElement) {
      stateElement.classList.remove('hidden');
    }
    
    this.currentState = newState;
  }

  updateStatus(message) {
    const statusElement = document.getElementById('currentStatus');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  updateProgress(current, total) {
    this.processedVideos = current;
    this.totalVideos = total;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      if (total > 0) {
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${current} / ${total}`;
      } else {
        progressFill.style.width = '0%';
        progressText.textContent = `${current} / ${total}`;
      }
    }
  }

  addLogEntry(message, type = 'info', videoInfo = null) {
    const actionLog = document.getElementById('actionLog');
    if (!actionLog) return;

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    
    // Create timestamp
    const timestamp = new Date().toLocaleTimeString();
    
    let icon = '';
    switch (type) {
      case 'success':
        icon = '✅';
        break;
      case 'error':
        icon = '❌';
        break;
      case 'waiting':
        icon = '⏱️';
        break;
      case 'info':
      default:
        icon = 'ℹ️';
        break;
    }
    
    logItem.innerHTML = `
      <div class="log-content">
        <span class="log-icon">${icon}</span>
        <span class="log-message">${message}</span>
      </div>
      <span class="log-timestamp">${timestamp}</span>
    `;
    
    // Add the new log entry at the top
    actionLog.insertBefore(logItem, actionLog.firstChild);
    
    // Keep only the last 50 log entries
    while (actionLog.children.length > 50) {
      actionLog.removeChild(actionLog.lastChild);
    }
    
    // Add fade-in animation
    logItem.style.opacity = '0';
    logItem.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      logItem.style.transition = 'all 0.3s ease';
      logItem.style.opacity = '1';
      logItem.style.transform = 'translateY(0)';
    });
  }

  // Add new method to update removed videos list
  addRemovedVideo(videoInfo) {
    // Add to removedUrls array
    this.removedUrls.push({
      ...videoInfo,
      timestamp: new Date().toLocaleString()
    });
    
    // Update both processing and complete state lists
    this.updateRemovedVideosList('removedVideosList', 'removedCount');
    this.updateRemovedVideosList('removedVideosListComplete', 'removedCountComplete');
  }

  updateRemovedVideosList(listId, countId) {
    const videosList = document.getElementById(listId);
    const countElement = document.getElementById(countId);
    
    if (!videosList || !countElement) return;
    
    // Update count
    countElement.textContent = this.removedUrls.length;
    
    // Clear existing list
    videosList.innerHTML = '';
    
    // Add each removed video
    this.removedUrls.forEach((video, index) => {
      const videoItem = document.createElement('div');
      videoItem.className = 'removed-video-item';
      videoItem.onclick = () => this.openVideoInNewTab(video.url);
      
      videoItem.innerHTML = `
        <div class="video-title">${this.escapeHtml(video.title || 'Unknown Video')}</div>
        <div class="video-author">${this.escapeHtml(video.author || '@unknown')}</div>
        <div class="video-timestamp">Removed: ${video.timestamp}</div>
        <div class="video-url-indicator">🔗 Click to open video</div>
      `;
      
      videosList.appendChild(videoItem);
    });
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
          this.updateLoginStatus('loggedIn');
        } else if (message.method === 'username-check' && !message.isLoggedIn) {
          this.updateLoginStatus('notLoggedIn');
          this.showNotification('⚠️ Please log in to TikTok.com to continue', 'error');
        } else {
          this.updateLoginStatus('ready');
        }
        break;
        
      case 'updateProgress':
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
        let removeLogMessage = `Removed repost #${message.index}`;
        if (message.title && message.author) {
          removeLogMessage = `Removed: "${message.title}" by ${message.author}`;
        } else if (message.title) {
          removeLogMessage = `Removed: "${message.title}"`;
        } else if (message.author) {
          removeLogMessage = `Removed repost by ${message.author}`;
        }
        
        this.addLogEntry(removeLogMessage, 'success', {
          title: message.title,
          author: message.author,
          url: message.url
        });
        break;
        
      case 'videoSkipped':
        // Create detailed skip message
        let skipLogMessage = `Skipped #${message.index}`;
        if (message.title && message.author) {
          skipLogMessage = `Skipped: "${message.title}" by ${message.author}`;
        } else if (message.title) {
          skipLogMessage = `Skipped: "${message.title}"`;
        } else if (message.author) {
          skipLogMessage = `Skipped video by ${message.author}`;
        }
        skipLogMessage += ` (${message.reason})`;
        this.addLogEntry(skipLogMessage, 'info');
        break;
        
      case 'waiting':
        if (message.seconds === 'paused') {
          this.addLogEntry('Process paused', 'waiting');
        } else if (typeof message.seconds === 'number') {
          // Show waiting countdown
          this.addLogEntry(`Waiting ${message.seconds}s...`, 'waiting');
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
    this.setState('error');
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    
    this.addLogEntry(`Error: ${message}`, 'error');
    if (error) {
      console.error('Extension error:', error);
    }
  }

  handleCompletion(message) {
    this.isProcessing = false;
    this.setState('complete');
    
    const removedCount = message.removedCount || 0;
    const duration = message.duration;
    
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
      let durationText = '';
      if (duration) {
        if (duration.minutes > 0) {
          durationText = ` in ${duration.minutes} min ${duration.seconds} seconds`;
        } else {
          durationText = ` in ${duration.seconds} seconds`;
        }
      }
      
      completionMessage.textContent = 
        `Successfully removed ${removedCount} reposted video${removedCount !== 1 ? 's' : ''}${durationText}.`;
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
    
    this.addLogEntry(`🎉 Process completed! Removed ${removedCount} videos${durationText}.`, 'success');
    
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
        
        this.addLogEntry('🔄 Refreshing TikTok page to show updated content...', 'info');
        this.showNotification('🔄 TikTok page refreshed, navigating to reposts...', 'success');
        
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
            }, 2000);
            
            this.addLogEntry('🎯 Navigating to reposts tab to show results...', 'info');
            
          } catch (error) {
            console.log('Error navigating to reposts:', error);
            this.addLogEntry('✅ Page refreshed successfully', 'success');
          }
          
          // Check login status
          this.checkTikTokLogin();
        }, 3000);
      }
    } catch (error) {
      console.log('Error refreshing TikTok page:', error);
      this.addLogEntry('⚠️ Unable to refresh page automatically', 'info');
    }
  }

  copyRemovedList() {
    // Create formatted list of removed videos
    let listContent = `=== REMOVED VIDEOS (${this.removedUrls.length} total) ===\n\n`;
    
    this.removedUrls.forEach((item, index) => {
      listContent += `${index + 1}. ${item.title || 'Unknown'} by ${item.author || 'Unknown'}\n`;
      listContent += `   ${item.url}\n`;
      listContent += `   Removed at: ${item.timestamp}\n\n`;
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(listContent).then(() => {
      this.addLogEntry('📋 Removed videos list copied to clipboard', 'info');
      this.showNotification('📋 Removed videos list copied successfully!', 'success');
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = listContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.addLogEntry('📋 Removed videos list copied to clipboard', 'info');
        this.showNotification('📋 Removed videos list copied successfully!', 'success');
      } catch (err) {
        this.addLogEntry('❌ Failed to copy removed videos list', 'error');
        this.showNotification('❌ Failed to copy list to clipboard', 'error');
      }
      document.body.removeChild(textArea);
    });
  }

  handleNoReposts(message) {
    this.isProcessing = false;
    this.setState('complete');
    
    const duration = message.duration;
    
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
      let durationText = '';
      if (duration) {
        if (duration.minutes > 0) {
          durationText = ` in ${duration.minutes} min ${duration.seconds} seconds`;
        } else {
          durationText = ` in ${duration.seconds} seconds`;
        }
      }
      
      completionMessage.textContent = `Great! No reposted videos found on your profile${durationText}.`;
    }
    
    // Hide copy button since no videos were removed
    const copyRemovedButton = document.getElementById('copyRemovedButton');
    if (copyRemovedButton) {
      copyRemovedButton.style.display = 'none';
    }
    
    this.addLogEntry(`✨ No reposts found - your profile is clean!${durationText || ''}`, 'success');
  }


}

// Initialize the extension when the popup loads
document.addEventListener("DOMContentLoaded", function () {
  // Handle internationalization if needed
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const message = chrome.i18n.getMessage(key);
    if (message) element.innerHTML = message;
  });

  // Initialize the main extension functionality
  new ClearTokExtension();
});
