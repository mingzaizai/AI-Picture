
# 🎨 PixelMind - 隐私至上的 AI 本地图片编辑器

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-orange?logo=google-gemini)](https://ai.google.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Processing-green?logo=shieldcheck)](https://github.com/)

> **PixelMind** 是一款专为创作者设计的现代化图片处理工具。它将强大的本地 Canvas 编辑能力与 Google Gemini 的尖端 AI 技术完美融合，同时始终坚守“数据不出本地”的隐私准则。

---

## 🌟 核心特性

### 1. ✨ AI 魔法工具 (Magic Suite)
利用最新的 **Gemini 2.5 Flash** 图像模型，PixelMind 提供了以往仅在云端专业软件中才有的功能：
- **AI 背景重绘**：输入简单的文字描述，瞬间为您的主体切换到任何奇幻场景。
- **智能换装**：精确识别人物轮廓，一键尝试不同的服饰风格。
- **AI 智能建议**：自动分析照片的构图、曝光和色彩平衡，给出专业的修图方案。

### 2. ✂️ 交互式精准构图
- **手动自由裁剪**：全新的交互式裁剪框，支持四个角与四条边的自由拉伸。
- **预设比例吸附**：内置 1:1, 4:3, 16:9 等主流社交媒体比例。
- **三分法辅助线**：帮助您遵循摄影黄金准则进行完美构图。

### 3. 🛠️ 专业级批量处理
- **一键队列化**：支持多图同时导入，批量应用缩放、格式转换和自动光影平衡。
- **性能卓越**：利用浏览器硬件加速（WebGL），在大批量处理时依然保持流畅。

### 4. 🔒 隐私隔离设计
- **零服务器存储**：所有基础编辑（裁剪、滤镜、文字）均在浏览器 Canvas 中完成。
- **安全 AI 调用**：仅在您请求 AI 功能时，通过安全通道传输加密图像片段。

---

## 📸 界面预览

| 🎨 精修模式 | ✂️ 构图模式 | 🪄 魔法 AI |
| :--- | :--- | :--- |
| ![调节](https://via.placeholder.com/300x200/0f172a/f8fafc?text=Advanced+Filters) | ![裁剪](https://via.placeholder.com/300x200/0f172a/f8fafc?text=Interactive+Crop) | ![AI](https://via.placeholder.com/300x200/0f172a/f8fafc?text=AI+Inpainting) |

---

## 🚀 技术栈

- **核心框架**: React 19 (Hooks, Context API)
- **样式方案**: Tailwind CSS (Dark Mode First)
- **图标库**: Lucide React
- **AI 引擎**: @google/genai (Gemini 2.5 Flash / Gemini 3 Flash Preview)
- **图形处理**: 原生 HTML5 Canvas API

---

## 🛠️ 快速开始

1. **配置 API Key**
   本应用需要 Google Gemini API 密钥。请在 [Google AI Studio](https://aistudio.google.com/) 获取。
   
2. **环境设置**
   将您的密钥设置到环境变量中：
   ```bash
   process.env.API_KEY = "您的密钥"
   ```

3. **运行项目**
   由于项目采用现代 ES Modules 设计，您只需要一个简单的本地静态文件服务器即可：
   ```bash
   npx serve .
   ```

---

## 🤝 贡献与反馈

我们非常欢迎开发者参与贡献！无论是新增滤镜算法，还是优化 AI 提示词逻辑，您的每一个 PR 都会让 PixelMind 变得更好。

- 提交 Bug 请前往 [Issues](https://github.com/)
- 加入讨论 [Discussions](https://github.com/)

---

## ⚖️ 开源协议

基于 **MIT License** 授权。

---

<p align="center">Made with ❤️ by PixelMind Team</p>
