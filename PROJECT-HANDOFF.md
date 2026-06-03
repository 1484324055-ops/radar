# 雷达 PWA 项目交接文档

## 一、项目概述

### 是什么
「雷达」是一个基于「梳理—合并—突破」方法论的个人 PWA 工作台，部署在 Vercel 上，用户通过 iPhone 主屏幕图标和 Safari 浏览器访问。

### 方法论来源
来自生财有术亦仁的分享，核心流程：
1. **倾倒**：把脑子里所有想法不分类倒出来
2. **翻译**：把倾倒条目翻译成任务（选优先级/类别）
3. **主战役**：每周定 1-2 个最重要的事，48 小时内推进
4. **执行**：按周节奏（周一梳理/周二四突破/周三关系/周五清债）推进
5. **复盘**：每日复盘 + 周五收口复盘

### 技术栈
- React + Vite + TailwindCSS
- Zustand 状态管理
- localStorage 持久化
- react-router-dom (HashRouter)
- recharts 图表
- lucide-react 图标
- GitHub Gist 云同步

### 仓库和部署
- GitHub 仓库：`https://github.com/1484324055-ops/radar`
- 旧 Vercel 项目：`https://radar-six-dusky.vercel.app`（有 Service Worker 缓存问题，废弃）
- 新 Vercel 项目：`https://radar-v2-sigma.vercel.app`（当前使用）
- 本地路径：`f:\Obsidian\lzj-notes\20_项目\radar`

---

## 二、已实现的功能

### 页面结构（11 个页面）

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/` | 今日节奏、48h 倒计时、链路提示、今日任务、统计卡片 |
| 倾倒 | `/capture` | 快速输入 + 语音输入，存入待处理池 |
| 待处理池 | `/inbox` | 倾倒条目 → 变成任务 / 不需要 / 删除 |
| 任务池 | `/tasks` | 任务列表 + 搜索 + 状态筛选 + 今日筛选 |
| 不做池 | `/not-doing` | 战略性放弃的任务（恢复/彻底删除） |
| 本周 | `/week` | 主战役设定 + 七天节奏表 |
| 数据 | `/stats` | 完成率饼图 + 周趋势柱状图 + 主战役历史 |
| 设置 | `/settings` | 主题切换 + 云同步 + 数据导入导出 + 新手引导重看 |
| 帮助 | `/help` | 内置使用手册（折叠式） |
| 每日复盘 | `/daily-review` | 今日概览 + 完成列表 + 反思记录 |
| 周复盘 | `/weekly-review` | 完成率环形图 + 类别分配 + 主战役回顾 + 下周预备 |

### 全局组件
- `TabBar`：底部 6 个 Tab 导航（仪表盘/倾倒/待处理/任务/本周/数据）
- `QuickCapture`：右下角悬浮 + 号，任何页面快速倾倒
- `Onboarding`：5 步新手引导，设置里可重看
- `StatusPicker`：任务状态直接选择器（弹窗）
- `SwipeableCard`：滑动手势组件（左滑删除/右滑完成）
- `EmptyState`：空状态占位图

### 数据模型

```js
// 倾倒条目
Capture { id, content, createdAt, processed }

// 任务
Task { id, title, description, status, priority, category, campaignId, fromCaptureId, dueDate, day, notes[], createdAt }

// 主战役
Campaign { id, title, weekStart, pushPlan, progress[], createdAt }

// 日志
DailyLog { date, reflections[] }
```

状态枚举：`not-started` / `in-progress` / `done` / `paused` / `not-doing`
优先级枚举：`campaign` / `important` / `normal`
类别枚举：`breakthrough` / `debt` / `relation`

---

## 三、当前状态：能用的部分

以下功能在新地址 `https://radar-v2-sigma.vercel.app` 上**已验证可用**：

