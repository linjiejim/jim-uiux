# Token

唯一来源是 `gallery/src/registry/jim/theme/jim-theme.css`（装进项目后在 `src/styles/jim-theme.css`）。本文和它冲突时，以 CSS 为准，并修正本文。

## 分层

```
取值（:root / .dark / 预设）  →  语义名（沿用 shadcn 的命名，另加少量扩展）  →  Tailwind 工具类（@theme inline）  →  组件
```

- 语义名沿用 shadcn：`background`、`foreground`、`primary`、`muted`、`accent`、`border`、`input`、`ring`、`destructive`…… 这样从 shadcn 生态直接装来的组件，也会自动套上这套主题。
- 扩展的名字：`sunken`、`selected`、`pressed`、`faint-foreground`、`inverse`、`scrim`、`primary-hover`，以及 `success` / `warning` / `info` 和各自的 `*-subtle`。
- 注意：在 shadcn 的语义里 `accent` 指**悬停填充**，不是品牌色。品牌色是 `primary`。

## 颜色

| Token | 用途 | 浅色 | 深色 |
| --- | --- | --- | --- |
| `background` | 画布 | #ffffff | #191919 |
| `sunken` | 侧栏、表头、代码块 | #f7f7f7 | #202020 |
| `muted` | 分段控件的轨道、骨架、中性标签 | #f0f0f0 | #2a2a2a |
| `popover` | 菜单、弹框、抽屉 | #ffffff | #252525 |
| `inverse` / `inverse-foreground` | Tooltip | #1f1f1f / #f5f5f5 | 浅色反过来 |
| `accent` | 悬停填充（半透明） | 黑 4.5% | 白 5.5% |
| `pressed` | 按下、当前导航项 | 黑 8% | 白 10% |
| `selected` | 选中行、已生效的筛选 | 强调色 8% | 强调色 12% |
| `foreground` | 正文 | #1a1a1a | #ececec |
| `muted-foreground` | 次要文字 | #5c5c5c | #a6a6a6 |
| `faint-foreground` | 元信息、占位文字、图标 | #6b6b6b | #8f8f8f |
| `border` | 细线、卡片、分割线 | #e8e8e8 | #2e2e2e |
| `input` | 控件边框 | #d4d4d4 | #3d3d3d |
| `primary` / `primary-foreground` | 唯一的强调色 | #1a1a1a / #fff | #ececec / #191919 |
| `ring` | 焦点环，默认等于 primary | | |
| `destructive` | 危险、失败 | #cf222e | #ff6b61 |
| `success` | 成功、在线 | #1a7f37 | #4cc26b |
| `warning` | 需要处理 | #8a5c00 | #e0a83a |
| `info` | 进行中、提示 | #0969da | #5aa2ff |
| `*-subtle` | 状态色的浅底 | 状态色按 9–11% 混入画布 | 按 14% 混入 |
| `scrim` | 遮罩 | 黑 32% | 黑 60% |

对比度门槛由 `guards/contrast.test.ts` 检查：

- 正文 ≥ 7:1。
- 次要文字、元信息、状态色文字（包括画在自己 subtle 底上的）≥ 4.5:1。
- 强调色和焦点环对画布 ≥ 3:1。

已知取舍：控件边框 `input` 没有达到 3:1（那样会太重）。控件靠标签、形状和 ≥ 3:1 的焦点环来识别。

## 分类色

用户自己选的颜色（项目色、标签、选项）和图表系列用这一组，不用强调色，也不写色值。

| 名字 | 浅色 fg | 深色 fg |
| --- | --- | --- |
| `gray` | #5f6168 | #b4b6bc |
| `red` | #c8302f | #ff9590 |
| `orange` | #ad4600 | #ffa25c |
| `amber` | #915a00 | #ffcb47 |
| `green` | #1d7a4f | #5ed59a |
| `teal` | #00796a | #3cd3ba |
| `blue` | #1f6cc0 | #7db9ff |
| `purple` | #7a45ae | #c9a2f5 |
| `pink` | #b42f7e | #ff8fcb |

