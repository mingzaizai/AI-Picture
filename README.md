
# 🎨 PixelMind - 隐私至上的 AI 本地图片编辑器

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-orange?logo=google-gemini)](https://ai.google.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Processing-green?logo=shieldcheck)](https://github.com/)
[![UI Style](https://img.shields.io/badge/UI-Dark_Modern-1e293b)](https://github.com/)

> **PixelMind** 是一款专为创作者打造的现代化、隐私友好的图片处理工具。它在浏览器本地运行强大的 Canvas 引擎，并集成 Google Gemini AI 进行智能分析与重绘。

---

## 🖥️ 界面预览 (Main Interface)

<p align="center">
  <img src="https://raw.githubusercontent.com/your-username/your-repo-name/main/screenshot.png" width="100%" alt="PixelMind 主界面预览" />
  <br>
  <i>(提示：请将你的截图命名为 screenshot.png 放在根目录，并替换上方链接中的 username/repo-name)</i>
</p>

### 🌌 核心视觉设计
- **深色极简主义**：采用 `#0f172a` 极夜色调，减少视觉疲劳，突出图片主体。
- **直观侧边栏**：左侧快速切换 **图库、编辑、批量、设置**。
- **动态交互**：毛玻璃效果、流畅的过渡动画与响应式布局。

---

## 🛠️ 功能模块 (Modules)

### 📁 1. 图片库 (Library)
- **极简上传**：支持点击、拖拽上传。
- **安全保障**：🛡️ **100% 本地处理**，绝不上传私密照片至服务器。
- **多格式支持**：兼容 JPG, PNG, WEBP, HEIC 等主流格式。

### 🎨 2. 高级编辑器 (Editor)
- **专业调色**：亮度、对比度、饱和度、曝光、色相。
- **智能分析**：点击 **AI 分析** 按钮，Gemini 将会给出专业的画面构图建议与技术优化方案。
- **魔法工具**：AI 背景重绘、智能换装、文字水印。

### 📦 3. 批量处理中心 (Batch)
- **并行任务**：同时对数十张图片进行格式转换、质量压缩与尺寸调整。
- **智能增强**：开启“自动光影平衡”，批量修复曝光不足的素材。

---

## 🚀 技术架构 (Tech Stack)

- **核心**：React 19 + TypeScript
- **样式**：Tailwind CSS (定制深色主题)
- **图标**：Lucide React
- **AI 引擎**：Google Gemini 2.5 Flash / 3 Pro
- **图形处理**：HTML5 Canvas (硬件加速渲染)

---

## 📦 安装与运行

1. **环境要求**：任何支持现代 ESM 的静态服务器。
2. **快速启动**：
   ```bash
   # 克隆仓库
   git clone https://github.com/your-username/pixelmind.git
   # 启动服务
   npx serve .
   ```
3. **API 配置**：在设置面板中填入您的 [Gemini API Key](https://aistudio.google.com/) 即可启用 AI 功能。

---

## 🔒 隐私声明
PixelMind 默认在客户端执行所有核心逻辑。除用户主动触发的 AI 请求外，没有任何数据流向云端。您的创意，只属于您的硬盘。

<p align="center">
  Made with ✨ and ☕ by PixelMind Team
</p>
