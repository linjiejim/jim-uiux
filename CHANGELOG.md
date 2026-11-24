# Changelog

## 1.10.1 · 2026-11-24

英文版的更新记录；`InlineRename` 的文字和同列对齐（理由见 `references/decisions.md`「1.10.0」里标了 1.10.1 的几行）。

- 新 `CHANGELOG.en.md`：每一版的英文说明，和 `CHANGELOG.md` 逐条对应。gallery 英文模式下的更新提示、「更新内容」和设置里的列表都读它；GitHub Release 在中文后面接上英文。`patterns/updates.md` 写了两种语言的应用怎么按界面语言选一份。
- `InlineRename` 的文字不再比表头和同列的文字往右 7px：框向两边伸出去，文字留在原位。`DataTable` 的单元格给伸出去的框留了地方。
- 升级时注意：`InlineRename` 放在自己的 `truncate` 或 `overflow-hidden` 容器里时，给容器加 `-mx-2 px-2`，否则框的左边会被切掉；或者传 `className="mx-0 max-w-full"` 保持原来的位置。

## 1.10.0 · 2026-11-24

格式化工具、更严的守卫、英文文案、多选和原位改名；gallery 全站中英文、更精简，并加上渲染级测试（理由见 `references/decisions.md`「1.10.0」）。

- 新 `lib/format.ts`：`formatDate`（今年「10月31日」，跨年带年份）、`formatRelative`（「刚刚」「3 分钟前」「昨天 09:00」，只用在动态流里）、`formatMoney`（「¥128,000」）、`formatNumber`、`formatPercent`、`formatBytes`、`formatTime`。语言跟着 `strings` 的 `locale`。
- kit 自带英文文案：`configureStrings(en)`。`Strings` 新增 `locale` 和相对时间的几句话；上传失败的原因不再用全角冒号硬拼。
- `Combobox` 新增 `multiple`：已选项是标签，放不下时收成「+N」；重新打开时已选项排在最前；支持异步搜索（加载中、没有结果、失败重试）和新建选项；Backspace 删掉最后一个。
- 新组件 `InlineRename`：名字就在眼前时原位改名。回车或点开保存，Esc 取消（不会顺带关掉外面的抽屉或弹框）；中文输入法组字时的回车不保存；支持校验、异步保存和从菜单发起。`patterns/overlays.md` 写了什么时候用它、什么时候仍用弹框。
- 守卫新增五条：比 600 更粗的字重、10 以上的 z-index 没用层级 token（`z-[1]`–`z-[9]` 留给组件内部）、写死的时长和曲线、`dark:` 颜色覆盖、「确定」「提交」「OK」这类按钮文案。
- gallery：
  - 全站中文 / 英文：侧栏底部的「EN / 中」切换，也可以用 `?lang=en`；样例数据、日期和数字一起换。
  - 侧栏重排成四组、标签缩短；列表的表格和网格合成一项，用页头的切换进入。
  - 每页先展示，背景、理由、源码路径收进标题旁的 ⓘ；文案大幅精简。
  - 新加多选和原位改名的演示。
- 修复（渲染级测试查出来的）：对比度守卫改按屏幕实际显示的 8 位颜色计算，浅色的 `--success-subtle` 因此从 9% 降到 8%（「已完成」徽章原来只有 4.49:1）；`Button` 加载中不再丢掉按钮名字（以前文字用 `invisible` 藏起来，读屏读不到）。
- 渲染级测试：`pnpm e2e`（Playwright + axe）在每个页面 × 浅色 / 深色 / 手机 / 增强对比度下查无障碍问题，加焦点归还、翻页守卫、减少动效、语言切换的交互检查和几张截图；PR 上的 CI 会跑。`pnpm e2e:baselines` 在 Docker 里重做截图基线。
- 升级时注意：重新装 `@jim/guards` 后，项目里的 `font-bold`、`z-50` 这类裸 z-index、`duration-300` 这类写死的时长、`dark:` 颜色覆盖、「确定」按钮会让守卫失败；改成 token，或者在那一行写 `design-allow: <原因>`。要英文界面的项目启动时调用 `configureStrings(en)`。

## 1.9.0 · 2026-11-24

动效修好了，可配置的取值补成 token，组件的一批正确性问题修掉（理由见 `references/decisions.md`「1.9.0」）。默认外观不变。

