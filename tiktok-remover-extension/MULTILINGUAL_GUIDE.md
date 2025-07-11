# 多语言功能指南 / Multilingual Guide

## 支持的语言 / Supported Languages

该扩展现在支持以下8种语言：

- 🇺🇸 **English** - 英语
- 🇩🇪 **Deutsch** - 德语
- 🇫🇷 **Français** - 法语
- 🇮🇩 **Bahasa Indonesia** - 印尼语
- 🇯🇵 **日本語** - 日语
- 🇲🇾 **Bahasa Melayu** - 马来语
- 🇧🇷 **Português (Brasil)** - 巴西葡萄牙语
- 🇹🇷 **Türkçe** - 土耳其语

## 功能特点 / Features

### 🔄 自动语言检测
- 首次打开时自动检测浏览器语言
- 如果检测到支持的语言，自动切换
- 默认回退到英语

### 💾 语言偏好保存
- 用户选择的语言会自动保存到本地存储
- 下次打开扩展时会记住用户的语言偏好

### 🎛️ 语言切换器
- 位于扩展底部的语言选择器
- 优雅的下拉菜单设计
- 实时切换，无需重新加载

### 🔧 动态内容支持
- 支持占位符替换（如显示进度 "3/10"）
- 动态状态更新
- 实时日志翻译

## 技术实现 / Technical Implementation

### 文件结构
```
_locales/
├── en/messages.json     # 英语翻译
├── de/messages.json     # 德语翻译
├── fr/messages.json     # 法语翻译
├── id/messages.json     # 印尼语翻译
├── ja/messages.json     # 日语翻译
├── ms/messages.json     # 马来语翻译
├── pt_BR/messages.json  # 巴西葡萄牙语翻译
└── tr/messages.json     # 土耳其语翻译
```

### 关键组件
- `i18n.js` - 多语言核心功能
- `popup.html` - 带有data-i18n属性的界面
- `styles.css` - 语言选择器样式

### 使用方法
1. 在HTML元素上添加 `data-i18n="keyName"` 属性
2. 在语言文件中添加对应的翻译键值
3. i18n.js会自动处理翻译和切换

## 添加新语言 / Adding New Languages

如果需要添加新语言支持：

1. 在`_locales/`目录下创建新的语言文件夹（如`zh/`）
2. 复制英语的`messages.json`文件并翻译内容
3. 在`i18n.js`的`supportedLanguages`对象中添加新语言
4. 测试功能是否正常工作

## 占位符使用 / Placeholder Usage

支持的占位符格式：
- `{count}` - 数量
- `{current}` - 当前进度
- `{total}` - 总数
- `{seconds}` - 秒数
- `{number}` - 编号

示例：
```json
{
  "completionMessage": {
    "message": "Successfully removed {count} reposted videos from your profile."
  }
}
```

## 测试 / Testing

1. 打开扩展
2. 检查语言选择器是否显示在底部
3. 切换不同语言，验证界面是否正确翻译
4. 刷新页面，验证语言偏好是否保存

---

*此多语言功能完全本地化，不会发送任何数据到外部服务器，确保用户隐私安全。* 