# CSS 架构说明

## 📁 CSS 文件组织结构

```
src/
├── assets/
│   ├── styles/
│   │   ├── variables.css           # 设计 tokens (颜色、间距、阴影等)
│   │   ├── utilities.css           # 全局工具类 (按钮、表单、布局等)
│   │   ├── home-view.css          # HomeView 组件专用样式
│   │   └── tts-audio-generator.css # TTSAudioGenerator 组件专用样式
│   ├── main.css                   # 全局基础样式
│   └── app.css                    # 应用级样式
```

## 🎯 设计原则

### 1. **分层架构**
- **全局层**: `variables.css` + `utilities.css` - 设计系统基础
- **组件层**: 各组件专用CSS文件 - 组件特定样式
- **应用层**: `main.css` + `app.css` - 应用级全局样式

### 2. **CSS 变量系统** (`variables.css`)
```css
:root {
  /* 颜色系统 */
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --danger-color: #dc2626;
  
  /* 间距系统 */
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  
  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

### 3. **工具类系统** (`utilities.css`)
- 按钮组件 (`.btn`, `.btn-primary`, `.btn-outline`)
- 表单组件 (`.form-input`, `.form-label`)
- 布局工具 (`.flex`, `.gap-md`, `.items-center`)
- 文字同步样式 (`.word-segment`, `.highlight-current`)

## 🚀 使用方式

### 在 Vue 组件中引入专用样式：
```javascript
<script>
// 在组件的 script 部分引入专用CSS
import '../assets/styles/component-name.css'
</script>

<template>
  <!-- 模板内容 -->
</template>

<!-- 不再需要 <style> 部分 -->
```

### 在 main.js 中引入全局样式：
```javascript
import './assets/styles/variables.css'
import './assets/styles/utilities.css'
```

## ✅ 优势

1. **模块化**: 每个组件的样式独立管理
2. **可维护性**: 样式变更影响范围明确
3. **可复用性**: 工具类和变量系统避免重复
4. **性能优化**: 按需加载组件样式
5. **团队协作**: 清晰的文件职责分工

## 📋 迁移清单

- ✅ HomeView.vue CSS 分离完成
- ✅ TTSAudioGenerator.vue CSS 分离完成  
- ✅ 全局设计系统创建完成
- ✅ CSS 变量系统建立完成
- ✅ 工具类库创建完成

## 🎨 设计 Token 示例

### 颜色使用：
```css
/* 使用 CSS 变量 */
.my-button {
  background: var(--primary-color);
  color: white;
}

/* 或使用工具类 */
<button class="btn btn-primary">点击我</button>
```

### 间距使用：
```css
/* 使用 CSS 变量 */
.my-card {
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
}

/* 或使用工具类 */
<div class="card gap-lg">内容</div>
```

这种架构为项目提供了良好的可扩展性和维护性基础！🎯
