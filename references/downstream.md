# 下游项目

jim-uiux 被几个项目用着。本文说清四件事：jim-uiux 管什么、项目自己管什么；名单怎么记；上游改了怎么往下推；项目里的好做法怎么提回来。

## 分工：交互层共用，皮肤各管各的

| 层 | 内容 | 谁管 |
| --- | --- | --- |
| 交互层 | 组件的行为和无障碍（焦点、Esc、层叠、键盘、触屏）；交互模式（`patterns/`）；反馈和五种数据状态；文案规则 | jim-uiux。项目不改；有更好的做法就提回来 |
| 语义名 | `tokens.md` 里的 token 名和含义（`background`、`primary`、`destructive`、`selected`……）。组件只认这些名字 | jim-uiux。项目可以加自己的名字（车道色、3D 场景色、涨跌色），不改已有名字的含义 |
| 皮肤 | 名字背后的值：中性色、强调色、字体、圆角刻度、阴影、动效时长和曲线、密度，以及图标库、品牌、插画 | 项目。jim-uiux 的黑白是默认皮肤；换法见 `tokens.md`「换一整套皮肤」 |
| 领域 | 只有这个项目用得上的组件和 token（提交图、3D 视口、净值图、证据卡） | 项目 |

换了皮肤，下面这些照旧：

- 底线：正文对比度 ≥ 4.5:1，大字和图标 ≥ 3:1，浅色、深色都要过；文字 ≥ 12px；触屏点击区 ≥ 44px；颜色不是唯一的信号；减少动态效果时只留淡入淡出。
- 语义：一个强调色；红色表示危险或失败，黄色表示需要你处理，绿色表示成功。领域里颜色另有含义时（A 股的「涨红跌绿」），在项目 `DESIGN.md` 写明报错改用哪个颜色。
- 组件里只用语义 token，不写裸值。

做不到底线的地方（比如页脚的 11px 细注）记进项目 `DESIGN.md` 的例外，写清原因。

## 两种接入方式（`mode`）

- `registry`：从 `@jim` 装组件，交互层直接共用。皮肤可以用默认的、调旋钮，也可以整套换。上游改了组件，重新装就能拿到。
- `aligned`：不装组件，按交互层的规范自己实现。适合 React Native 和原生端，也适合已经有一整套成熟组件、暂时不迁移的项目。上游改了规范，要在项目自己的组件里移植。

`aligned` 可以逐步变成 `registry`：

1. 桥接 token：项目原来的名字留着，再把语义名指过去（`--background: var(--page)`）。greenhouse 的 `packages/ui-tokens` 就是两套名字并存。
2. 按组件逐个换，先换交互最复杂、最容易写错的：Dialog、Popover、DropdownMenu、Select、Tabs。
3. 领域组件留在项目里，只把它们内部用到的浮层、菜单换成 kit 的。

## 名单：`consumers.json`

jim-uiux 仓库根目录的 `consumers.json`，每个项目一条：

| 字段 | 含义 |
| --- | --- |
| `name` | 短名，命令行里用 |
| `repo` | GitHub 的 `owner/name` |
| `site` | 线上地址（可选） |
| `mode` | `registry` 或 `aligned`，见上文 |
| `root` | `components.json` 所在目录，相对仓库根（monorepo 里常是子目录） |
| `design` | 项目的设计文档，相对仓库根。写一句「基于 jim-uiux X.Y.Z」，脚本从这里读版本号 |
| `summary` | 一句话：项目是什么 |
| `follows` | 只给 `aligned` 用：跟的规范，写 `references/` 下的文件名（`content`、`patterns/overlays`……）。`registry` 项目跟全部，不用写 |
| `own` | 项目自己保留、和默认不同的地方（皮肤、领域 token、主要例外），一条一行。细节在项目的设计文档里，这里只是同步时一眼看到哪些不能动 |

- 只登记长期维护的项目，试验性的原型不登记。项目停止维护或换掉设计系统时，删掉它那条。
- 私有项目写进 `consumers.local.json`（格式相同，`.gitignore` 里已排除），脚本一起比对。公开的文档和名单只点名开源项目，和 `decisions.md` 的约定一致。

## 检查

在 jim-uiux 的 `gallery/` 里跑，需要登录好的 `gh`：

```bash
pnpm consumers                          # 每个项目：标的版本、装了哪些文件、哪些和这里不一样；末尾汇总反哺候选
pnpm consumers retrace --diff dialog    # 看一个文件的具体差异：- 是上游，+ 是项目自己的
pnpm consumers retrace --path ~/Code/retrace   # 读本地检出（比如同步分支），不读 GitHub
pnpm consumers --affected <ref>         # 这里相对 <ref> 改了什么、要同步哪些项目（默认对比 origin/main）
pnpm consumers --discover --owner linjiejim    # 找提到 jim-uiux 但还没登记的仓库
```

默认读各仓库 GitHub 上的默认分支，对照的是本地 jim-uiux 源码（包括还没发布的改动）。比较前去掉了 `shadcn add` 会改写的部分（`"use client"`、`@/registry/jim/*` 的导入路径），剩下的差异都是真的：要么项目落后，要么项目改过。`aligned` 项目没法自动比对，脚本只列出它跟的规范和自己保留的部分。

