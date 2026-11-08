# Changelog

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
