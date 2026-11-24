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
| `card` | 卡片、表格容器；默认等于 `background` | #ffffff | #191919 |
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
| `primary-hover` | 主按钮悬停 | | |
| `ring` | 焦点环，默认等于 primary | | |
| `destructive` | 危险、失败 | #cf222e | #ff6b61 |
| `success` | 成功、在线 | #1a7f37 | #4cc26b |
| `warning` | 需要处理 | #8a5c00 | #e0a83a |
| `info` | 进行中、提示 | #0969da | #5aa2ff |
| `*-subtle` | 状态色的浅底 | 状态色按 9–11% 混入画布 | 按 14% 混入 |
| `scrim` | 遮罩 | 黑 32% | 黑 60% |

对比度门槛由 `guards/contrast.test.ts` 检查（规则在 `guards/contrast-lib.ts`，主题工作室用的是同一份）：

- 正文 ≥ 7:1。
- 次要文字、元信息、状态色文字（包括画在自己 subtle 底上的）≥ 4.5:1。
- 强调色和焦点环对画布 ≥ 3:1。
- 每个中性色预设 × 每个强调色预设 × 浅色 / 深色 × 增强对比度，都要过。

已知取舍：控件边框 `input` 没有达到 3:1（那样会太重）。控件靠标签、形状和 ≥ 3:1 的焦点环来识别。需要的人打开系统的「增强对比度」，控件边框就到 3:1（见下文「增强对比度」）。

## 增强对比度

系统设置里打开「增强对比度」（macOS / iOS 的 Increase contrast，Windows 的对比度主题，都报告 `prefers-contrast: more`）时自动生效；`<html data-contrast="more">` 可以强制打开。

- 次要文字 ≥ 7:1，元信息 ≥ 5.5:1，控件边框 ≥ 3:1（WCAG 1.4.11），细线、悬停和按下的填充加深，焦点环加粗到 3px。
- 取值从当前皮肤的 `foreground` 和 `background` 混出来，所以任何预设、任何项目皮肤都适用；用 `!important`，因为可访问性偏好要压过皮肤的选择器。
- 守卫对每个 scope 都按这套更严的门槛再查一遍。项目皮肤的正文色太浅（比如对比度调得很柔和）时，会在这里失败。

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

- 装带光学尺寸轴的 Inter：`import "@fontsource-variable/inter/opsz.css"`。浏览器默认 `font-optical-sizing: auto`，20px 以上的西文和数字自动换成 Display 字形（字距更紧、更精致），中文不受影响。只装 `wght` 版也能用，大字会松一些。
- 标题 `text-wrap: balance`（几行一样长），段落 `text-wrap: pretty`（末行不留孤字），主题的 base 层已经写好。
- 不给标题加负字距：负字距也会挤压中文。

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
- 本 kit 的 web 组件没有内置这个倍数；需要时在项目里把 `--text-*`（字号和 `--line-height` 一起）乘上同一个倍数。取值放在 `:root`，覆盖之后所有 `text-*` 类都会跟着变。

## 间距

沿用 Tailwind 的 4px 刻度，只用这几档：2 4 6 8 12 16 20 24 32 40 48 64。

- 控件内边距 8–12。
- 版面的四个距离是 token，由「留白」旋钮（`data-spacing`）一起调：

| Token | 用途 | 紧凑 | 标准 | 宽松 |
| --- | --- | --- | --- | --- |
| `--space-page` | 页面内边距（手机上固定 16） | 20 | 24 | 32 |
| `--space-section` | 区块之间、主栏和侧栏之间 | 24 | 32 | 48 |
| `--space-field` | 字段之间（`FieldGroup`） | 12 | 16 | 20 |
| `--space-card` | 卡片之间、卡片内边距 | 12 | 16 | 20 |

- 用法：`px-(--space-page)`、`gap-(--space-section)`。`Page`、`Section`、`PageColumns`、`FieldGroup`、`Card`、`CardGrid`、`StatGrid` 已经在用，页面里不另写这些距离。
- 密度（`data-density`）管控件和行有多高，留白管版面之间隔多远，两个旋钮互不影响。

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
- 叠放顺序只有四层，用 `z-(--z-*)`，不写数字：`--z-sticky` 10（吸底的保存条、面板之间的拖拽把手；表格的吸顶表头和固定列只在表格内部叠放）< `--z-float` 40（停靠的 inspector、上传队列）< `--z-overlay` 50（菜单、弹框、抽屉、Tooltip）< `--z-toast` 60。弹层之间靠打开的先后叠放。

## 尺寸

| 变量 | 舒适 | 紧凑 | 触屏（任何密度下） |
| --- | --- | --- | --- |
| `--control-sm` / `-md` / `-lg` | 28 / 32 / 40 | 24 / 28 / 36 | 36 / 44 / 48 |
| `--row-h`（表格行） | 44 | 36 | 48 |
| `--row-head-h`（表头） | 36 | 32 | — |
| `--nav-item-h`（导航项） | 30 | 28 | 40 |

图标统一用 Lucide，描边 1.75（`--icon-stroke`）。尺寸：徽章和勾选标记里 12，行内和筛选条 14，按钮和菜单里 16，空状态 24 / 32（`StateView`）。

### 焦点与禁用

| Token | 值 | 用途 |
| --- | --- | --- |
| `--focus-width` | 2px（增强对比度 3px） | 所有控件的焦点环 |
| `--focus-offset` | 2px | 焦点环和控件之间的空隙 |
| `--focus-halo` | `ring` 的 15%（增强对比度下是实色） | 文本框聚焦：边框变 `ring`，外面一圈光晕 |
| `--disabled-opacity` | 0.5 | 开关、勾选、单选、滑杆、色块；按钮和输入框不降透明度，改成中性色 |