- 每种一对：`--cat-<名字>` 是文字、图标、圆点、柱子；`--cat-<名字>-subtle` 是标签底，浅色按 10%、深色按 16% 混入画布。
- 工具类：`text-cat-blue`、`bg-cat-blue-subtle`、`bg-cat-blue`。代码里用 `lib/categorical.ts` 的 `catClass(name)` 拿完整类名；SVG 和画布用 `catVar(name)`。
- 存名字（`"blue"`），不存色值；读出来用 `categoricalFor(value, key)`，未知值按 key 稳定地分一个颜色。
- 图表系列顺序：`CHART_SERIES`（blue、orange、purple、teal、pink、amber、red、green、gray），相邻色相离得远；和 `dataviz` 技能对接时用这个顺序。
- 它们是数据，不是第二个强调色：不用在按钮、链接、导航、状态上；状态仍然用 success / warning / destructive / info。
- 颜色不能是唯一的信号：标签写名字，图表有图例或直接标注。
- 守卫：主题里声明的每个 `--cat-*` 都要在画布、下沉表面、浮层和自己的 subtle 底上 ≥ 4.5:1。

## 文字

一个无衬线字族：Inter（自带打包，不走 CDN），中文回落到苹方 / 雅黑 / Noto。

| 类名 | 字号 / 行高 | 用途 |
| --- | --- | --- |
| `text-hero` | 40 / 52 | 只用于营销页 |
| `text-display` | 28 / 40 | 数据大字、空页标题 |
| `text-title-lg` | 22 / 32 | 页面标题 |
| `text-title` | 18 / 26 | 弹框标题 |
| `text-heading` | 16 / 24 | 区块、抽屉、确认框的标题 |
| `text-reading` | 16 / 26 | 长文阅读；触屏上的输入框 |
| `text-body` | 14 / 22 | 界面正文（默认） |
| `text-small` | 13 / 20 | 标签、表头、次要信息 |
| `text-caption` | 12 / 18 | 说明、元信息。这是最小字号 |

- 字重：400 正文，500 标签、按钮和表头，600 所有标题。界面里不用 700 以上。这条约束 web 和嵌入页；原生 App 的标题跟平台（iOS HIG 的大标题 700），见 `adoption.md`「原生移动端」。
- 数字用 `.tabular`（等宽数字）。触屏上输入框的字号 ≥ 16px，避免 iOS 自动放大。
- 中文行高 ≥ 1.4，阶梯里每一级都满足。

## 应用内文字大小

一个可访问性偏好，存在账户里，不是项目旋钮。

- 7 档倍数：0.8 / 0.85 / 0.9 / 1（标准）/ 1.1 / 1.2 / 1.35，用文字描述（最小、更小、小、标准、大、特大、超大），不显示数字。
- 倍数乘在整条字号阶梯上（字号和行高一起乘，取整）；原生端系统的 Dynamic Type / 字体缩放再乘一次，两者都生效。
- 正文、卡片、列表跟这个倍数；系统导航栏、标签栏、菜单和系统表单只跟系统设置。
- 12px 下限针对标准档；用户自己选更小的档位是用户的选择。
- 布局要经得起 1.35 倍：不固定文字容器的高度，长文本换行或截断。
- 本 kit 的 web 组件没有内置这个倍数；需要时在项目里把 `--text-*` 乘上同一个倍数。

## 间距

沿用 Tailwind 的 4px 刻度，只用这几档：2 4 6 8 12 16 20 24 32 40 48 64。

- 控件内边距 8–12，字段之间 16，区块之间 32。
- 页面内边距 24（手机 16）。

## 圆角

由一个旋钮 `--radius`（默认 8）按比例生成：

| 类名 | 倍数 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `rounded-xs` | ×0.5 | 4 | 复选框、标签 |
| `rounded-sm` | ×0.75 | 6 | 徽章、菜单项 |
| `rounded-md` | ×1 | 8 | 按钮、输入框 |
| `rounded-lg` | ×1.5 | 12 | 卡片、浮层、Toast |
| `rounded-xl` | ×2 | 16 | 弹框 |
| `rounded-2xl` | ×3 | 24 | 底部弹层 |

## 层级

- `shadow-popover`：菜单、选择器、Popover、Tooltip。
- `shadow-overlay`：弹框、抽屉、底部弹层、Toast。
- 页面上的卡片只用 `border`，不加阴影。深色模式下阴影换成 1px 浅色描边。
- 多层弹层叠在一起时，只有最底下那层有遮罩（主题里有一条 CSS 规则自动处理）。

## 尺寸

| 变量 | 舒适 | 紧凑 | 触屏（任何密度下） |
| --- | --- | --- | --- |
| `--control-sm` / `-md` / `-lg` | 28 / 32 / 40 | 24 / 28 / 36 | 36 / 44 / 48 |
| `--row-h`（表格行） | 44 | 36 | 48 |
| `--row-head-h`（表头） | 36 | 32 | — |
| `--nav-item-h`（导航项） | 30 | 28 | 40 |

