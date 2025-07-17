# Implementation Plan

- [ ] 1. 移除个别视频处理的上报
  - 在script.js中删除每个视频移除时的API调用
  - 移除videoRemoved和videoSkipped事件的session更新
  - 只在本地记录处理结果，不发送到API
  - _Requirements: 3.1, 3.2_

- [ ] 2. 优化定时更新频率
  - 将popup.js中的UPDATE_INTERVAL_MS从10秒改为30秒
  - 移除periodicSessionUpdate中的高频状态更新
  - 只在关键状态变化时才调用updateSession
  - _Requirements: 1.3, 3.5_

- [ ] 3. 简化登录状态上报
  - 在popup.js的handleMessage中避免重复的登录状态更新
  - 只在用户名真正变化时才上报tiktok_username
  - 移除冗余的login_status更新调用
  - _Requirements: 3.4, 1.1_

- [ ] 4. 合并最终结果上报
  - 在script.js的complete事件中一次性上报所有结果
  - 包含总数、成功数、跳过数、耗时等关键指标
  - 移除处理过程中的中间状态上报
  - _Requirements: 1.4, 5.1, 5.5_

- [ ] 5. 移除等待和进度的实时上报
  - 删除waiting事件的session更新
  - 移除updateProgress中的API调用
  - 保留本地UI更新，但不发送到后端
  - _Requirements: 3.2, 3.3_

- [ ] 6. 测试优化效果
  - 验证API调用次数减少到预期水平
  - 确保关键事件仍然被正确上报
  - 测试用户体验没有受到影响
  - _Requirements: 1.1, 4.1_