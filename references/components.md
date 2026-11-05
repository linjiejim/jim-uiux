# 组件

源码在 `gallery/src/registry/jim/ui/`，装进项目后在 `@/components/ui/`。每个文件开头的注释写了它的规则，本文是这些规则的汇总。演示在 gallery 对应的页面。

## 选哪个

| 意图 | 组件 |
| --- | --- |
| 触发一个操作 | `Button`；只有图标时用 `IconButton`，必须给 `label` |
| 输入一行或多行文字 | `Field` 里放 `Input` 或 `Textarea` |
| 表单里 2–5 个选项、需要一眼看全 | `RadioGroup` |
| 从 ≤ 8 个选项里选一个 | `Select` |
| 从更多选项里选、或要边打边搜 | `Combobox` |
| 2–4 个视图之间切换 | `Segmented` |
| 页面的不同部分之间切换 | `Tabs` |
| 立即生效的开 / 关 | `Switch` |
| 多选；或者点「保存」才生效的开关 | `Checkbox` |
| 不属于列表对象的短任务 | `Dialog` |
| 看、改、新建列表里的一个对象 | `Drawer` + `DetailList`（原位编辑） |
| 不可逆操作前的确认 | `ConfirmDialog` / `useConfirm` |
| 触屏上的选项和操作 | `BottomSheet` |
| 挂在触发点上的小面板 | `Popover` |
| 一组命令 | `DropdownMenu` |
| 一条短提示 | `Tooltip`（只放补充信息） |
| 操作结果、撤销、后台错误 | `notify` + `Toaster` |
| 状态标签 | `Badge`；表格里更紧凑的写法用 `StatusDot` |
| 空、无匹配、无权限、出错 | `StateView` |
| 加载中的占位 | `Skeleton`（静态）；短操作用 `Spinner` |
| 数据表格 | `DataTable` |
| 页面骨架 | `Page`、`PageHeader`、`Section` |
| 列表筛选 | `FilterBar`、`SearchInput`、`FilterSelect`、`FilterBoolean` |
| 设置页 | `SettingsSection`、`SettingRow`、`SaveBar` |
| 应用外壳 | `AppShell`、`NavGroup`、`NavItem` |

## Button

- 变体：
  - `primary`：每个区域只有一个。
  - `secondary`：默认，白底细边框。
  - `ghost`：工具栏、次要操作。
  - `destructive`：只用于不可逆操作的最后一步。
  - `link`：行内链接。
- 尺寸：`sm` 28、`md` 32、`lg` 40；`icon` 是 32 的正方形，`icon-sm` 是 28。触屏上自动变为 36、44、48。
- `loading`：宽度不变，中间转圈，同时禁用按钮。主按钮禁用时变成中性灰，而不是半透明的强调色。
- 按钮里的图标统一 16px，图标在文字前面。
- 标签写动词加对象，≤ 6 个字。不写「确定」「提交」「OK」。
- `IconButton` 的 `label` 既是读屏名称，也是悬停提示。

## Field / Input / Textarea

- 标签在上方（13px，字重 500）。必填项在标签后加红色 `*`。
- 字段下方有一行：有错误时显示错误（红色加图标），没有错误时显示简短说明（12px）。更长的解释放进 `info`，显示为 ⓘ 和悬停提示。
- `Field` 会自动给里面的控件接上 `id`、`aria-describedby`、`aria-invalid`、`aria-required`。
- 输入框高度用 `--control-md`。聚焦时边框变成强调色，外加一圈 15% 透明度的光环。出错时边框变红。
- 只读：浅灰底，文字保持全对比，可以选中复制。查看模式就用只读。
- 禁用：浅灰底、淡色文字。只在确实不能编辑、并且原因显而易见时才用。
- 占位文字只用来举例，不能代替标签。

## Select / Combobox

- `Select`：≤ 8 个选项。选中项右侧打勾；弹出层最高 320px。
- `Combobox`：选项多于 8 个时用。受控（`value`）、不受控（`defaultValue`）都支持。顶部有搜索框，匹配选项文字、说明和值；没有匹配时显示「没有匹配的选项」。
- 都不提供「全部」选项。需要「不限」时由调用方传 `undefined`；筛选场景用 `FilterSelect`。

## RadioGroup

- 竖排，单选圆点 16px，触屏上点击区域扩到 44px；每个选项可以带一行说明。
- 放在 `Field` 里时，自动用字段标签作为组名。

## Checkbox / Switch

- `Checkbox` 16px。触屏上点击区域扩到 44px。支持 `"indeterminate"`（半选）。
- `Switch` 36×20，立即生效。如果改动要等点「保存」才生效，就不能用开关，改用复选框。

## Dialog