- 修复：抽屉关闭时看不到动画。gallery 的 CRUD 和列表详情在关闭的同一刻清掉了选中项，内容立刻卸载；新 hook `useLastDefined` 在退出动画期间保留最后的内容（`overlays.md` 写了这条规则）。抽屉、底部弹层改成实心滑入滑出，不再边滑边变透明；退出动画停在终点（`forwards`），卸载晚一帧也不会闪回。
- 修复：系统打开「减少动态效果」时，抽屉、底部弹层、手机侧栏、上传面板以前直接出现和消失，现在会淡入淡出。新测试守着「`--motion` 为 0 时每一种进出都是完整的淡入淡出，退出停在终点」。
- gallery「动效」页重做：进出都演示，加「慢放 ×5」和「按减少动效播放」，抽屉和底部弹层也在里面，另有曲线对比。
- 字号和字体真正可以覆盖了：`--text-*`、`--font-sans`、`--font-display`、`--font-mono` 的取值移到 `:root`，覆盖后所有 `text-*` 类跟着变；标题（h1–h4）用 `--font-display`。
- 新 token：叠放四层 `--z-sticky` / `--z-float` / `--z-overlay` / `--z-toast`；焦点 `--focus-width`、`--focus-offset`、`--focus-halo`；`--disabled-opacity`。增强对比度下文本框的焦点光晕也变成实色。没写时长和曲线的过渡默认 `--duration-fast` + `--ease-out`。
- 焦点：从代码打开的弹框、抽屉、确认框（表格行回车、菜单项、`useConfirm`）关闭后焦点回到原处，不再掉到页面上；弹框打开时聚焦第一个输入框而不是 ⓘ；确认按钮执行中保留焦点。新 hook `useReturnFocus`。
- 抽屉翻页：有未保存的修改时按 ↑ / ↓ 不再直接翻走（以前会丢掉修改），点上一条、下一条先问；上面叠着弹框时不翻。
- `DataTable`：编辑、删除后留在当前页（以前每次数据变化都跳回第 1 页）；排序时回到第 1 页并清空勾选；新 prop `resetKey`，搜索和筛选变了就传新值；服务端分页也记住每页条数；行里弹出的菜单、弹框不会误点开这一行；勾选框有了名字（「全选本页」「选择「标题」」）。
- 表单：`Select`、`Combobox`、`RadioGroup`、`SwatchPicker` 传 `value={undefined}` 时显示为空（以前会留着上一次的选择）；`Checkbox`、`Switch` 放在 `Field` 里会用字段标签做名字，并接上说明和错误；字段错误出现时读屏会念出来（`Field`、`DetailList`）；`DetailList` 编辑态的单选组、滑杆有了名字。
- 筛选条：✕ 在触屏上的点击区域到 44，清除后焦点留在筛选条上；两种筛选按钮的弹出层一样宽、最高 320；`Select`、`Combobox` 加 8px 避让边距。
- 触屏：小图标按钮（`icon-sm`，36）的点击区域扩到 44。设置页的分组间距跟着「留白」旋钮走（标准 40）。
- `Tooltip` 不在 `TooltipProvider` 里也不会报错（自带一个）；`Tabs` 的焦点环和下划线不再被裁掉；更新记录弹框关闭时不再闪「还没有更新记录」；`unseenReleases` 遇到不是 SemVer 的版本号返回空。
- 升级时注意：客户端分页、自己过滤 `data` 的表格，把搜索和筛选拼成 `resetKey` 传给 `DataTable`，否则筛选后不会回到第 1 页（只会退到最后一页）。Toast 的层级从 sonner 的 999999999 改成 `--z-toast`（60）：项目里有比 60 更高的自定义层时，调高 `--z-toast`。`TabsList` 的 `className` 只作用在外层，写在上面的 `gap-*`、`justify-*` 不再影响标签。

## 1.8.0 · 2026-11-23

主题工作室、更多配色预设、增强对比度、版面留白和页面布局规范（理由见 `references/decisions.md`「1.8.0」）。默认皮肤的取值不变，已有组件的用法不变。

