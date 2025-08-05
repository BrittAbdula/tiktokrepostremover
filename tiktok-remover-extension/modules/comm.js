// /modules/comm.js

class CommManager {
    /**
     * @param {WorkflowManager} workflow
     * @param {StateManager} state
     */
    constructor(workflow, state) {
      this.workflow = workflow;
      this.state = state;
    }
  
    /**
     * 发送消息到插件的其他部分
     * @param {string} action
     * @param {object} data
     */
    sendMessage(action, data = {}) {
      try {
        chrome.runtime.sendMessage({ action, ...data });
      } catch (error) {
        // 当popup关闭时，发送消息可能会失败，这是正常的
        if (error.message.includes('Receiving end does not exist')) {
          // console.log('Message sending failed, probably popup is closed.');
        } else {
          console.error('[ClearTok] Failed to send message:', error);
        }
      }
    }
  
    /**
     * 统一设置消息监听器
     */
    listen() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // 过滤掉非本插件的消息
        if (sender.id !== chrome.runtime.id) return;
        
        console.log('[ClearTok] Received message:', message.action);
  
        switch (message.action) {
          case 'ping':
            // 响应ping消息，让background知道脚本存在
            sendResponse({ status: 'pong' });
            break;
          case 'startRemoval':
            this.workflow.start();
            break;
          case 'pauseRemoval':
            this.state.pause();
            this.sendMessage('statusUpdate', { status: 'Paused by user.' });
            break;
          case 'resumeRemoval':
            this.state.resume();
            this.sendMessage('statusUpdate', { status: 'Resuming process...' });
            break;
          case 'checkLoginStatus':
            this.workflow.runInitialChecks();
            break;
          case 'navigateToReposts':
            this.workflow.step_navigateToRepostsTab();
            break;
          // 注意：selectorsUpdated 消息由 ConfigManager 自己处理
        }
        
      });
    }
  }