- [x] 所有页面渲染正常
- [x] 倾倒 → 存入待处理池
- [x] 待处理池 → 变成任务（居中弹窗，按钮固定底部）
- [x] 任务列表 + 搜索 + 状态筛选 + 今日筛选
- [x] 任务状态切换（点击图标循环 / 展开后「切换状态」按钮弹出选择器）
- [x] 任务分配到天（横向滚动按钮行）
- [x] 任务推进记录
- [x] 主战役设定 + 48h 倒计时
- [x] 仪表盘链路提示（待翻译/未分配数量）
- [x] 仪表盘今日任务列表
- [x] 每日复盘 + 周复盘
- [x] 数据统计（饼图 + 柱状图）
- [x] 三套主题切换（浅色/深色/暖光）
- [x] 数据导入/导出 JSON
- [x] 新手引导（5 步，可重看）
- [x] 内置帮助手册
- [x] 触觉反馈（振动）
- [x] 语音输入（Safari 可用，PWA standalone 可能不可用）
- [x] iPhone 13 Pro 安全区域适配（刘海 47px 保底）

---

## 四、未解决的关键问题

### 问题 1：iOS 主屏幕 PWA 与 Safari 数据不共享

**现象**：用户在 Safari 中添加的数据，在主屏幕图标打开的 PWA 中看不到，反之亦然。

**根因**：iOS 16.4 起，苹果将 PWA（主屏幕图标）和 Safari 浏览器的存储空间完全隔离。它们使用不同的 localStorage，数据不互通。这是 iOS 系统级限制，无法绕过。

**已尝试的方案**：
- Service Worker 缓存策略调整 → 无效（问题不在 SW，在存储隔离）
- 自动云同步（autoSync）→ 代码已写但用户未配置 GitHub Token

**需要完成的工作**：
1. 云同步功能已实现（`src/utils/sync.js`），需要用户在两端都配置 GitHub Token
2. `autoSync` 已接入（App 加载时 pull + 数据变更后 3 秒 debounce push），但需要验证实际效果
3. 考虑是否需要更简单的同步方案（不需要 GitHub Token 的方案）

### 问题 2：Service Worker 缓存导致更新不生效

**现象**：代码更新后，用户手机（PWA 和 Safari）仍然加载旧版代码。

**根因**：vite-plugin-pwa 生成的 Service Worker 会缓存所有静态资源。即使配置了 `skipWaiting: true` 和 `clientsClaim: true`，旧 SW 仍然会拦截请求直到新 SW 完全激活。在 iOS Safari 上，SW 更新行为更加不可预测。

**当前状态**：已**彻底移除 Service Worker**（删除了 vite-plugin-pwa 配置）。现在每次打开页面都从服务器获取最新代码。

**已添加的清理机制**：`index.html` 中有一段内联脚本，会自动注销旧的 SW 并清除所有缓存。

**后续考虑**：
- 离线支持没了。如果需要离线功能，需要重新引入 SW，但必须解决缓存更新问题
- 考虑使用 `Cache-Control: no-cache` header 或 Vercel 的 `immutable` 部署缓存策略

### 问题 3：SwipeableCard 滑动手势仍有潜在问题

**当前实现**（`src/components/SwipeableCard.jsx`）：
- 方向锁定：20px 死区后判断水平/垂直，垂直时完全不拦截
- `touchAction: 'pan-y'` 静态设置，让浏览器原生处理垂直滚动
- 100px 阈值才触发动作
- 触发后 800ms 确认期（卡片变淡+缩进）

**可能存在的问题**：
- `touchAction: 'pan-y'` 在某些 iOS 版本上可能不被尊重
- `e.preventDefault()` 在 `touchmove` 中调用时可能影响其他手势
- 长按功能已移除（与滑动冲突），用户没有直接的状态选择入口（除了展开后的「切换状态」按钮）

---

## 五、项目结构

