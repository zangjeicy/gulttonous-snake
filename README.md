# NEON SNAKE — 霓虹贪吃蛇

霓虹赛博朋克风格的贪吃蛇网页游戏，基于 HTML5 Canvas 和原生 JavaScript (ES Modules) 开发。

## 截图


## 特性

- **霓虹赛博朋克视觉风格** — 发光边框、网格背景、扫描线特效，沉浸式科幻体验
- **完整游戏循环** — 开始 → 运行 → 暂停 → 游戏结束，状态切换流畅
- **排行榜系统** — LocalStorage 持久化存储 TOP 10 成绩
- **音效系统** — 吃食物、死亡、暂停等音效反馈，支持开关
- **穿墙模式** — 可从边界一侧穿越到另一侧
- **移动端适配** — 虚拟方向键，触屏设备也能畅玩
- **速度递增** — 随蛇身增长，游戏速度逐步提升

## 技术栈

- HTML5 Canvas
- JavaScript (ES Modules)
- [Vite](https://vitejs.dev/) — 开发与构建工具

## 项目结构

```
├── index.html              # 入口 HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.js             # 入口，模块初始化与事件绑定
    ├── styles.css          # 全局样式
    ├── core/               # 核心游戏逻辑
    │   ├── Game.js         # 游戏主控制器
    │   ├── Snake.js        # 蛇的数据模型
    │   ├── Food.js         # 食物生成逻辑
    │   └── Grid.js         # 网格坐标系统
    ├── render/             # 渲染层
    │   ├── Renderer.js     # 渲染调度器
    │   ├── SnakeRenderer.js
    │   ├── FoodRenderer.js
    │   └── Effects.js      # 粒子特效
    ├── input/
    │   └── InputManager.js # 键盘与触摸输入
    ├── audio/
    │   └── AudioManager.js # Web Audio API 音效
    ├── storage/
    │   └── StorageManager.js # LocalStorage 持久化
    └── ui/
        └── UIController.js # 界面控制（弹窗、分数、排行榜）
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 操作说明

| 按键 | 功能 |
|------|------|
| `↑` `↓` `←` `→` | 控制蛇的移动方向 |
| `空格` | 开始游戏 / 继续游戏 |
| `P` | 暂停 / 继续 |
| `R` | 重新开始 |

移动端可使用屏幕下方的虚拟方向键操作。

## 许可证

MIT License
