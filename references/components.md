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
| 工作台里的详情栏（主区保持可点） | `Drawer mode="dock"` + `useInspectorStack` |
| 列表里一条一条看（带遮罩，↑ / ↓ 翻页） | `Drawer` + `useListPaging` + `DrawerPager` |
| 全局搜索、跳转、命令 | `CommandPalette` + `useCommandPalette`（⌘K） |
| 不可逆操作前的确认 | `ConfirmDialog` / `useConfirm` |
| 触屏上的选项和操作 | `BottomSheet` |
| 挂在触发点上的小面板 | `Popover`；锚到画布、3D 视图里的一个点时加 `PopoverAnchor` |
| 一组命令 | `DropdownMenu`；一组同类选项放进一层子菜单 |
| 右键菜单（⋯ 菜单的快捷方式） | `ContextMenu`，项和 ⋯ 菜单共用（`MenuParts`） |
| 一条短提示 | `Tooltip`（只放补充信息） |
| 标题、字段、指标的补充说明（口径、注意事项） | `Info`（ⓘ，悬停或点按打开） |
| 要一直留在页面上的提示（只显示一次的值、缺少的配置、框里操作失败的原因） | `Callout` |
| 复制一个值 | `CopyButton`（按钮自己说「已复制」） |
| 快捷键提示 | `Kbd` |
| 操作结果、撤销、后台错误、后台进度、等你处理的提示 | `notify` + `Toaster` |
| 更新后说改了什么；web 部署了新版本 | `useReleaseNotes` + `ReleaseNotesDialog`；`useNewVersionPrompt` |
| 状态标签 | `Badge`；表格里更紧凑的写法用 `StatusDot` |
| 空、无匹配、无权限、出错 | `StateView` |
| 加载中的占位 | `Skeleton`（静态）；短操作用 `Spinner` |
| 知道总量的进度（上传、导出、批处理） | `Progress`；不知道总量用 `Spinner` |
| 拖动调整面板的宽或高 | `ResizeHandle` |
| 数据表格 | `DataTable` |
| 页面骨架 | `Page`、`PageHeader`、`Section` |
| 列表筛选 | `FilterBar`、`SearchInput`、`FilterSelect`、`FilterBoolean` |
| 多个维度一起筛、多选 | `FacetFilter` + `useFacetParams` |
| 多个文件上传 | `useUploadQueue` + `UploadQueuePanel` |
| 用户选的颜色、图表系列 | `lib/categorical.ts`：`catClass`、`categoricalFor`、`CHART_SERIES` |
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
- `IconButton` 的 `label` 既是读屏名称，也是悬停提示。要说得比名称多（「导出为 CSV（当前筛选结果）」）时给 `tooltip` 传文字，`tooltipSide` 改方向；不要提示时传 `tooltip={false}`。一个按钮只有一层提示，不要再包一层 Tooltip。
- `CopyButton`：点了以后按钮自己变成「已复制」（失败时「复制失败」），1.5 秒后恢复，不弹 Toast。默认 `secondary` + `sm`；地方小（代码块角上、提交号旁边）用 `iconOnly`，文字放进悬停提示和读屏名称。
- `Kbd`：按键提示，高 20，12px，浅底细边框。放在快捷键能用的地方（菜单项、命令面板、按钮旁），触屏上不显示。

## Field / Input / Textarea

- 标签在上方（13px，字重 500）。必填项在标签后加红色 `*`。
- 字段下方有一行：有错误时显示错误（红色加图标），没有错误时显示简短说明（12px）。更长的解释放进 `info`，显示为 ⓘ（`Info`）。
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
- `fixed`：md、lg 的高度固定（560、640，≤ 85dvh；手机 92dvh），只有 `DialogBody` 滚动。弹框里会切换标签、筛选列表、分步填写时用，框不会随内容跳。

## Drawer

