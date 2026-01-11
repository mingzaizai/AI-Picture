# 🎨 PixelMind - 隐私至上的 AI 本地图片编辑器

<p align="left">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Gemini_AI-Flash-orange?style=for-the-badge&logo=google-gemini" alt="Gemini" />
  <img src="https://img.shields.io/badge/Privacy-Local_Only-green?style=for-the-badge&logo=shieldcheck" alt="Privacy" />
</p>

> **PixelMind** 是一款专为创作者打造的现代化图片处理工具。它将强大的本地 Canvas 渲染引擎与 Google Gemini 的前沿 AI 技术深度融合，确保您的每一张创意素材都只留在您的本地硬盘。

---

## 📸 界面预览 (Interface Showcase)

<p align="center">
  <img src="screenshot.png" width="100%" alt="PixelMind 首页界面预览" style="border-radius: 12px; border: 1px solid #334155;" />
  <br>
  <i>(PixelMind 极简深色主界面：支持拖拽上传与 100% 本地处理)</i>
</p>

> **💡 提示**：若图片无法显示，请检查仓库根目录下文件名是否精确为 `screenshot.png`（注意大小写需完全一致）。

### 🛠️ 应用亮点
- **🛡️ 100% 本地处理**：所有滤镜、裁剪和批量转换逻辑均在浏览器内核完成，无后端上传。
- **🖼️ 广泛格式兼容**：原生支持 JPG, PNG, WEBP 以及苹果生态的 HEIC 格式。
- **🪄 Gemini AI 魔法**：集成最新的 Gemini 2.5 系列模型，提供背景重绘、智能换装与审美分析。

---

## 🌟 核心功能模块

### 📁 图片库 (Library)
- **极简交互**：支持文件拖拽、批量选择与实时预览。
- **离线可用**：完全基于 Web Worker 处理，无网状态依然强悍。

### 🎨 高级编辑器 (Professional Editor)
- **光影精修**：亮度、对比度、饱和度、曝光等精准调节。
- **拾色器**：支持画布像素级精准取色，一键获取 HEX 代码。
- **撤销系统**：多步编辑历史记录，随时回退错误操作。
- **AI 智能中心**：
  - **背景重绘**：一句话描述，瞬间改变照片氛围。
  - **智能分析**：AI 自动识别画面瑕疵并给出专业调色建议。

### 📦 批量处理中心 (Batch Processing)
- **多任务并行**：一键对成百上千张图片进行格式转换与尺寸缩放。
- **自动增强**：开启“智能平衡”模式，批量优化曝光与对比度。

---

## 🚀 快速启动

1. **环境准备**：
   项目采用纯前端 ESM 架构，您可以使用 `serve` 或任何现代浏览器直接运行。

2. **本地运行**：
   ```bash
   # 使用 npx 快速启动
   npx serve .
   ```

3. **配置 AI**：
   点击应用内的 **“设置”** 按钮，填入您的 [Gemini API Key](https://aistudio.google.com/) 即可激活全部 AI 魔法。

---

## 🔒 隐私承诺

我们深知隐私对创作者的重要性。PixelMind 不设后端服务器，不记录任何用户信息。您的图片、您的 API 密钥、您的编辑历史，均仅存储在您浏览器的本地存储空间内。

<p align="center">
  Built with ❤️ for Creators everywhere.
</p>