## 往下推：上游改了

1. 改动合进 main 之后，跑 `pnpm consumers --affected <上一次发版的提交>`：列出改了哪些组件和规范、哪些项目要跟、各自为什么。
2. 每个项目单独提一个 PR：`registry` 项目按 `adoption.md`「升级」重新装；`aligned` 项目按 `CHANGELOG.md` 在自己的组件里移植。
3. 项目设计文档里的版本号改成新版本。
4. 不必每次都马上推。破坏性改动（主版本）和修 bug 尽快推；新组件、新模式等项目用得上时再拉。

## 往回提：反哺

候选从这几处来：

- `pnpm consumers` 末尾的「反哺候选」：项目在 kit 上自己加的组件、在 kit 组件里多出来的行。
- `aligned` 项目的设计文档和组件（脚本看不到，要人看）。
- 项目设计文档里写着「应提回 jim-uiux」的例外。

收进来的门槛：至少两个项目要用，或者一个项目验证过、明显通用；不带领域含义；能只用语义 token 写出来。

流程：先在项目里验证 → 按 `SKILL.md`「Changing the system」改 jim-uiux（组件、gallery 示例、规范、`decisions.md` 写来源）→ 发版 → 再往下推，项目里自制的版本换成 kit 的。

### 候选清单（2026-11-16 盘点）

收了或否了就从这里删掉，结论写进 `decisions.md`（1.4.0 收了 `Info`、`Kbd`、`CopyButton`、`Callout` 和 IconButton 的提示文字）。「kit 里已有」指 kit 组件内部已经私下实现了一份，收回来主要是导出、统一规格。

| 候选 | 来源 | 判断 |
| --- | --- | --- |
| 拖动调宽的把手（`ResizeHandle`） | retrace、turnery、ivan 和另一个项目；kit 里已有（Drawer dock） | 各家方向键步长、双击复位、悬停样式不一样，retrace 的不能用键盘。从 Drawer 抽出来，统一一份规格 |
| 真实进度条（`Progress`） | turnery、ivan 和另一个项目（两份）；kit 里已有（`upload-queue.tsx`） | 从上传队列抽出来 |
| 原位改名（`InlineRename`：回车或失焦保存，Esc 还原） | retrace、turnery 和另一个项目 | 三家行为一致，只有 turnery 判断了输入法组字（`isComposing`）。要收就同时改 `overlays.md`「重命名用 Dialog」那一行 |
| Slider（标签 + 滑杆 + 读数，精确数值输入框可选） | turnery `param-slider.tsx` 等、greenhouse `form-controls.web.tsx` | 两个项目都有，补齐规格后收 |
| 页头次要动作在手机上收进「⋯」（`MoreActions`） | ivan | 写进 `patterns/layout.md`，由 PageHeader 支持 |
| `Tag`（描边、无底色的分类元数据） | ivan；greenhouse 的 Chip | 和 Badge 的 `outline` 变体基本重复，倾向只补用法说明 |
| 数字排版（`Stat`：标签、`Info`、数值） | ivan 和另一个项目 | 第二个项目出现了；涨跌配色留给项目 |
| 拖放上传区（`DropZone`，文件夹逐层展开） | greenhouse 和另一个项目 | `feedback.md` 有规则没组件；等上传队列再有项目用时一起收 |
| 分类色选择（基于 RadioGroup 的色块） | greenhouse 和另一个项目 | kit 定了九种分类色，没有选色组件；有一份不能用方向键 |
| 首字母头像（`Avatar`） | greenhouse 和另一个项目 | 优先级低 |
| Drawer 标题区放一组切换（详情 / Copilot） | 一个项目直接用了底层 Title | kit 缺口：导出 `DrawerTitle`，或让 DrawerHeader 能放切换 |
| 菜单里的复制项：项自己显示「已复制」，菜单不关 | 一个项目 | 规范现在是菜单关闭 + 一句 Toast（greenhouse、kit 的 gallery 都这样）；等第二个项目也这么做再议 |
| Callout 放两个操作（「发现未保存的草稿：恢复 / 丢弃」） | 一个项目 | Callout 规定最多一个操作；先观察 |
| 嵌入页：返回键先在嵌入页内部后退；视图状态写进宿主地址 | greenhouse（`useHostBack`、`greenhouse:route`） | 补进 `overlays.md`「嵌入页」两条规则，嵌入页 kit 仍不收 |
| kit 内部的界面图标集中到一处，可以整套换图标库 | ivan（Phosphor）、greenhouse（`ICONS`） | 换皮肤的项目需要，见下文「已知限制」 |
| 桌面高密度档、嵌入页 kit | greenhouse | 已在 `decisions.md`「待定」 |

不收：retrace 的搜索高亮、另一个项目的批量选择条（都只有一个项目）；人员选择器（依赖各项目的接口）。

## 已知限制

- kit 组件内部用到的界面图标（关闭、勾选、箭头、提示级别，约 20 个）直接引 `lucide-react`。换了图标库的项目装上组件后，两套图标会混在一起。在「图标集中到一处」落地之前，先接受，或者记进项目 `DESIGN.md` 的例外。