- 尺寸：`sm` 400（短提示）、`md` 480（表单，默认）、`lg` 640（双列或内容较多）、`xl` 工作区 min(90vw, 1200)。
- 最高 85dvh。头部和底部固定，中间内容区滚动。
- 头部：标题（18 / 600），可以有一行说明，右上角有 ✕。
- 底部：按钮靠右，次要按钮在左，主按钮在最右。
- 宽度 < 640 时，弹框从底部升起，顶部圆角 24，按钮平分一行。
- `dirty`：内容改动过的情况下，按 Esc、点遮罩、点 ✕ 或点「取消」都会先问「放弃未保存的修改？」。保存成功后由代码直接关闭，不经过这个确认。
- 打开时聚焦第一个输入框。关闭后焦点回到触发按钮。

## Drawer

- 从右侧滑出。宽度：`sm` 400（筛选、小设置）、`md` 560（详情，默认）、`lg` min(60vw, 960)。手机上全宽。
- 头部：标题、一行元信息、≤ 2 个图标按钮、✕。
- 内容用 `DetailList`：标签用次要文字色，值保持全对比、可以选中。给每项传 `edit`（控件），`editing` 为真时原位变成可编辑：行高和文字起点不变；`error`、`required` 跟 Field 一样。查看、编辑、新建共用这一套布局。
- 一次只开一个抽屉（同时开两个会在控制台警告）。抽屉上面可以再开 ConfirmDialog。
- 打开时聚焦面板本身，不聚焦第一个按钮，避免一打开就弹出按钮的悬停提示；标了 `autoFocus` 的输入框（编辑、新建）保留焦点。

## ConfirmDialog / useConfirm

- 宽 400。标题是一个问题（「删除项目『官网改版』？」），正文一行说后果，确认按钮重复动词（「删除项目」）。
- 默认聚焦「取消」。危险操作用 `tone="danger"`，确认按钮是红色。
- `onConfirm` 可以是异步函数：执行中按钮转圈、「取消」禁用；失败时弹框不关，把原因显示在弹框里。
- 命令式写法：`const ok = await confirm({...})`。注意要把 `element` 渲染出来。

## BottomSheet

- 基于 vaul。拖拽把手 36×5，顶部圆角 24，最高 92dvh，最宽 640（居中）。
- 高度默认跟随内容；列表类内容用 `snapPoints={[0.6, 1]}`。
- 下拉或点遮罩关闭。`dirty` 时禁止拖拽关闭，点关闭会先确认。
- 底部按钮平分一行，并留出安全区。
- 最多叠两层。原生 App 用系统自带的 sheet。

## Popover / DropdownMenu / Tooltip

- `Popover` 默认宽 288，内边距 12，阴影用 `shadow-popover`。
- `DropdownMenu`：
  - ≤ 7 项，用分隔线分组。常用的在上，危险项在最后，用 `tone="danger"`。
  - 每项高度用 `--control-md`；图标 16px，用次要文字色。
- `Tooltip`：延迟 500ms，反色，12px。只放补充信息；触屏上不保证能看到，所以不能放唯一的说明。

## Tabs / Segmented

- `Tabs`：切换页面的不同部分，下划线样式，高度用 `--control-lg`。
- `Segmented`：在 2–4 个视图之间切换，始终有一个选中，不能取消。

## Badge / StatusDot

- `Badge` 高 20，12px，字重 500。色调：neutral、success、warning、danger、info、outline。
- 每个项目定一套固定的状态词表，并固定颜色映射：进行中 = info，已完成 = success，需处理 = warning，失败 = danger，草稿或已归档 = neutral。
- `StatusDot`：圆点加文字，用在表格和列表里，比徽章更安静。

## StateView / Skeleton / Spinner

- `StateView kind="empty | no-match | no-permission | error"`：一个图标、一句标题、最多一行说明、最多一个操作。尺寸 `sm` 用在面板和表格里，`md` 用在页面区块里。
  - `error` 传 `onRetry` 时自动带「重试」按钮。
  - `no-match` 传 `onClearFilters` 时自动带「清除筛选」按钮。
- `Skeleton`：静态的灰块，形状接近即将出现的内容，不闪光、不脉冲。配合 `useDelayedFlag` 使用：300ms 后才出现，出现后至少保留 600ms。
- `Spinner`：只用于短等待（按钮里、字段旁）。

## Toast（notify）

见 `patterns/feedback.md`。只通过 `notify` 调用，不直接用 sonner 的 `toast()`。

## DataTable

见 `patterns/list-crud.md`。`getRowId` 是必填的：勾选、当前行、翻页都靠稳定的 ID，不能用行号。列的 `meta`：

- `align: "right"`：数字列，会自动用等宽数字。
- `hideBelow`：低于这个断点时隐藏该列。
- `pin: "left"`：固定在左侧，只能用于一列。
- `width`：列宽。
- `mobile: "title" | "meta" | "hidden"`：这一列在手机摘要列表里的角色。
- `wrap`：允许换行（很少用）。

## AppShell / Page

见 `patterns/layout.md`。

## 字符串

所有内置文案都在 `lib/strings.ts`，默认是中文。有 i18n 的项目在启动时调用一次 `configureStrings()` 换掉即可。