图标统一用 Lucide，描边 1.75（`--icon-stroke`）。尺寸：行内 14，按钮里 16，标题旁 20。

## 动效

| Token | 值 | 用途 |
| --- | --- | --- |
| `--duration-fast` | 120ms | 悬停、按下、开关 |
| `--duration-base` | 200ms | 菜单、弹框、Toast |
| `--duration-slow` | 240ms | 抽屉、底部弹层 |
| `--duration-exit` | 160ms | 所有退出 |
| `--ease-out` | cubic-bezier(.22, 1, .36, 1) | 进入 |
| `--ease-in` | cubic-bezier(.4, 0, 1, 1) | 退出 |
| `--ease-drawer` | cubic-bezier(.32, .72, 0, 1) | 抽屉、底部弹层 |

- 动画类：`animate-fade-in/out`、`pop-in/out`（弹框）、`drop-in/out`（菜单）、`slide-in-right` / `slide-out-right`（抽屉）、`slide-in-up` / `slide-out-down`（底部弹层）、`slide-in-left`（手机上的侧栏）。
- `--motion` 在「减少动态效果」下变为 0，此时所有位移和缩放的关键帧退化为淡入淡出。
- 按下缩放 .97 只在触屏上生效。

## 可调的旋钮

用默认皮肤时，除了下面这些，其他值都锁定。要改更多，就整套换皮肤（见下一节）。

| 旋钮 | 怎么调 |
| --- | --- |
| 强调色 | 覆盖 `--primary`、`--primary-foreground`（需要时再加 `--primary-hover`），浅色和深色各一份 |
| 中性色调 + 强调色整套 | 预设 `presets/warm.css`，用 `<html data-theme="…">` 启用 |
| 圆角 | `<html data-radius="sharp|round">`：4 或 12，整套圆角按比例一起缩放 |
| 密度 | `<html data-density="compact">` |
| 字体 | 覆盖 `--font-sans`；如果要单独的标题字体，覆盖 `--font-display` |
| 默认外观 | `lib/appearance.ts`：跟随系统、浅色或深色 |

新建预设的步骤：

1. 拷贝 `presets/warm.css`，只改**值**，不改名字。
2. 浅色和深色都写。
3. 跑 `contrast.test.ts`，它会自动发现新预设。

## 换一整套皮肤

项目有自己的品牌时，可以不调旋钮，把取值整套换掉。交互层、语义名和底线不变，分工见 `downstream.md`。

1. 在项目里写一个主题文件（比如 `src/styles/<项目>-theme.css`），在 `jim-theme.css` 之后引入；浅色写在 `:root`，深色写在 `.dark`。
2. 只给已有的语义名赋值：颜色、`--radius`、`--font-sans` / `--font-display` / `--font-mono`、阴影、`--duration-*` / `--ease-*`。不改名字的含义；项目自己的名字（领域色）另起，加进 `@theme inline`。
3. 项目原来的 token 名可以留着，把语义名指过去：`--background: var(--page)`。
4. 把这个文件加进 `design-guard.config.json` 的 `themeFiles`，跑守卫：对比度矩阵会按项目的皮肤算，浅色、深色都要过。
5. 项目 `DESIGN.md` 的「旋钮」写「皮肤：自己的」，注明文件位置，再列出和默认不同的取向（比如浮起的按钮有阴影、进场动效 360ms）。

## 深色模式

- 用 `<html>` 上的 `.dark` 类切换，不用 `dark:` 前缀去改颜色。组件里极少数地方用到了 `dark:`，比如开关的滑块。
- 偏好分三种：system、light、dark。存的是偏好本身，不是解析后的结果。页面里不自己去读系统外观。
- 首屏用 `APPEARANCE_BOOT_SCRIPT`（内联到 `<head>`）避免闪烁。
- `.dark` 必须加在 `<html>` 上：派生 token（比如 `--card: var(--background)`）是在根元素上计算的。

## 加一个新 token

1. 先确认真的需要。能用现有 token 表达的，就不加。
2. 在 `:root` 和 `.dark` 里都加上值，在 `@theme inline` 里映射成工具类。
3. 如果它是文字色或填充色，在 `contrast.test.ts` 的规则里加一条（`--cat-*` 会被自动发现）。
4. 在 gallery 的颜色页补上示例。
5. 在 `CHANGELOG.md` 里记一笔。
