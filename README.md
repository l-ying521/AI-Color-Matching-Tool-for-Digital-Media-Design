# AI智能配色助手 🎨

面向数字媒体设计的智能配色工具，帮助设计师快速生成专业配色方案。

---

## 🌟 功能特点

- **交互式色轮** - 直观的颜色选择界面，实时预览选中颜色
- **多种配色规则** - 支持互补色、类似色、三色配色、分裂互补色、矩形配色、单色配色
- **随机配色生成** - 无限创意灵感，支持基础色锁定和多种随机模式
- **图片取色** - 从图片中提取主色调，实现实景配色
- **HSV精确微调** - 精细调整色相、饱和度、明度参数
- **多模板预览** - UI卡片、插画风格、海报设计三种预览模式
- **多格式导出** - 支持 CSS、PNG、JSON、SCSS、Tailwind 配置导出
- **历史记录** - 自动保存配色方案，随时回溯复用
- **主题切换** - 支持深色/浅色主题

---

## 🚀 快速开始

### 环境要求

无需任何依赖，纯前端静态项目，支持现代浏览器。

### 运行方式

#### 方式一：直接打开（推荐）

1. 克隆或下载项目
2. 使用浏览器直接打开 `index.html` 文件

```bash
git clone https://github.com/l-ying521/AI-Color-Matching-Tool-for-Digital-Media-Design.git
cd AI-Color-Matching-Tool-for-Digital-Media-Design
# 使用浏览器打开 index.html
```

#### 方式二：本地服务器（推荐用于开发）

使用 Python 启动本地服务器：

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后访问 `http://localhost:8000`

#### 方式三：使用 Live Server（VS Code 插件）

1. 安装 VS Code 插件 `Live Server`
2. 在 `index.html` 文件上右键选择 "Open with Live Server"

---

## 📁 项目结构

```
AI-Color-Matching-Tool-for-Digital-Media-Design/
├── index.html          # 主页面
├── index.mvp.html      # MVP 版本页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── App.js          # 主应用控制器
│   ├── ColorUtils.js   # 颜色工具库（颜色转换、配色算法）
│   ├── ColorWheel.js   # 色轮组件（Canvas渲染）
│   ├── EventBus.js     # 事件总线（组件通信）
│   ├── ExportService.js # 导出服务（多格式导出）
│   ├── HistoryPanel.js # 历史记录面板
│   ├── ImageExtractor.js # 图片颜色提取器（K-Means算法）
│   ├── ImagePanel.js   # 图片上传面板
│   ├── PaletteDisplay.js # 色板显示组件
│   ├── PreviewPanel.js # 预览面板（三种模板）
│   ├── RandomPanel.js  # 随机配色面板
│   ├── SlidersPanel.js # HSV滑块面板
│   └── StorageService.js # 存储服务（localStorage）
└── docs/               # 项目文档（见下方）
```

---

## 🛠️ 技术栈

- **前端框架**: 原生 JavaScript（ES6+）
- **样式**: CSS3（Flexbox、CSS Variables）
- **图形渲染**: HTML5 Canvas API
- **状态管理**: 事件总线（Publish-Subscribe 模式）
- **数据持久化**: localStorage
- **颜色算法**: HSL/HSV 颜色空间、K-Means 聚类（图片取色）

---

## 📖 使用说明

### 1. 色轮选择

点击色轮任意位置选择基础色，色板会自动更新为对应的配色方案。

### 2. 配色规则切换

在"配色规则"区域点击不同按钮，切换配色方案：
- 🔴 **互补色** - 180° 对立色
- 🟢 **类似色** - 30° 邻近色
- 🟡 **三色配色** - 120° 三等分
- 🟣 **分裂互补色** - 互补色两侧
- 🔵 **矩形配色** - 两对互补色
- ⚪ **单色配色** - 同色相不同明度

### 3. 随机配色

点击"随机生成"按钮获取随机配色，可：
- 锁定基础色后随机生成
- 切换随机模式（和谐模式/创意模式）

### 4. 图片取色

点击"上传图片"或拖拽图片到指定区域，提取图片中的主色调。

### 5. HSV微调

拖动滑块精确调整选中颜色的：
- **Hue（色相）**: 0-360°
- **Saturation（饱和度）**: 0-100%
- **Value（明度）**: 0-100%

### 6. 预览模式

切换预览模板查看配色效果：
- 📱 UI卡片 - 移动端界面预览
- 🎨 插画 - 艺术作品配色预览
- 📄 海报 - 平面设计配色预览

### 7. 导出功能

点击"导出"按钮选择格式导出配色方案：
- CSS - CSS 变量格式
- SCSS - SCSS 变量格式
- Tailwind - Tailwind CSS 配置
- PNG - 色板图片
- JSON - 颜色数据

---

## 📝 项目文档

| 文档名称 | 说明 |
|---------|------|
| [2408090602018_刘盈_需求规格说明书.docx](2408090602018_刘盈_需求规格说明书.docx) | 项目需求分析 |
| [2408090602018_刘盈_可行性分析报告.docx](2408090602018_刘盈_可行性分析报告.docx) | 技术可行性分析 |
| [2408090602018_刘盈_概要设计说明书.docx](2408090602018_刘盈_概要设计说明书.docx) | 系统概要设计 |
| [2408090602018_刘盈_详细设计说明书.docx](2408090602018_刘盈_详细设计说明书.docx) | 详细设计文档 |
| [UI设计需求文档.md](UI设计需求文档.md) | UI设计规范 |
| [2408090602018_刘盈_软件测试计划与报告.docx](2408090602018_刘盈_软件测试计划与报告.docx) | 测试文档 |

---

## 🎯 核心模块代码统计

| 模块 | 有效代码行 | 功能说明 |
|------|-----------|---------|
| App.js | 787 | 主应用控制器 |
| ColorUtils.js | 293 | 颜色工具库（核心算法） |
| ColorWheel.js | 260 | 色轮组件 |
| PreviewPanel.js | 270 | 预览面板 |
| PaletteDisplay.js | 233 | 色板显示 |
| StorageService.js | 201 | 存储服务 |
| HistoryPanel.js | 191 | 历史记录 |
| ImagePanel.js | 166 | 图片面板 |
| SlidersPanel.js | 163 | HSV滑块 |
| ExportService.js | 149 | 导出服务 |
| RandomPanel.js | 144 | 随机配色 |
| ImageExtractor.js | 127 | 图片提取器 |
| EventBus.js | 72 | 事件总线 |
| **合计** | **2,926** | - |

---

## 🧪 测试结果

| 测试项 | 结果 |
|--------|------|
| 功能测试通过率 | 100% |
| 性能测试通过率 | 100% |
| 首屏加载时间 | 850ms |
| 配色生成响应 | < 100ms |
| 浏览器兼容性 | ✅ Chrome / ✅ Edge / ✅ Firefox / ✅ Safari |

---

## 📄 许可证

本项目为课程作业，仅供学习参考使用。

---

## 📬 联系方式

如有问题或建议，请提交 Issue 或 PR。

---

*Made with ❤️ for Digital Media Design*