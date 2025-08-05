/**
 * API Service Module
 * 处理会话和事件相关的API调用服务
 */
class ApiService {
  constructor() {
    // API配置
    this.baseUrl = 'https://api.tiktokrepostremover.com';
    // this.baseUrl = 'http://localhost:8787'; // 用于本地开发环境

    // 请求超时时间
    this.timeout = 10000; // 10秒

    // 重试配置
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    // 获取扩展版本号
    this.version = this.getExtensionVersion();
  }

  /**
   * 获取扩展版本号
   * @returns {string} 版本号
   */
  getExtensionVersion() {
    try {
      // 尝试从manifest获取版本号
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        return chrome.runtime.getManifest().version;
      }
      // 如果无法获取，返回默认版本
      return '1.2.0';
    } catch (error) {
      console.warn('Failed to get extension version:', error);
      return '1.2.0';
    }
  }

  /**
   * 通用HTTP请求方法，包含超时和重试逻辑
   * @param {string} endpoint - API端点
   * @param {Object} options - fetch请求的选项
   * @returns {Promise<Object>} 响应的JSON数据
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    let lastError;
    
    // 重试机制
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...defaultOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        lastError = error;
        console.warn(`API request failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    // 所有重试都失败后，抛出最后的错误
    throw new Error(`API request failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟的毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建用户会话
   * 不再需要任何参数，session_id 完全由后端生成。
   * @returns {Promise<Object>} 包含session_id的响应
   */
  async createSession() {
    try {
      const response = await this.request('/session/create', {
        method: 'POST',
        body: JSON.stringify({ 
          version: this.version 
        })
      });
      
      console.log('Session created successfully:', response.session_id);
      return response;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * 此函数现在专门用于将事件发送到 /session/track-event 端点。
   * @param {string} sessionId - 会话ID
   * @param {Object} data - 事件负载，必须包含 event_name
   * @returns {Promise<Object>} API的响应结果
   */
  async updateSession(sessionId, data) {
    if (!sessionId) {
      console.warn('Session ID is empty, skipping event tracking.');
      return { success: false, message: 'Session ID is required' };
    }

    // 确保 event_name 存在，因为这是新模型的强制要求
    if (!data.hasOwnProperty('event_name')) {
      console.error('API call is missing "event_name" property.', data);
      return { success: false, message: 'event_name property is required for the new API model.' };
    }

    try {
      const response = await this.request('/session/track-event', {
        method: 'PUT',
        body: JSON.stringify({
          session_id: sessionId,
          version: this.version,
          ...data
        })
      });
      
      return response;
    } catch (error) {
      console.error(`Failed to track event`, error);
      // 不抛出错误，避免因分析数据上报失败而影响扩展的核心功能
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置API基础URL（用于开发/测试）
   * @param {string} url - 新的基础URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    console.log('API base URL updated to:', url);
  }

  /**
   * 设置请求超时时间
   * @param {number} timeout - 超时时间（毫秒）
   */
  setTimeout(timeout) {
    this.timeout = timeout;
    console.log('Request timeout updated to:', timeout, 'ms');
  }

  /**
   * 设置重试配置
   * @param {number} attempts - 重试次数
   * @param {number} delay - 基础重试延迟（毫秒）
   */
  setRetryConfig(attempts, delay) {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
    console.log('Retry config updated:', { attempts, delay });
  }

  /**
   * 提交用户反馈
   * @param {string} sessionId - 会话ID
   * @param {Object} feedbackData - 反馈数据，包含rating和feedback
   * @returns {Promise<Object>} API的响应结果
   */
  async submitFeedback(sessionId, feedbackData) {
    if (!sessionId) {
      console.warn('Session ID is empty, cannot submit feedback.');
      return { success: false, message: 'Session ID is required' };
    }

    if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
      console.warn('Invalid rating value:', feedbackData.rating);
      return { success: false, message: 'Valid rating (1-5) is required' };
    }

    try {
      const response = await this.request('/feedback/submit', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          version: this.version,
          rating_score: feedbackData.rating,
          feedback_text: feedbackData.feedback || ''
        })
      });
      
      console.log('Feedback submitted successfully');
      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // 不抛出错误，避免因反馈提交失败而影响用户体验
      return { success: false, error: error.message };
    }
  }
}

// 创建一个全局API服务实例，方便在扩展的各个部分调用
window.apiService = new ApiService();

// 如果需要在其他模块中导入，则导出该类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