- 从右侧滑出。宽度：`sm` 400（筛选、小设置）、`md` 560（详情，默认）、`lg` min(60vw, 960)。手机上全宽。
- 头部：标题、一行元信息、≤ 2 个图标按钮、✕。
- 内容用 `DetailList`：标签用次要文字色，值保持全对比、可以选中。给每项传 `edit`（控件），`editing` 为真时原位变成可编辑：行高和文字起点不变；`error`、`required` 跟 Field 一样。查看、编辑、新建共用这一套布局。
- 一次只开一个抽屉（同时开两个会在控制台警告）。抽屉上面可以再开 ConfirmDialog。
- 打开时聚焦面板本身，不聚焦第一个按钮，避免一打开就弹出按钮的悬停提示；标了 `autoFocus` 的输入框（编辑、新建）保留焦点。
- `mode="dock"`：工作台的 inspector。不模态、没有遮罩；把 `<Drawer mode="dock">` 放在主区所在的 flex 行最后。
  - 视口 ≥ 1440（`DOCK_MIN`）停靠成一栏：主区让出宽度，点主区不关闭，打开时不抢焦点。更窄时浮起，点外面关闭。手机上全宽。
  - 宽 360–520，默认 400（`INSPECTOR_WIDTH`）；拖左边缘（`ResizeHandle`）或聚焦后按 ← → 调整，双击回到 400，按 `DrawerContent storageKey` 记住（一个地点一个 key）。
  - `useInspectorStack()`：`show` 从主区打开（新的一叠），`push` 从 inspector 里打开关联对象（最多 3 层，再多替换最上层），`back`、`close`。`DrawerHeader onBack` 显示「返回」。提升到主区 = 调用方导航后 `close()`。
  - Esc 只关最上层；inspector 上面可以开 Dialog、ConfirmDialog。
- 列表详情翻页（规则见 `patterns/overlays.md`「列表详情」）：
  - `useListPaging({ items, current, onChange })`：`items` 是屏幕顺序的 id 列表，`current` 是打开的 id。抽屉开着时绑定 ↑ / ↓、← / →、K / J；焦点在输入框里或按着 ⌘ / Ctrl / Alt 时不响应。抽屉开着时一直按打开那一刻的顺序翻（哪怕打开导致重新排序、当前项挪走或掉出列表），关掉后才用新顺序。返回 `index`、`total`、`hasPrev`、`hasNext`、`goPrev`、`goNext`。
  - `DrawerPager`：放进 `DrawerHeader actions`，把 `useListPaging` 的返回值整个传进去。显示「3 / 12」和上一条、下一条按钮，提示里写着快捷键；列表不到两项时不显示。文案在 `strings.ts`（`previousItem`、`nextItem`、`itemPosition`）。

## CommandPalette

- ⌘K（Ctrl+K）打开：`const [open, setOpen] = useCommandPalette()`，整个应用只绑一次。
- 640×480，距顶部 120，框固定、列表滚动；手机全宽、贴顶、≤ 60dvh。底部一行键盘提示（手机上隐藏）。
- 内容用 `CommandGroup heading` 分组，`CommandItem` 带 `icon`、`hint`、`shortcut`、`keywords`（拼音、同义词）。选中后先关闭再执行 `onSelect`。
- 没有结果时显示「没有匹配的结果」。只做搜索和跳转，不在里面放表单。

## FacetFilter

见 `patterns/filters.md`「分面筛选」。

- `facets`：`{ key, label, kind: "single" | "multi", options }` 或 `{ key, label, kind: "boolean", yes?, no? }`。
- 值是 `Record<key, string[]>`，布尔分面存 `["1"]` / `["0"]`；`facetCount(value)` 数已生效的分面。
- `max`（默认 4）：超过时前 `max − 1` 个留在栏上，其余进「筛选」Popover。
- `useFacetParams(facets, { mode: "search" | "hash" })` 把值同步到 URL；服务端渲染时视为未设置，客户端再读 URL（Next 可用）。`facetsFromParams` 是纯函数版本。