```
radar/
├── index.html              # 入口，含 SW 清理脚本 + 主题防闪烁脚本
├── vite.config.js           # Vite 配置（无 PWA 插件）
├── public/
│   ├── icon.svg             # PWA 图标
│   └── manifest.json        # PWA manifest
├── src/
│   ├── main.jsx             # 入口，HashRouter
│   ├── App.jsx              # 路由 + 全局组件 + autoSync
│   ├── index.css            # TailwindCSS + 主题变量 + 安全区域
│   ├── stores/
│   │   └── useStore.js      # Zustand store（所有数据操作 + 云同步）
│   ├── utils/
│   │   ├── constants.js     # 枚举值、周节奏模板
│   │   ├── helpers.js       # 日期、ID 生成、周判断
│   │   ├── haptics.js       # 触觉反馈
│   │   └── sync.js          # GitHub Gist 云同步
│   ├── hooks/
│   │   ├── useTheme.js      # 主题切换
│   │   └── useVoice.js      # 语音输入
│   ├── components/
│   │   ├── TabBar.jsx       # 底部导航
│   │   ├── QuickCapture.jsx # 快速倾倒弹窗
│   │   ├── Onboarding.jsx   # 新手引导
│   │   ├── StatusPicker.jsx # 状态选择器
│   │   ├── SwipeableCard.jsx# 滑动手势卡片
│   │   └── EmptyState.jsx   # 空状态
│   └── pages/
│       ├── Dashboard.jsx    # 仪表盘
│       ├── Capture.jsx      # 倾倒
│       ├── Inbox.jsx        # 待处理池
│       ├── Tasks.jsx        # 任务池
│       ├── NotDoing.jsx     # 不做池
│       ├── Week.jsx         # 本周
│       ├── Stats.jsx        # 数据统计
│       ├── Settings.jsx     # 设置
│       ├── Help.jsx         # 帮助
│       ├── DailyReview.jsx  # 每日复盘
│       └── WeeklyReview.jsx # 周复盘
└── 使用手册.md               # 完整使用手册
```

---

## 六、代码层面的已知问题

### 6.1 recharts 体积过大
recharts 包含在主 bundle 中（721KB gzip 后 212KB）。之前尝试用 `React.lazy` 动态导入失败（recharts 没有 default export）。需要找到正确的代码分割方式。

### 6.2 autoSync 未验证
`src/stores/useStore.js` 中的 `triggerAutoSync()` 在每次 `save()` 后 3 秒触发，调用 `saveToGist()`。但从未在真实环境中验证过。`src/App.jsx` 中的 `pullFromCloud()` + `autoSync()` 也未验证。

### 6.3 iOS PWA standalone 模式检测
`src/hooks/useVoice.js` 中通过 `window.navigator.standalone` 检测 PWA 模式，但这个属性只在 iOS Safari 上有效。Android Chrome 的 PWA 模式用 `display-mode: standalone` CSS 媒体查询检测。

### 6.4 任务「不做」功能的触发路径
任务卡片展开后有「不做」按钮，调用 `updateTask(id, { status: 'not-doing' })`。但 `cycleTaskStatus` 的循环数组中不包含 `not-doing`，所以只能通过展开后的按钮触发，不能通过点击图标循环到达。

### 6.5 数据验证不够严格
`importData` 验证了数组类型，但没有验证数组元素的结构。导入一个 `tasks: [1, 2, 3]` 的 JSON 不会报错但会导致运行时崩溃。

---

## 七、用户的需求和偏好

### 用户画像
- iPhone 13 Pro 用户
- 主要在手机上使用（主屏幕图标 + Safari）
- 不是技术背景，不想频繁清缓存
- 希望「开箱即用」，配置尽量少

### 已确认的偏好
- 浅色主题为默认，支持日夜切换
- 不要深色科技感
- 数据仪表盘风格
- 语音输入 + 手动输入
- 工作节奏建议 + 可调整
- 用语要普通人能懂（避免互联网/AI 黑话）

### 已确认的反馈
- 删除操作需要二次确认，不能一滑就删
- 滑动手势不能太敏感
- 按钮要有足够的触摸区域（≥44px）
- 弹窗内容要能滚动，操作按钮不能被截断
- 不要频繁清缓存

---

## 八、下一步建议任务

### 优先级 P0（必须解决）

