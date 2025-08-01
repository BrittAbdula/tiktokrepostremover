TikTok Repost Remover Extension
├── 🎨 UI层 (popup.html + popup.js)
├── �� 控制层 (background.js + repost-manager.js)  
├── �� 业务层 (core/fsm.js + core/video-processor.js)
├── 🛠️ 工具层 (core/selector-utils.js + core/messaging.js)
└── 📊 数据层 (core/context.js + chrome.storage)

tiktok-remover-extension(ClearTok)/
├── core/
│ ├── fsm.js # 有限状态机
│ ├── messaging.js # 统一消息处理
│ ├── observers.js # DOM观察器
│ ├── selector-utils.js # 选择器工具
│ └── video-processor.js # 视频处理逻辑
├── script.js # 主入口（简化）
├── popup.js # UI控制器（简化）
├── background.js # 后台服务（简化）
└── repost-manager.js # 核心业务逻辑

## 🎯 核心设计原则

### 1. **单一职责原则**
- 每个模块只负责一个核心功能
- 清晰的接口和依赖关系

### 2. **状态机驱动**
- 明确的状态定义和转换规则
- 状态变更的可预测性和可调试性

### 3. **事件驱动架构**
- 统一的事件系统
- 松耦合的模块通信

### 4. **配置化**
- 选择器、超时时间、重试逻辑等都可配置
- 易于维护和更新

## 🔄 状态机设计
```javascript
const States = {
  IDLE: 'idle',
  NAVIGATING_TO_PROFILE: 'navigating_to_profile',
  OPENING_REPOSTS_TAB: 'opening_reposts_tab',
  LOADING_ALL_REPOSTS: 'loading_all_reposts',
  PROCESSING_VIDEOS: 'processing_videos',
  COMPLETED: 'completed',
  ERROR: 'error',
  PAUSED: 'paused'
};

const Events = {
  START: 'start',
  PROFILE_LOADED: 'profile_loaded',
  REPOSTS_TAB_OPENED: 'reposts_tab_opened',
  ALL_REPOSTS_LOADED: 'all_reposts_loaded',
  VIDEO_PROCESSED: 'video_processed',
  PAUSE: 'pause',
  RESUME: 'resume',
  ERROR: 'error',
  COMPLETE: 'complete'
};
```

### 1. **清晰的职责分离**
- 状态管理：FSM + Context
- 消息处理：EventBus + MessageBus  
- 业务逻辑：VideoProcessor + 各种专用类
- UI交互：简化的popup.js

### 2. **可预测的状态转换**
- 明确的状态定义
- 清晰的转换规则
- 易于调试和测试

### 3. **统一的消息系统**
- 去重逻辑内置
- 类型安全的消息传递
- 松耦合的模块通信

### 4. **可配置和可扩展**
- 选择器配置化
- 超时和重试策略可调
- 新功能易于添加

### 5. **更好的错误处理**
- 集中的错误管理
- 详细的错误上下文
- 自动重试机制