- gallery 新页「主题工作室」（`#/studio`）：调中性色（预设，或色相 + 浓度）、强调色（预设，或任意颜色）、对比度（柔和 ↔ 高）、圆角（0–16）、密度、留白和字体，整个 gallery 实时换上。每一条对比度检查（浅色、深色、增强对比度）都列出来，不达标的自动挪到刚好达标；导出的皮肤文件放在 `jim-theme.css` 之后就能用，「复制链接」可以原样分享。
- 新预设：中性色 `slate`（冷灰）、`sage`（灰绿）、`mauve`（灰紫），`<html data-theme>`；强调色 `accents.css`：蓝、靛、紫、玫红、青，`<html data-accent>`，可以和任何中性色组合。registry：`@jim/preset-slate`、`@jim/preset-sage`、`@jim/preset-mauve`、`@jim/preset-accents`。
- 增强对比度：系统打开「增强对比度」（`prefers-contrast: more`）时自动生效，`data-contrast="more"` 可以强制。次要文字 ≥ 7:1，元信息 ≥ 5.5:1，控件边框 ≥ 3:1，焦点环 3px；任何皮肤都适用。
- 留白旋钮 `data-spacing="compact|relaxed"` 和 token `--space-page`、`--space-section`、`--space-field`、`--space-card`；`Page`、`Section`、`FieldGroup` 改用它们，默认值和原来一样。
- 新组件：`Slider`（读数在右，方向键可调）、`SwatchPicker`（从固定的一组颜色里选，`categoricalOptions()` 给九种分类色）、`Stat` / `StatGrid`（仪表盘指标）、`Card` / `CardGrid`（卡片和自动列数的卡片网格）、`PageColumns`（主栏 + 320 的侧栏）。`strings.ts` 新增 `colorName`。
- 新规范 `patterns/page-layouts.md`：概览、列表、对象详情页、列表-详情分栏、主栏 + 侧栏、设置、分步表单、空页与结果页、单卡片页、编辑器、看板、卡片网格，各自的宽度、间距和组件，以及滚动和吸顶的规则。gallery 新页「页面布局」有每种的线框图。
- 守卫：对比度规则抽成 `guards/contrast-lib.ts`（工作室用同一份）；现在检查每个中性色预设 × 每个强调色预设 × 浅色 / 深色 × 增强对比度。缺了某个 token 也算失败。
- 细节：字体改用带光学尺寸轴的 Inter（`@fontsource-variable/inter/opsz.css`），大字和数字更精致，中文不受影响；标题 `text-wrap: balance`、段落 `pretty`；触屏不再有灰色点击高亮。
- 修复：`PageHeader` 的操作多时，手机上标题不再被挤得看不见（操作换到下一行）。
- `Page` 的 `narrow` / `wide` 改成在主区域里居中（以前靠左，窗口宽时右边空出一大块）；`full` 不变。
- gallery：左下角「主题与旋钮」和工作室共用一份设置（旧设置自动迁移），可以切中性色、强调色预设；表单页加滑杆和色块示例，颜色页加预设说明。gallery 有了 logo：文字标「jim-uiux」，连字符画成打开的开关；小写 j（点是圆角方块）做 favicon 和应用图标。
- 升级时注意：要光学尺寸，把入口的 `import "@fontsource-variable/inter"` 换成 `import "@fontsource-variable/inter/opsz.css"`（不换也能用）。重新装 `@jim/guards` 后，对比度测试会多出增强对比度一档；项目皮肤的正文色太浅时会在这里失败。页面不再靠左：窄页、宽页在宽窗口里会居中，自己在 `Page` 外面套了 `mx-auto` 或左对齐假设的地方可以删掉。

## 1.7.0 · 2026-11-23

版本更新的整套说法：有新版本时怎么提示，更新以后怎么说改了什么，更新内容怎么写，CI 怎么从提交起草（理由见 `references/decisions.md`「1.7.0」）。已有组件的用法不变。

- 新规范 `patterns/updates.md`：什么时候说什么（下载中、等重启、等刷新、更新后第一次打开、设置里）；`CHANGELOG.md` 的模板（注意 / 新增 / 改进 / 修复）和写法；从提交到 Release、更新清单、应用里的流程。
- 新组件 `ReleaseNotesDialog`、`ReleaseNotes`，hook `useReleaseNotes`（更新后说一次「已更新到 x · 查看更新内容」）和 `useNewVersionPrompt`（web 部署了新版本：「刷新页面」）。新 lib `changelog.ts`：`parseChangelog`、`unseenReleases`、`compareVersions`，也认 Keep a Changelog 和 release-please 的标题。
- 新 registry 条目 `@jim/release-notes-script`：`scripts/release-notes.mjs`。`draft` 从 Conventional Commits 起草下一节，`notes` 取出一版给 Release 和更新清单（缺了用提交兜底），`check` 在 PR 里核对版本号有没有更新内容。不依赖任何包，不在 `@jim/all` 里。
- `notify.info` 可以带一个动作，带动作时停留 8 秒。
- 修复：Toast 上的动作打开对话框时，对话框不再一打开就关掉（动作执行前，按钮先交出焦点）。
- `strings.ts` 新增 `whatsNew`、`seeWhatsNew`、`updatedTo`、`allReleaseNotes`、`releaseNotesEmpty`、`releaseDate`、`newVersionReady`、`reload`。
- 规范：`feedback.md`、`components.md`、`content.md`、`adoption.md`、`checklist.md` 指向新规范；`SKILL.md` 加一条硬规则。
- gallery：新页「版本更新」；侧栏的版本号打开 jim-uiux 自己的更新内容，部署了新版本时提示刷新。
- CI：PR 检查版本号有没有对应的一节；合进 main 并部署后，新版本自动发 GitHub Release（tag `v1.7.0` 起），说明取自本文件。
- 升级时注意：用 `notify.prompt` 说「已下载 · 重启」的桌面应用（retrace、turnery），重启之后的那一步接上 `useReleaseNotes`。

