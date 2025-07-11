# API Service 使用指南

## 概述
`api-service.js` 是一个专门处理用户会话的API服务模块，负责与后台服务器进行会话相关的通信。它提供了统一的接口、错误处理、重试机制和配置管理。

## 特性
- ✅ 会话创建和更新
- ✅ 自动重试机制
- ✅ 请求超时处理
- ✅ 错误处理和日志记录
- ✅ 开发/生产环境配置

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

### popup.js 中的使用
```javascript
class ClearTokExtension {
  constructor() {
    this.sessionId = null;
    this.initializeSession();
  }

  async initializeSession() {
    try {
      const response = await window.apiService.createSession();
      this.sessionId = response.session_id;
    } catch (error) {
      console.warn('会话创建失败:', error);
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
2. **会话管理**: 在应用启动时创建会话，在关键节点更新状态
3. **配置管理**: 根据环境动态配置API基础URL
4. **性能优化**: 合并相关的更新操作，避免频繁调用
5. **错误恢复**: 利用重试机制处理临时网络问题

## 开发环境配置

```javascript
// 在开发环境中使用本地API
if (window.location.hostname === 'localhost') {
  window.apiService.setBaseUrl('http://localhost:8787');
}
```

这个简化的API服务模块专注于会话管理，提供了清晰、可靠的接口来追踪用户在扩展中的完整操作流程。 