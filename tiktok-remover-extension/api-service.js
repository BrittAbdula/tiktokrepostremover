/**
 * API Service Module
 * 处理会话相关的API调用服务
 */
class ApiService {
  constructor() {
    // API配置
    this.baseUrl = 'https://api.tiktokrepostremover.com';
    // this.baseUrl = 'http://localhost:8787'; // 开发环境
    
    // 请求超时时间
    this.timeout = 10000;
    
    // 重试配置
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * 通用HTTP请求方法
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
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
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 解析JSON响应
        const data = await response.json();
        return data;
        
      } catch (error) {
        lastError = error;
        console.warn(`API请求失败 (尝试 ${attempt}/${this.retryAttempts}):`, error.message);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    // 所有重试都失败了
    throw new Error(`API请求失败: ${lastError.message}`);
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建用户会话
   * @param {string} [sessionId] - 可选的会话ID
   * @returns {Promise<Object>} 包含session_id的响应
   */
  async createSession(sessionId = null) {
    try {
      const response = await this.request('/session/create', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
      });
      
      console.log('会话创建成功:', response.session_id);
      return response;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户会话
   * @param {string} sessionId - 会话ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateSession(sessionId, updateData) {
    if (!sessionId) {
      console.warn('会话ID为空，跳过更新');
      return { success: false, message: 'Session ID is required' };
    }

    try {
      const response = await this.request('/session/update', {
        method: 'PUT',
        body: JSON.stringify({
          session_id: sessionId,
          ...updateData
        })
      });
      
      return response;
    } catch (error) {
      console.error('更新会话失败:', error);
      // 不抛出错误，避免影响主要功能
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置API基础URL（用于开发/测试）
   * @param {string} url - 新的基础URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    console.log('API基础URL已更新为:', url);
  }

  /**
   * 设置请求超时时间
   * @param {number} timeout - 超时时间（毫秒）
   */
  setTimeout(timeout) {
    this.timeout = timeout;
    console.log('请求超时时间已更新为:', timeout, 'ms');
  }

  /**
   * 设置重试配置
   * @param {number} attempts - 重试次数
   * @param {number} delay - 重试延迟（毫秒）
   */
  setRetryConfig(attempts, delay) {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
    console.log('重试配置已更新:', { attempts, delay });
  }
}

// 创建全局API服务实例
window.apiService = new ApiService();

// 导出API服务类（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
} 