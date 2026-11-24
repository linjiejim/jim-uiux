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
| 表单里选多个（标签、成员），选项多或要搜索 | `Combobox multiple` |
| 改一个看得见的名字（列表项、标题、标签页） | `InlineRename` |
| 2–4 个视图之间切换 | `Segmented` |
| 范围里的一个数值，手感比精确数字重要（圆角、音量、阈值） | `Slider` |
| 从固定的一组颜色里选一个（标签色、项目色、主题预设） | `SwatchPicker`；分类色用 `categoricalOptions()` |
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
| 页面骨架 | `Page`、`PageHeader`、`Section`；主栏 + 侧栏用 `PageColumns`。选哪种骨架见 `patterns/page-layouts.md` |
| 要自己边界的一组内容（图表、网格里的一项、登录卡片） | `Card`；自动列数的一排卡片用 `CardGrid` |
| 仪表盘上单独成立的数字 | `Stat` + `StatGrid` |
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
- 传了 `value` 就是受控，传 `undefined` 也算：显示占位文字，不会留着上一次选的值。`RadioGroup`、`SwatchPicker` 一样。
- 弹出层和选择器保持 8px 的避让边距（`collisionPadding`），最高 320。

### 多选（`Combobox multiple`）

- 值是 `string[]`；`onValueChange(value, options)` 的第二个参数是选中项本身，带标签（搜索、新建得来的也有）。
- 已选的项是标签，只占一行，放不下时收成「+N」（同 Ant `maxTagCount="responsive"`），框高不变。标签 24 高，最宽 160，超出截断；✕ 触屏点击区 44，不进 Tab 顺序（键盘在列表里取消勾选，或按 Backspace）。读屏从触发器上读到全部已选项。
- 菜单开着可以连续选，勾选不关菜单；勾选时顺序不动，下次打开时已选的排在最前（同 Carbon `top-after-reopen`）。
- 键盘：触发器上 Enter、空格、↓ 打开；搜索框里 ↑ ↓ 移动，Home / End 到头尾，Enter 勾选或取消，Esc 关闭并回到触发器；搜索框为空时 Backspace 删掉最后一个。输入法选字时的 Enter、Esc 不算。
- `onSearch(query)`：从服务器搜，停顿 250ms 再查，打开时先查一次空字符串。旧结果留着（变淡），300ms 后才转圈；还没有结果时不显示「没有匹配的选项」。失败显示「搜索失败」+「重试」，不留上一次的结果。这时 `options` 只用来给已选的值配标签。
- `onCreate(label)`：输入的名字和哪项都不一样时，列表末尾多一项「创建「…」」；返回新选项，自动勾上。失败时列表里说「创建失败」。
- 放在 `Field` 里时，字段标签就是它和列表的名字；说明、错误照常接上。不在 `Field` 里时传 `aria-label`。
- 筛选栏里的多选用 `FacetFilter`，不用它。

## InlineRename

原位改名：名字就在眼前时（侧栏的分组、文件名、页面标题、标签页），点它就地改，不开弹框。