## 1.6.0 · 2026-11-17

列表详情的新用法：模态抽屉加遮罩，方向键翻页。来自下游项目的反馈，理由见 `references/decisions.md`「1.6.0」。已有组件的用法不变。

- 新 hook `useListPaging`（在 `drawer.tsx`）：抽屉开着时，↑ / ↓（也接受 ← / →、K / J）切到列表的上一条、下一条；焦点在输入框里或按着 ⌘ / Ctrl / Alt 时不响应；抽屉开着时一直按打开那一刻的顺序翻，打开导致的重新排序不会让当前项跳走。
- 新组件 `DrawerPager`：放在 `DrawerHeader actions` 里，显示「3 / 12」和上一条、下一条按钮，提示里带快捷键。
- `strings.ts` 新增 `previousItem`、`nextItem`、`itemPosition`。
- 规范：`patterns/overlays.md` 新增「列表详情：遮罩与翻页」，选择表里把它和 dock inspector 分开；`components.md` 补上两个新 API。
- gallery：弹层页加「列表详情 · 遮罩与翻页」示例（未读排前，翻页时顺序不跳）。

## 1.5.1 · 2026-11-17

- `ResizeHandle`：用鼠标拖完之后，强调色的焦点线不再一直亮着。按下时把手会拿到焦点（好让方向键接着用），浏览器把这种程序给的焦点也算作 focus-visible；现在按下后只留悬停线，第一次按键时焦点线再出来。键盘操作不变。

## 1.5.0 · 2026-11-17

把 kit 里两处私下的实现抽成组件，下游各自写的那几份可以换掉了（理由见 `references/decisions.md`「1.5.0」）。已有组件的用法不变。

- 新组件 `ResizeHandle`：面板边缘的拖动区。拖动，或聚焦后按方向键（每步 16px，Home / End 到最小 / 最大），双击回到 `defaultValue`；`onValueChange` 拖动中调用，`onValueCommit` 完成后调用（在这里存宽度）。
- 新组件 `Progress`：知道总量的进度，`value / max`，带 `role="progressbar"`。
- `Drawer mode="dock"` 的宽度把手改用 `ResizeHandle`：多了双击回到 400、Home / End，按键不再传给页面。
- `UploadQueuePanel` 的进度条改用 `Progress`，读屏现在能读到每个文件的进度。
- 规范：`components.md` 写了两个组件，`patterns/layout.md`、`patterns/feedback.md` 指向它们；`downstream.md` 候选清单删掉这两项。
- gallery：弹层页加「拖动调宽」，反馈页加「进度」。

## 1.4.0 · 2026-11-16

Toast 到右上角；收回下游三个以上项目各写了一份的四个小组件（理由见 `references/decisions.md`「1.4.0」）。`notify` 和已有组件的用法不变。

