# API Service 使用指南

## 概述
`api-service.js` 是一个专门处理用户会话的API服务模块，负责与后台服务器进行会话相关的通信。它提供了统一的接口、错误处理、重试机制和配置管理。

## 特性
- ✅ 智能会话管理（复用有效session，避免重复创建）
- ✅ 会话持久化存储（使用chrome.storage.local）
- ✅ 会话过期管理（1小时自动过期）
- ✅ 会话创建和更新
- ✅ 自动重试机制
- ✅ 请求超时处理
- ✅ 错误处理和日志记录
- ✅ 开发/生产环境配置

## 智能Session管理

### 工作原理
1. **Session复用**：扩展启动时首先检查本地存储中是否有有效的session
2. **有效性检查**：验证session是否在1小时有效期内
3. **智能创建**：只有在没有有效session时才创建新session
4. **自动清理**：启动时自动清理过期的session数据

### 优势
- 🚀 **性能优化**：避免重复创建不必要的session
- 💾 **数据持久化**：session数据在浏览器关闭重启后仍然保留
- 🔄 **智能复用**：同一用户在1小时内的多次操作使用同一session
- 🧹 **自动清理**：过期session自动清理，避免数据冗余
- 📊 **准确追踪**：更准确地追踪用户的完整操作流程

### Session生命周期
1. **创建**：首次使用或现有session过期时创建
2. **存储**：保存到chrome.storage.local
3. **复用**：有效期内重复使用
4. **更新**：操作过程中更新session状态
5. **清理**：过期后自动清理

## 基本用法

### 会话管理

```javascript
// 创建新会话
const session = await window.apiService.createSession();
console.log('会话ID:', session.session_id);

// 更新会话状态
await window.apiService.updateSession(sessionId, {
  login_status: 'logged_in',
  process_status: 'in_progress',
  total_reposts_found: 10,
  reposts_removed: 5
});
```

## 配置管理

### 切换环境
```javascript
// 开发环境
window.apiService.setBaseUrl('http://localhost:8787');

// 生产环境
window.apiService.setBaseUrl('https://tiktokrepostremover.com');
```

### 调整超时时间
```javascript
// 设置15秒超时
window.apiService.setTimeout(15000);
```

### 配置重试策略
```javascript
// 设置重试5次，每次间隔2秒
window.apiService.setRetryConfig(5, 2000);
```

## 错误处理

API服务会自动处理以下错误：
- 网络连接错误
- 请求超时
- HTTP状态错误
- JSON解析错误

```javascript
try {
  const result = await window.apiService.createSession();
  // 处理成功结果
} catch (error) {
  console.error('API调用失败:', error.message);
  // 处理错误情况
}
```

## 会话数据结构

### 创建会话
```javascript
// 请求
{
  session_id: "optional_custom_id" // 可选
}

// 响应
{
  success: true,
  session_id: "generated_session_id"
}
```

### 更新会话
```javascript
// 请求
{
  session_id: "session_id",
  login_status: "logged_in",           // 登录状态
  process_status: "in_progress",       // 处理状态
  total_reposts_found: 10,             // 发现的转发数
  reposts_removed: 5,                  // 已删除的转发数
  reposts_skipped: 2,                  // 跳过的转发数
  error_message: "错误信息",            // 错误信息
  total_duration_seconds: 120          // 总耗时
}

// 响应
{
  success: true,
  changes: 1
}
```

## 在扩展中的集成

### popup.js 中的使用（智能Session管理）
```javascript
class ClearTokExtension {
  constructor() {
    this.sessionId = null;
    this.SESSION_EXPIRY_TIME = 60 * 60 * 1000; // 1小时过期
    this.SESSION_STORAGE_KEY = 'clearTokSessionData';
    this.initializeSession();
  }

  // 智能初始化会话（复用有效session或创建新session）
  async initializeSession() {
    try {
      // 首先检查是否有有效的现有session
      const existingSession = await this.getStoredSession();
      
      if (existingSession && this.isSessionValid(existingSession)) {
        // 复用现有session
        this.sessionId = existingSession.sessionId;
        console.log('复用现有session:', this.sessionId);
        return;
      }
      
      // 创建新session
      const response = await window.apiService.createSession();
      this.sessionId = response.session_id;
      console.log('创建新session:', this.sessionId);
      
      // 保存新session到存储
      await this.saveSessionToStorage();
      
    } catch (error) {
      console.warn('会话初始化失败:', error);
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
      return false;
    }
    
    return true;
  }

  // 获取存储的session
  async getStoredSession() {
    try {
      const result = await chrome.storage.local.get([this.SESSION_STORAGE_KEY]);
      return result[this.SESSION_STORAGE_KEY] || null;
    } catch (error) {
      console.warn('获取存储session失败:', error);
      return null;
    }
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
      
      console.log('Session保存到存储:', sessionData);
    } catch (error) {
      console.warn('保存session失败:', error);
    }
  }

  async updateSession(data) {
    if (!this.sessionId) return;
    await window.apiService.updateSession(this.sessionId, data);
  }

  // 登录状态更新
  updateLoginStatus(status) {
    if (status === 'loggedIn') {
      this.updateSession({ login_status: 'logged_in' });
    } else if (status === 'notLoggedIn') {
      this.updateSession({ login_status: 'not_logged_in' });
    }
  }

  // 开始删除流程
  async startRemoval() {
    this.updateSession({ process_status: 'in_progress' });
    // ... 其他逻辑
  }

  // 处理完成
  handleCompletion(message) {
    const totalDurationSeconds = this.sessionStartTime ? 
      Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0;
    
    this.updateSession({
      process_status: 'completed',
      reposts_removed: message.removedCount || 0,
      total_duration_seconds: totalDurationSeconds
    });
  }

  // 处理错误
  handleError(message) {
    this.updateSession({ 
      error_message: message,
      process_status: 'error'
    });
  }
}
```

## 会话状态说明

### 登录状态 (login_status)
- `logged_in` - 用户已登录
- `not_logged_in` - 用户未登录
- `unknown` - 登录状态未知

### 处理状态 (process_status)
- `started` - 会话开始
- `in_progress` - 删除进行中
- `completed` - 删除完成
- `error` - 发生错误
- `no_reposts` - 没有找到转发

## 最佳实践

1. **错误处理**: 始终使用try-catch包装API调用
2. **智能会话管理**: 利用session复用机制，避免重复创建
3. **配置管理**: 根据环境动态配置API基础URL
4. **性能优化**: 合并相关的更新操作，避免频繁调用
5. **错误恢复**: 利用重试机制处理临时网络问题
6. **存储权限**: 确保manifest.json中包含"storage"权限
7. **清理机制**: 在应用启动时自动清理过期session

## 开发环境配置

```javascript
// 在开发环境中使用本地API
if (window.location.hostname === 'localhost') {
  window.apiService.setBaseUrl('http://localhost:8787');
}
```

## 权限要求

为了使用智能session管理功能，需要在manifest.json中添加以下权限：

```json
{
  "permissions": ["scripting", "tabs", "activeTab", "sidePanel", "storage"],
  "host_permissions": [
    "https://*.tiktok.com/*",
    "https://api.tiktokrepostremover.com/*"
  ]
}
```

**重要**: `"storage"` 权限是必需的，用于：
- 保存session数据到本地存储
- 检查和复用有效session
- 自动清理过期session

这个智能的API服务模块专注于会话管理，提供了清晰、可靠、高效的接口来追踪用户在扩展中的完整操作流程，同时避免了重复创建session的问题。 