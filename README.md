# 花木兰 — The Legend of Hua Mulan

[中文版说明](#中文版说明) | [English version below](#english-version)

---

## 中文版说明

**花木兰** 是一个双语交互式故事应用，讲述中国古代最著名的巾帼英雄故事。采用单页应用架构，配有古典水墨画插图、双语音频朗读和拼音标注。

### ✨ 特色功能

- **双语阅读** — 中文（汉字 + 拼音）与英文一键切换，选择会被记住
- **古典水墨插图** — 5 幅 AI 生成的工笔重彩画，以 Xuan 纸纹理、北魏时期氛围绘制
- **逐章音频** — 普通话 female 语音（-8% 减速）+ 英文 male 语音（正常速度）
- **自动连播** — 开启后自动播放当前章节，结束后平滑过渡到下一章
- **月相导航** — 顶部章节导航栏以月相圆点显示阅读进度
- **键盘快捷键** — ← → 切换章节，空格键播放/暂停，A 键切换自动播放
- **触屏滑动** — 移动端左右滑动翻页

### 🎨 设计风格

- 主题：北魏时期 · 中国传统水墨画
- 配色：宣纸米黄底色、墨色文字、朱砂红印章、赭石色高亮
- 字体：Ma Shan Zheng（毛笔楷书）、Noto Serif SC（宋体）、EB Garamond（英文衬线）
- 动画：英雄淡入、章节淡入上浮、桂花枝绽放、墨点粒子飘散

### 🛠️ 技术栈

- 纯原生 HTML + CSS + JavaScript，无构建步骤
- 原生设计，无构建步骤
- Edge TTS 生成音频（edge-tts）
- Cloudflare Workers AI（FLUX）生成插图

### 📖 故事结构

| 章节 | 中文标题 | English Title |
|------|---------|---------------|
| 1 | 第一幕 · 替父从军 | Scene 1 — In Father's Place |
| 2 | 第二幕 · 奔赴沙场 | Scene 2 — To the Battlefield |
| 3 | 第三幕 · 英勇作战 | Scene 3 — Valiant in Battle |
| 4 | 第四幕 · 功成身退 | Scene 4 — A Hero's Reward |
| 5 | 第五幕 · 亲人团聚 | Scene 5 — Home at Last |

### 🚀 本地运行

```bash
# 克隆仓库
git clone https://github.com/PimplesOnNose/hua-mulan.git
cd hua-mulan

# 使用任意静态服务器，例如 Python
python3 -m http.server 8080

# 浏览器打开 http://localhost:8080
```

### 📁 项目结构

```
hua-mulan/
├── index.html          # 主页面（英雄封面 + 故事容器）
├── css/style.css       # 全局样式（水墨画主题）
├── js/
│   ├── app.js          # 应用逻辑（导航、音频、语言切换）
│   └── story-data.js   # 故事数据（双语内容 + 拼音）
├── images/             # 5 幅水墨插图（page1–page5.png）
├── audio/              # 10 个音频文件（zh/en × 5 章节）
└── README.md
```

### 🙏 致谢

本应用由 [Pi](https://pidev) 和 [StepFunAI](https://platform.stepfun.ai/) 协力打造。

### 📄 许可证

MIT License — 详见 [LICENSE](LICENSE) 文件。

---

## English Version

**Hua Mulan** is a bilingual interactive storybook app retelling one of China's most beloved folktales. Built as a single-page web application with classical Chinese ink-wash illustrations, dual-language audio narration, and pinyin annotations.

### ✨ Features

- **Bilingual reading** — Chinese (Hanzi + Pinyin) and English, toggle persists across sessions
- **Classical ink illustrations** — 5 AI-generated paintings in Xuan paper texture, Northern Wei dynasty style
- **Per-chapter audio** — Mandarin female voice (-8% slower) + English male voice (normal speed)
- **Auto-play** — Seamlessly advances to the next chapter when a track ends
- **Moon-phase navigation** — Top header tray shows reading progress as lunar phases
- **Keyboard shortcuts** — Arrow keys to navigate, Space to play/pause, A to toggle autoplay
- **Touch swipe** — Swipe left/right on mobile to change chapters

### 🎨 Design Theme

- Theme: Northern Wei Dynasty · Classical Chinese Ink Painting
- Palette: indigo, ochre, ink-black-grey, muted red (cinnabar seal stamps)
- Typography: Ma Shan Zheng (brush calligraphy), Noto Serif SC (Song type), EB Garamond (English)
- Atmosphere: paper texture, ink-mote particles, wax-seal stamps, brush-stroke dividers

### 🛠️ Tech Stack

- Vanilla HTML + CSS + JavaScript — no build step required
- Vanilla HTML + CSS + JavaScript — no build step required
- Audio generated with Edge TTS
- Images generated with Cloudflare Workers AI (FLUX)

### 📖 Story Structure

| Chapter | Chinese | English |
|---------|---------|---------|
| 1 | 第一幕 · 替父从军 | Scene 1 — In Father's Place |
| 2 | 第二幕 · 奔赴沙场 | Scene 2 — To the Battlefield |
| 3 | 第三幕 · 英勇作战 | Scene 3 — Valiant in Battle |
| 4 | 第四幕 · 功成身退 | Scene 4 — A Hero's Reward |
| 5 | 第五幕 · 亲人团聚 | Scene 5 — Home at Last |

### 🚀 Run Locally

```bash
git clone https://github.com/PimplesOnNose/hua-mulan.git
cd hua-mulan
python3 -m http.server 8080
# Open http://localhost:8080
```

### 🙏 Credits

Crafted with 🤖 [Pi](https://pidev) and [StepFunAI](https://platform.stepfun.ai/).

### 📄 License

MIT — see [LICENSE](LICENSE) for details.
