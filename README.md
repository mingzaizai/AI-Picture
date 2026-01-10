
# 🎨 PixelMind - 隐私至上的 AI 本地图片编辑器

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-orange?logo=google-gemini)](https://ai.google.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Processing-green?logo=shieldcheck)](https://github.com/)

> **PixelMind** 是一款专为创作者设计的现代化图片处理工具。它将强大的本地 Canvas 编辑能力与 Google Gemini 的尖端 AI 技术完美融合，同时始终坚守“数据不出本地”的隐私准则。

---

## 📸 界面预览 (Interface Showcase)

为了展示 PixelMind 的强大功能，请参考以下核心模块预览：

| 🎨 **专业精修 (Adjust)** | ✂️ **交互构图 (Crop)** | 🪄 **AI 魔法 (Magic)** |
| :---: | :---: | :---: |
| <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600&h=400" width="100%" alt="精修模式" /> | <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600&h=400" width="100%" alt="构图模式" /> | <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=400" width="100%" alt="AI 魔法" /> |
| **实时滤镜与调色**<br/>支持亮度、对比度、饱和度、<br/>色相及多种专业滤镜调节。 | **交互式手动裁剪**<br/>全新的拖拽式裁剪框，支持<br/>自由拉伸与主流比例吸附。 | **Gemini 驱动增强**<br/>AI 背景重绘、智能换装<br/>以及深度的画面审美分析。 |

---

## 🌟 核心特性

### 1. ✨ AI 魔法工具 (Magic Suite)
利用最新的 **Gemini 2.5 Flash** 图像模型：
- **AI 背景重绘**：输入描述，瞬间切换场景。
- **智能换装**：精确识别轮廓，一键更换服饰。
- **AI 智能建议**：基于审美算法自动给出修图方案。

### 2. ✂️ 交互式精准构图
- **手动自由裁剪**：支持四个角与四条边的自由拉伸，带三分法辅助线。
- **预设比例**：内置 1:1, 4:3, 16:9, 9:16 等主流比例。

### 3. 🛠️ 专业级批量处理
- **高性能架构**：利用 Canvas 硬件加速，批量处理不卡顿。
- **一键导出**：支持 JPEG/PNG/WEBP 格式及其质量调节。

### 4. 🔒 隐私隔离设计
- **本地优先**：所有基础编辑均在浏览器本地完成，数据不上传云端。

---

## 🚀 技术栈

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini API (@google/genai)
- **Engine**: HTML5 Canvas (Hardware Accelerated)

---

## 🛠️ 快速开始

1. **获取 API Key**
   请在 [Google AI Studio](https://aistudio.google.com/) 获取密钥。
   
2. **本地运行**
   由于是纯静态前端项目，使用任何静态服务器即可：
   ```bash
   npx serve .
   ```

3. **替换预览图**
   您可以将自己运行时的截图放入 `/assets` 文件夹，并更新 README 中的图片路径。

---

## 🤝 贡献
欢迎提交 PR 或 Issue。让我们共同打造最强隐私 AI 修图工具！

<p align="center">Made with ❤️ by PixelMind Team</p>
