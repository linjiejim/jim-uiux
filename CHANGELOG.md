# Changelog

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