- 桌面上 Toast 改到右上角；手机仍在顶部、占满宽度。
- 每条 Toast 右上角都有 ✕（之前只有错误和 `prompt` 有），后台进度（`loading`）除外；触屏上点击区 44px。✕ 和通知区的读屏名称改用 kit 文案（「关闭」「通知」），之前是 sonner 的英文。`strings.ts` 新增 `notifications`。
- 修复：错误 Toast 的淡红底之前被 `bg-popover` 盖住，从来没显示过。
- 新组件 `Info`（ⓘ 补充说明）：指上去稍等打开，点一下（触屏点按、键盘回车）固定，触屏上也能用。`PageHeader`、`Field` 的 `info` 改用它，之前是 Tooltip，手机上点不开。
- 新组件 `Kbd`（按键提示），命令面板改用它。
- 新组件 `CopyButton`：按钮自己变成「已复制」，1.5 秒后恢复；失败时「复制失败」；`iconOnly` 用在小地方。`strings.ts` 新增 `copy`、`copied`、`copyFailed`。
- 新组件 `Callout`：info / warning / danger / neutral 四种提示框。`ConfirmDialog` 里的失败原因改用 `Callout tone="danger"`（多了图标，文字改用正文色）。
- `IconButton`：`tooltip` 可以传文字，`tooltipSide` 改方向。
- 规范：`patterns/feedback.md` 写了新位置、✕，以及自己画标题栏的桌面应用怎么用 `offset` 避开标题栏；复制到剪贴板不弹 Toast 成为通用规则。`components.md`、`patterns/overlays.md`、`patterns/one-time-secret.md` 写了四个新组件。
- gallery：按钮页加复制和按键提示，弹层页加 ⓘ 说明，反馈页加提示框。
- 下游：`consumers.json` 里的 arbor 改为 turnery（仓库已改名为 `linjiejim/turnery`）；`downstream.md` 的反哺候选清单按 2026-11-16 的盘点更新。
- 升级时注意：retrace、turnery 的标题栏右侧有按钮，装上新的 `toast.tsx` 后给 `<Toaster>` 传 `offset={{ top: 标题栏高度 + 8, right: 16 }}`。

## 1.3.1 · 2026-11-08

- Drawer dock 的宽度把手：方向键处理不再用逗号表达式，项目里的 oxlint / eslint（`no-unused-expressions`）不再报警告。行为不变。

## 1.3.0 · 2026-11-08

收下游项目验证过的三项（来源和理由见 `references/decisions.md`「1.3.0」）。只加东西，已有默认值不变。

- Toast：`notify.prompt(id, message, action)` 是等用户处理、但不是错误的常驻提示（「新版本已下载 · 重启」），同一个 id 再弹会替换；`notify.loading(message)` 用于用户发起、在别处进行的慢操作，返回 id，结束时 `notify.dismiss(id)`。来自 retrace。
- 新组件 `ContextMenu`（右键菜单），和 DropdownMenu 共用样式（`menuClass`）；两种菜单都有子菜单（`Sub` / `SubTrigger` / `SubContent`）。`dropdownMenuParts` / `contextMenuParts`（类型 `MenuParts`）让一份项列表同时用于 ⋯ 菜单和右键菜单。来自 retrace。
- `PopoverAnchor`：浮层锚到触发按钮以外的地方（画布、3D 视图里的点）。来自 arbor。
- 规范：`components.md`、`patterns/overlays.md`、`patterns/feedback.md`、`patterns/list-crud.md` 写了右键菜单、子菜单、锚点浮层和两种新 Toast 的用法。
- gallery：数据展示页加右键菜单与子菜单，弹层页加锚到一个点的 Popover，反馈页加常驻提示和后台进度。
- 升级 retrace 时注意：它自己的 loading Toast 会把转圈画在 Toast 正中，换成 kit 的 `toast.tsx` 就好了。

## 1.2.0 · 2026-11-08

交互层共用，皮肤开放给项目；记下哪些项目在用，改动能往下推、也能提回来（理由见 `references/decisions.md`「2026-11-08」）。组件和主题的取值没有变。

- 新增 `references/downstream.md`：jim-uiux 管交互层、语义名和默认皮肤，项目管自己的皮肤和领域组件；换皮肤不变的底线；`registry` / `aligned` 两种接入；往下推和往回提的流程；当前的反哺候选清单。
- `tokens.md` 新增「换一整套皮肤」：项目主题文件给语义名赋值，可以桥接原来的 token 名，对比度守卫按项目皮肤算。之前「旋钮以外的值都锁定」只适用于默认皮肤。
- 新增 `consumers.json`：retrace、arbor（`registry`），greenhouse、ivan（`aligned`）。私有项目写进不提交的 `consumers.local.json`。
- 新增 `pnpm --dir gallery consumers`：逐个比对项目和这里的差异，汇总反哺候选；`--affected <ref>` 列出一次改动要同步哪些项目；`--discover` 找没登记的仓库。
- `SKILL.md`、`adoption.md`：接入时登记；改完系统后按名单往下推；`docs/DESIGN.md` 模板加「皮肤」。

## 1.1.0 · 2026-11-06