- 点文字、或聚焦后按 Enter / F2，原处变成输入框：和文字同一个框、同样字号（继承外面的），不跳。宽度跟着输入长，最宽到容器。打开时全选。
- 文字和周围的文字对齐（同一列的其他行、表头、标题所在的位置），框（内边距加边框，左右各 7px）向外伸，像 Finder 里改文件名。焦点环和输入框的光晕都画在框里面，所以只有框要占地方。外面的容器会裁切时（`truncate`、`overflow-hidden`）要留出这点地方，否则悬停底色、输入框的边框会被切掉：`DataTable` 的单元格已经留了，自己的容器写 `-mx-2 px-2`（文字位置不变）。紧挨着图标时间距至少 8px（`gap-2`），不然框会压到图标。实在留不出时传 `className="mx-0 max-w-full"`，框收进容器，文字右移 7px。
- Enter 或点别处保存，Esc 还原。输入法选字时的 Enter、Esc 不算（`isComposing` 或 keyCode 229）。Esc 只取消改名，不会顺带关掉外面的抽屉、弹框。切到别的窗口不算离开。
- 保存前去掉首尾空格；没改就直接退出。空的提示「请输入名称」，`validate` 返回的文字（「已有同名文件，换一个名字」）显示在输入框下方，继续编辑。
- `onSave` 可以是异步：输入框保持、只读，右端转圈；失败时输入框留着，显示错误的 `message`（写给人看的），没有就是「重命名失败，请重试」。成功后焦点回到文字上（用户已经点到别处时不抢）。
- 放在可点击的行里（`DataTable` 的 `onRowClick`）：点名字是改名，点行的其他地方才打开；名字上的点击、按键不会传给行。行的点击就是打开、名字不该响应点击时，传 `editOnClick={false}`。
- 从 ⋯ 菜单的「重命名」（F2）开始：受控的 `editing` + `onEditingChange`。菜单关闭时会把焦点还给 ⋯，输入框等它还完再拿焦点，不会一开就被关掉。
- `aria-label` 必填，是输入框的名字（「文件名」）。文字是按钮，名字就是它显示的内容，说明是「按 Enter 重命名」。
- 不用于：要同时改几个字段（用抽屉原位编辑）；名字不在眼前、或改名有后果要说明（用 Dialog）。

## RadioGroup

- 竖排，单选圆点 16px，触屏上点击区域扩到 44px；每个选项可以带一行说明。
- 放在 `Field` 里时，自动用字段标签作为组名。

## Checkbox / Switch

- `Checkbox` 16px。触屏上点击区域扩到 44px。支持 `"indeterminate"`（半选）。
- `Switch` 36×20，立即生效。如果改动要等点「保存」才生效，就不能用开关，改用复选框。
- 放在 `Field` 里时，字段标签就是它的名字，说明和错误也会接上（`aria-describedby`、`aria-invalid`）。

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
- `onConfirm` 可以是异步函数：执行中按钮转圈、「取消」禁用；确认按钮保持焦点（`aria-disabled`，重复点击无效）；失败时弹框不关，把原因显示在弹框里。
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
  - 在应用根部放一个 `TooltipProvider`，图标按钮之间移动时下一个提示立即出现。没有 provider 的地方 Tooltip 自带一个，不会报错。
- `Info`：ⓘ 按钮（20px，触屏点击区 44px）加一个 Popover，放标题、字段、指标的补充说明。鼠标指上去 90ms 后打开，移开 180ms 后关闭，中间可以移进面板；点一下（触屏点按、键盘回车）固定住，点别处或 Esc 关闭。只放文字，不放操作，焦点留在 ⓘ 上。`PageHeader`、`Field` 的 `info` 用的就是它。

## Tabs / Segmented

- `Tabs`：切换页面的不同部分，下划线样式，高度用 `--control-lg`。`TabsList` 自己横向滚动，焦点环和下划线不被裁掉；它的 `className` 只管外层（边距），不管标签之间的间距。
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

翻页和勾选：

- 改了数据（编辑、删除）留在当前页；整页删空时退回上一页。
- 点表头排序时，回到第 1 页并清空勾选，表格自己处理。
- 搜索、筛选在表格外面，表格看不出「问题变了」：把它们拼成 `resetKey` 传进来（如 `[q, status].join("|")`），一变就回到第 1 页并清空勾选。服务端分页可以在自己的状态里做同样的事。
- `pageSizeKey` 记住每页条数，客户端和服务端分页都生效。
- 勾选框有名字：表头是「全选本页」，每行是「选择「标题」」，标题取 `mobile: "title"` 那一列。

## Slider