## UploadQueue

见 `patterns/feedback.md`「上传队列」。

- `useUploadQueue({ run, concurrency = 3 })` 返回 `{ items, active, add, retry, clearFinished }`。
- `run(file, report)`：调用 `report(0–1)` 报告真实进度；返回 `"added"` 或 `"exists"`；失败时抛出带人话的 `Error`，不可能成功的文件抛 `UploadRejected`（不显示「重试」）。
- `<UploadQueuePanel queue={queue} />` 渲染右下角的面板，自己处理折叠、自动收起和离开页面前的确认。
- `run` 同步抛错也一样记为失败并让出名额。不用 React 时（或写测试）用 `createUploadQueue(config, onChange)`。

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

## Popover / DropdownMenu / ContextMenu / Tooltip

- `Popover` 默认宽 288，内边距 12，阴影用 `shadow-popover`。
  - 要出现在触发按钮以外的地方（画布、3D 视图里的一个点，文字里的一个词）：加 `PopoverAnchor`，`virtualRef` 传一个带 `getBoundingClientRect` 的对象。点换了就传新对象，Radix 才会重新定位。打开它的东西仍要有键盘入口。
- `DropdownMenu`：
  - ≤ 7 项，用分隔线分组。常用的在上，危险项在最后，用 `tone="danger"`。
  - 每项高度用 `--control-md`；图标 16px，用次要文字色。
  - 子菜单（`DropdownMenuSub` / `SubTrigger` / `SubContent`）只开一层，放一组同类选项（移到哪个项目、按什么排序）；再多就用 Combobox 或弹框。子菜单的第一项和打开它的那一行对齐；键盘 → 打开、← 收起。
- `ContextMenu`：右键菜单，和 DropdownMenu 共用样式（`menuClass`），也有子菜单。
  - 只是快捷方式：同一组项、同样顺序也在 ⋯ 菜单里，因为触屏要长按才出来，键盘用户只能靠 ⋯。项只写一次，函数接受 `MenuParts`，分别传 `dropdownMenuParts` 和 `contextMenuParts`。
  - 用在桌面工具和密集列表里。菜单开着时，被右键的行保持高亮（`data-[state=open]:bg-accent`）。
- `Tooltip`：延迟 500ms，反色，12px。只放补充信息；触屏上不保证能看到，所以不能放唯一的说明。
- `Info`：ⓘ 按钮（20px，触屏点击区 44px）加一个 Popover，放标题、字段、指标的补充说明。鼠标指上去 90ms 后打开，移开 180ms 后关闭，中间可以移进面板；点一下（触屏点按、键盘回车）固定住，点别处或 Esc 关闭。只放文字，不放操作，焦点留在 ⓘ 上。`PageHeader`、`Field` 的 `info` 用的就是它。

## Tabs / Segmented

- `Tabs`：切换页面的不同部分，下划线样式，高度用 `--control-lg`。
- `Segmented`：在 2–4 个视图之间切换，始终有一个选中，不能取消。

## Badge / StatusDot

- `Badge` 高 20，12px，字重 500。色调：neutral、success、warning、danger、info、outline。
- 每个项目定一套固定的状态词表，并固定颜色映射：进行中 = info，已完成 = success，需处理 = warning，失败 = danger，草稿或已归档 = neutral。
- `StatusDot`：圆点加文字，用在表格和列表里，比徽章更安静。

## Callout

- 要一直留在页面上、直到原因消失的提示：只显示一次的值（`warning`）、缺少的配置、确认框或弹框里操作失败的原因（`danger`）。
- 色调：`info`、`warning`、`danger`、`neutral`。淡底加同色调的图标，文字用正文色；图标和文字一起说明级别，颜色不是唯一的信号。
- 图标加一两句话，最多一个操作（`action`，放在末尾，用 `sm` 按钮）。`icon` 可以换掉默认图标。
- `danger` 带 `role="alert"`，出现时读屏会念出来。
- 不用于：操作结果（Toast）、区块加载失败（`StateView`）、字段错误（`Field`）、补充说明（`Info`）。