1. **验证云同步是否真正可用**
   - 在新地址上测试：设置 Token → 添加数据 → 另一个浏览器打开 → 拉取 → 看数据是否同步
   - 如果 `saveToGist` / `loadFromGist` 有 CORS 或 API 问题，需要修复

2. **考虑替代同步方案**
   - GitHub Gist 需要用户创建 Token，对非技术用户门槛太高
   - 考虑：Firebase Realtime Database / Supabase / 简单的 JSONBin.io 等免 Token 方案
   - 或者：用 URL 参数传递数据 ID + 密码，服务器端存储

3. **recharts 代码分割**
   - 找到正确的动态导入方式，减少首屏加载体积

### 优先级 P1（应该解决）

4. **任务卡片展开布局优化**
   - 当前展开后有：日选择 + 推进记录 + 添加记录输入 + 切换状态/不做/删除 按钮
   - 在小屏幕上可能仍然偏长
   - 考虑：推进记录折叠显示、操作按钮改为底部固定

5. **SwipeableCard 可靠性**
   - 在真机上测试各种 iOS 版本的滑动行为
   - 考虑：如果滑动始终不可靠，改为长按弹出操作菜单（删除/完成/不做）

6. **离线支持**
   - 当前移除了 Service Worker，没有离线能力
   - 如果用户在地铁里打开会白屏
   - 考虑：重新引入 SW 但用 NetworkFirst 策略 + 版本号强制更新

### 优先级 P2（可以后做）

7. **数据统计增强**
   - 当前只有本周数据
   - 可以加：月度趋势、连续完成天数、主战役完成率历史

8. **通知/提醒**
   - 48h 推进计划到期提醒
   - 每日复盘提醒
   - 需要 Web Push API 或定时检查

9. **多设备同步 UI 优化**
   - 当前同步状态不够直观
   - 可以加：同步状态指示器、最后同步时间、冲突解决

---

## 九、构建和部署命令

```bash
# 进入项目目录
cd "f:\Obsidian\lzj-notes\20_项目\radar"

# 安装依赖
npm install

# 本地开发
npm run dev
# 访问 http://localhost:5173

# 构建
npm run build
# 输出到 dist/

# 部署到 Vercel（新项目 radar-v2）
vercel --yes --prod

# 部署到旧项目（不推荐，有缓存问题）
vercel --yes --prod --project radar
```

---

## 十、重要文件说明

### `src/stores/useStore.js`
所有数据操作的中心。每个操作都通过 `save()` 函数持久化到 localStorage 并触发云端同步。`save()` 函数返回状态更新对象 + 错误信息。

### `src/utils/sync.js`
GitHub Gist 同步工具。Token 和 Gist ID 存在 localStorage 的 `radar-sync-token` 和 `radar-sync-gist-id` 键中。

### `src/components/SwipeableCard.jsx`
滑动手势核心组件。方向锁定逻辑：20px 死区 → 判断水平/垂直 → 水平时 `e.preventDefault()` 阻止页面滚动 → 100px 阈值触发 → 800ms 确认期。

### `src/pages/Inbox.jsx`
ConvertModal（变成任务弹窗）从底部弹出改为居中弹窗，`maxHeight: min(70vh, 500px)`，内容可滚动，按钮固定底部。

### `index.html`
包含两个内联脚本：
1. SW 清理脚本：注销旧 SW + 清除所有缓存
2. 主题防闪烁脚本：在 React 挂载前读 localStorage 设置主题

---

## 十一、用户当前的阻塞点

用户最核心的诉求是：**在主屏幕图标和 Safari 中看到同一份数据，不需要频繁清缓存**。

当前的阻塞是：
1. Service Worker 已移除，缓存问题应该解决了（需要用户验证）
2. 数据同步需要用户配置 GitHub Token（门槛较高）
3. 用户已经失去耐心，需要一个「一步到位」的解决方案

**建议接手后首先验证**：
1. 在新地址 `radar-v2-sigma.vercel.app` 上操作，确认没有缓存问题
2. 测试 GitHub Gist 同步是否真正可用
3. 如果同步可用，帮用户一次性配置好两端
4. 如果同步不可用，考虑替代方案