- 一个范围里的数值，手感比精确数字更重要时用：圆角、音量、透明度、阈值。精确数字重要时，旁边再放一个 `Input`。
- 轨道 4，填充是强调色；滑块 16（触屏 20，点击区 44），白底细边框加 `shadow-popover`；高度占 `--control-md`。
- `format` 决定右侧的读数，也是读屏念的值（`aria-valuetext`）：写上单位（「8px」「40%」），端点可以换成词（「静音」）。
- 键盘：← → 一步，PageUp / PageDown 十步，Home / End 到两端。
- `onValueChange` 在拖动中调用，只改界面；要存的值在 `onValueCommit`（松手、按键后）里存。
- 放在 `Field` 里时，字段标签就是它的名字；否则传 `aria-label`。

## SwatchPicker

- 从固定的一组颜色里选一个：标签和项目的颜色（九种分类色，`categoricalOptions()`，存名字）、主题预设。不给用户数据提供任意取色。
- 色块 24（`sm` 20），之间 10（`sm` 8，触屏 12），点击区 44；每个色块有一圈 1px 的描边，白色和接近画布的颜色也看得出边界。
- 选中的色块外面加一圈 2px 的正文色环：选中不只靠颜色。每个色块都有名字（悬停提示 + 读屏），名字来自 `strings.ts` 的 `colorName`。
- 基于 RadioGroup：整组只占一个 Tab 位，方向键移动并选中。

## Card / CardGrid

- `Card`：需要自己边界的一组内容。1px 细线、`rounded-lg`、内边距 `--space-card`（16）；不加阴影，不套卡片。`title`（14 / 500）在左，`actions`（≤ 2 个小按钮）在右。
- 页面上的区块不是卡片，用 `Section`。设置分组用 `SettingsSection`。
- `CardGrid`：每列最窄 `min`（默认 240），列数自动；间距 `--space-card`。图片的比例写在图片上（16:9、4:3、1:1），一个网格只用一种。

## Stat / StatGrid

- `Stat`：标签（13，次要文字色）+ ⓘ（统计口径）+ 数值（28，600，等宽数字）+ 一行说明（「较上周 +3」「截至 9:00」）。自带卡片边框。
- 说明那一行 kit 不上色：涨跌用什么颜色归项目（有的市场红色表示涨）。
- 加载时保持高度（`Skeleton`），不显示 0（`feedback.md`「五种数据状态」）。
- `StatGrid`：手机 1 列、sm 起 2 列、xl 起 4 列；只放一行、最多 4 个。

## AppShell / Page

见 `patterns/layout.md`。页面里面怎么排（概览、详情页、分栏、看板……）见 `patterns/page-layouts.md`。

- `PageColumns`：主栏 + 320 的侧栏，侧栏吸顶。分不分栏看它自己的宽度（container query），不看窗口：≥ 896 才分两栏，主栏至少留 544（宽松留白时 528），侧栏、rail 占掉多少都一样；更窄时侧栏落到主栏下面。`asideLabel` 给侧栏起名字（读屏用）。

## 字符串

所有内置文案都在 `lib/strings.ts`，默认是中文，也带英文：`configureStrings(en)`。其他语言在启动时传自己的一份（`Strings` 类型保证不缺键）。切换语言后要让界面重新渲染（组件在渲染时读 `s()`）。

## 格式化（lib/format.ts）

按 `content.md`「格式」写，语言跟着 `strings` 的 `locale` 走：

- `formatDate(d, { time })`：今年「10月31日」「10月31日 09:00」，跨年「2025年10月31日」（不带时间）；英文 "Oct 31" / "Oct 31, 2025"。
- `formatRelative(d)`：只用在动态流里：「刚刚」「3 分钟前」「2 小时前」「昨天 09:00」，再早就是日期。悬停写完整时间：`title={formatDate(d, { time: true })}`。
- `formatMoney(n, currency = "CNY")`：「¥128,000」，整数不带小数，其余两位。
- `formatNumber`（千分位）、`formatPercent(0.85)` →「85%」、`formatBytes` →「820 KB」「1.4 MB」、`formatTime` →「09:00」。
- 无效输入返回空字符串，不抛错。数量的单位写在句子里：`s().totalCount(n)`。