## 动效

| Token | 值 | 用途 |
| --- | --- | --- |
| `--duration-fast` | 120ms | 悬停、按下、开关；菜单、选择器、Popover 的进出 |
| `--duration-base` | 200ms | 弹框进入 |
| `--duration-slow` | 240ms | 抽屉、底部弹层进入 |
| `--duration-exit` | 160ms | 弹框、抽屉、底部弹层退出 |
| `--ease-out` | cubic-bezier(.22, 1, .36, 1) | 进入 |
| `--ease-in` | cubic-bezier(.4, 0, 1, 1) | 退出 |
| `--ease-drawer` | cubic-bezier(.32, .72, 0, 1) | 抽屉、底部弹层 |

- 动画类：`animate-fade-in/out`、`pop-in/out`（弹框）、`drop-in/out`（菜单）、`slide-in-right` / `slide-out-right`（抽屉）、`slide-in-up` / `slide-out-down`（底部弹层）、`slide-in-left`（手机上的侧栏）。
- 位移和缩放乘 `--motion`，它在「减少动态效果」下变为 0，于是每一种进出都只剩淡入淡出（`gallery/src/tests/motion.test.ts` 守着这条）。弹框、菜单正常时也淡入；抽屉、底部弹层正常时实心滑动，不变透明。
- 退出动画停在终点（`forwards`）：面板卸载晚一帧也不会闪回。
- 没写曲线和时长的 `transition-*` 默认就是 `--duration-fast` + `--ease-out`，不是 Tailwind 的 150ms。
- 两处用第三方自己的时长：Toast（Sonner，进出约 400ms；减少动态效果下没有动画）和 `BottomSheet`（vaul 的拖拽物理，500ms）。
- 按下缩放 .97 只在触屏上生效。

## 可调的旋钮

用默认皮肤时，除了下面这些，其他值都锁定。要改更多，就整套换皮肤（见下一节）。

| 旋钮 | 怎么调 |
| --- | --- |
| 强调色 | 预设 `presets/accents.css`：`<html data-accent="blue|indigo|violet|pink|teal">`；或者覆盖 `--primary`、`--primary-foreground`（需要时再加 `--primary-hover`），浅色和深色各一份 |
| 中性色调 | 预设 `presets/warm.css`（暖灰，Notion 风）、`slate.css`（冷灰）、`sage.css`（灰绿）、`mauve.css`（灰紫），用 `<html data-theme="…">` 启用；可以和任何强调色预设组合 |
| 圆角 | `<html data-radius="sharp|round">`：4 或 12，整套圆角按比例一起缩放；其他值写 `--radius` |
| 密度 | `<html data-density="compact">`：控件和行高 |
| 留白 | `<html data-spacing="compact|relaxed">`：页边距、区块、字段、卡片之间（上文「间距」） |
| 对比度 | 皮肤里的取值（主题工作室的「层次」）；系统「增强对比度」或 `data-contrast="more"` 自动加深 |
| 字体 | 覆盖 `--font-sans`；如果要单独的标题字体，覆盖 `--font-display` |
| 默认外观 | `lib/appearance.ts`：跟随系统、浅色或深色 |

搭配建议（取自 Radix）：蓝、靛配冷灰；紫、玫红配灰紫；青配灰绿；暖灰配墨。强调色预设里没有红、绿、黄、橙：红是危险，绿是成功，黄是「需要你处理」，橙离红太近。

## 主题工作室

gallery 的 `#/studio`（线上 https://design.linjiejim.com/#/studio）：在真实组件上调中性色（预设或色相 + 浓度）、强调色（预设或任意颜色）、对比度、圆角、密度、留白和字体，整个 gallery 跟着换；右边列出每一条对比度检查（浅色、深色、增强对比度），然后导出一个皮肤文件。

- 源头仍是 CSS：工作室从 `jim-theme.css` 和 `presets/*.css` 读取默认值和预设，不另存一份。设成某个预设时，导出的就是那个预设的值（测试保证）。
- 在 OKLCH 里改：色调 = 色相 + 浓度，按 token 分配（近白的表面只带一点）；对比度 = 表面、细线、文字之间的明度差。改完再按守卫的门槛逐条检查，不达标的文字和强调色自动挪到刚好达标，挪了哪些会列出来。
- 自定义强调色：保持色相和尽量多的饱和度，只移动明度，直到对画布和浮层 ≥ 3:1、上面的白字 ≥ 4.5:1；颜色很浅（黄、浅粉）时改用深色字。和危险、成功、警告的色相差不到 25° 时，会提示「分不清」。
- 导出：`:root` 和 `.dark` 两块，只给语义名赋值；密度和留白是 `<html>` 上的属性，不写进 CSS（触屏 44px 的下限靠它们）。「复制链接」能把这一套设置原样分享。
- 它是设计时的工具：产品里不给用户换皮肤（`principles.md`「不做的事」）。

新建预设的步骤：

1. 在主题工作室里调出来，导出 CSS。
2. 中性色预设：拷贝 `presets/warm.css` 的结构，只改**值**，不改名字，浅色和深色都写。强调色预设：在 `presets/accents.css` 里加两行（`html[data-accent="…"]` 和 `html.dark[data-accent="…"]`）。
3. 跑 `contrast.test.ts`，它会自动发现新预设，并和所有已有的预设组合检查。

## 换一整套皮肤

项目有自己的品牌时，可以不调旋钮，把取值整套换掉。交互层、语义名和底线不变，分工见 `downstream.md`。

1. 在项目里写一个主题文件（比如 `src/styles/<项目>-theme.css`），在 `jim-theme.css` 之后引入；浅色写在 `:root`，深色写在 `.dark`。颜色可以先在主题工作室里调好再导出，导出的文件就是这个格式。
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