吸收 Greenhouse 4.2 里验证过的模式（理由见 `references/decisions.md`「2026-11-06」）。只加东西，已有默认值不变。

- Drawer 新增 `mode="dock"`：工作台的 inspector，不模态、没有遮罩；视口 ≥ 1440 停靠成一栏，更窄时浮起；宽 360–520 可拖、按地点记住；`useInspectorStack` 管最多 3 层的对象栈，`DrawerHeader` 新增 `onBack`。
- Dialog 新增 `fixed`：md / lg 高度固定（560 / 640），只有内容区滚动。
- 新组件：`CommandPalette`（⌘K，640×480，距顶部 120）、`FacetFilter` + `useFacetParams`（分面筛选，写进 URL）、`useUploadQueue` + `UploadQueuePanel`（上传队列）。
- 主题新增 9 对分类色 `--cat-*` / `--cat-*-subtle`（浅色、深色各一套），新增 `lib/categorical.ts`（`catClass`、`categoricalFor`、`CHART_SERIES`）；对比度守卫自动覆盖主题里声明的每个分类色。
- 规范：`layout.md` 加「工作台外壳」；`overlays.md` 加 inspector、固定尺寸弹框、命令面板和「嵌入页（iframe）」；`feedback.md` 加无限滚动（信息流和媒体网格）、上传队列和原生端的 Alert 例外；`filters.md` 加分面筛选；`tokens.md` 加分类色和应用内文字大小；`adoption.md` 写明原生端规则。
- 新模式：入口页、一次性密钥、批注侧栏。
- `decisions.md` 解决两个待定项（原生字号和按钮、命令面板、文件上传、图表配色），并更正已经不存在的 Greenhouse 出处（v1 / v2 web、CrudDetail）。
- gallery：新增「工作台外壳」「分面筛选与媒体网格」两页，弹层页加固定尺寸弹框、inspector 和命令面板，反馈页加上传队列，颜色页加分类色；整站可以用 ⌘K 跳转。

## 1.0.0 · 2026-11-05

- 开源：独立仓库 `linjiejim/jim-uiux`（MIT），站点和 registry 改由 GitHub Pages 托管，地址不变，仍是 `https://design.linjiejim.com/r/{name}.json`。
- 移除品牌专用预设，只留默认和暖灰（破坏性改动，所以升主版本号）。品牌色写在项目自己的主题里。
- 新增 `/version.json`，gallery 侧栏显示版本号。

## 0.3.0 · 2026-11-05

- `SettingsSection` 新增 `variant="grouped"`（和可选 `icon`）：设置放在弹框里时，每组是带小标题的卡片，分组一眼可见。设置页默认样式不变。规范见 `references/patterns/settings.md`「设置弹框」。
- 守卫：裸色值检查跳过纯注释行，`(#123)` 这类 issue / PR 号不再被当成颜色。

## 0.2.0 · 2026-11-01

- Toast 改到顶部居中、叠放（手机上在顶部，避开安全区）；浮层底，级别用图标颜色区分，错误加淡红底；新增 `notify.info`、`notify.warning`。
- 列表对象的查看、编辑、新建合并到同一个抽屉：`DetailList` 新增 `editing`，原位编辑，位置不变。
- 侧栏收起后，导航项悬停显示标签名。
- 新增 RadioGroup。
- registry 上线：`https://design.linjiejim.com/r/{name}.json`。

版本号同 `gallery/package.json`。破坏性改动（token 改名、组件 API 变化）升主版本号。

## 0.1.0 · 2026-11-01

初版，包含第一期和第二期。

- 原则、token（浅色 / 深色、3 个预设、4 个旋钮）、文案规范。
- 组件（shadcn registry `@jim/*`）：Button、IconButton、Field、Input、Textarea、Select、Combobox、Checkbox、Switch、Dialog、Drawer、BottomSheet、ConfirmDialog / useConfirm、Popover、DropdownMenu、Tooltip、Tabs、Segmented、Badge、StatusDot、Skeleton、Spinner、StateView、Toast（notify）、DataTable、Page / PageHeader / Section、FilterBar、SettingsSection / SettingRow / SaveBar、AppShell。
- 交互模式：弹层、反馈与状态、表单、列表与 CRUD、列表筛选、设置页、布局。
- 守卫：裸色值、字号下限、原生弹框和手写遮罩、emoji 图标，以及每个主题范围的 WCAG 对比度矩阵。
- gallery：基础、组件、模式三部分，可以实时切换主题旋钮。