## StateView / Skeleton / Spinner

- `StateView kind="empty | no-match | no-permission | error"`：一个图标、一句标题、最多一行说明、最多一个操作。尺寸 `sm` 用在面板和表格里，`md` 用在页面区块里。
  - `error` 传 `onRetry` 时自动带「重试」按钮。
  - `no-match` 传 `onClearFilters` 时自动带「清除筛选」按钮。
- `Skeleton`：静态的灰块，形状接近即将出现的内容，不闪光、不脉冲。配合 `useDelayedFlag` 使用：300ms 后才出现，出现后至少保留 600ms。
- `Spinner`：只用于短等待（按钮里、字段旁），或者不知道总量的进度。
- `Progress`：真实的、知道总量的进度。高 4，圆角，强调色。`value` / `max`（默认 100；分数传 `max={1}`，条数传总数）。要有名字：`aria-label`，或用 `aria-labelledby` 指向旁边的文字；数字也用文字写出来（「312 / 1,204」「上传中 40%」）。不画按时间走的假进度。

## ResizeHandle

- 面板边缘上的拖动区，用来调整停靠栏、侧栏、分栏的宽或高。`side` 是它所在的那条边（右侧面板的把手在 `left`），面板要 `position: relative`。
- 8px 宽的拖动区，骑在边线上；悬停时显示一条 2px 的 `input` 色细线，键盘聚焦和拖动时用强调色（`ring`）。用鼠标按下拿到的焦点不亮焦点线，第一次按键才亮。拖动时整页保持调整光标，不选中文字。
- 键盘：聚焦后按方向键调整（每步 16px），Home / End 到最小 / 最大；方向键不会再传给页面（列表的上下键导航不受影响）。双击回到 `defaultValue`（给了才有）。
- `onValueChange` 在拖动过程中调用，只改界面；`onValueCommit` 在松手、按键、双击后各调一次，在这里存宽度（按地点记住）。
- `role="separator"`，带 `aria-valuenow / min / max`；名字默认「调整宽度」，一页有几个时用 `label` 区分。
- 手机上面板通常全宽，把手跟着隐藏（`className="max-sm:hidden"`）。

## Toast（notify）

见 `patterns/feedback.md`。只通过 `notify` 调用，不直接用 sonner 的 `toast()`。`notify.info(message, { action })` 带动作时停留 8 秒。

## ReleaseNotes / useReleaseNotes / useNewVersionPrompt

见 `patterns/updates.md`。更新内容来自应用自己的 `CHANGELOG.md`，构建时打进包里，用 `parseChangelog`（`lib/changelog.ts`）读。

- `useReleaseNotes({ version, releases })`：版本号比上次记下的新、而且这几版写了更新内容时，弹一次「已更新到 x · 查看更新内容」（`notify.info` 带动作，8s）。首次安装只记版本号，不提示；`version` 可以晚到（Tauri 的 `getVersion()`）。返回 `dialog`（交给 `ReleaseNotesDialog`）和 `openAll()`（设置里的「查看更新内容」）。
- `ReleaseNotesDialog`：md 尺寸，每版一节，新的在前；「注意」一组放在 `Callout tone="warning"` 里。`moreHref` 或 `onMore` 在底部加「全部更新记录」。只从 Toast 或设置里打开，不自己弹出来。
- `ReleaseNotes`：只有列表，放在关于页、设置页里。
- `useNewVersionPrompt({ current })`：web 应用把构建时的提交号和 `/version.json` 里的比较（标签页回到前台时最多一分钟一次，另外每 10 分钟一次），不一样就留一条「新版本已发布，刷新后生效 · 刷新页面」。不自动刷新；刷新前要存的东西放进 `onReload`。

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
