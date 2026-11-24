import * as React from "react"
import { ArrowLeft, FileQuestion, MoreHorizontal, Pencil, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHART_SERIES, catVar } from "@/registry/jim/lib/categorical"
import { formatDate } from "@/registry/jim/lib/format"
import { Badge, StatusDot } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { Card, CardGrid } from "@/registry/jim/ui/card"
import { DetailList } from "@/registry/jim/ui/drawer"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Info } from "@/registry/jim/ui/info"
import { Input } from "@/registry/jim/ui/input"
import { PageColumns, PageHeader, Section } from "@/registry/jim/ui/page"
import { Stat, StatGrid } from "@/registry/jim/ui/stat"
import { StateView } from "@/registry/jim/ui/state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { DocPage, Example, Spec } from "../doc"
import { fmtMoney, projects, statusMeta } from "../data"
import { t } from "../i18n"

/* ---------- wireframe pieces: token colours only, so they follow the skin ---------- */

const Bar = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn("h-1.5 rounded-full bg-muted", className)} style={style} />
)
const Blk = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={cn("rounded-xs bg-muted", className)}>{children}</div>
)
const Btn = ({ className }: { className?: string }) => <div className={cn("h-2.5 w-7 rounded-xs bg-primary", className)} />
const Box = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={cn("rounded-xs border", className)}>{children}</div>
)
const Head = ({ action = true }: { action?: boolean }) => (
  <div className="flex items-center gap-1.5">
    <Bar className="h-2 w-1/4 bg-faint-foreground/50" />
    {action && <Btn className="ml-auto" />}
  </div>
)

const wires: { key: string; name: string; use: string; spec: string[]; wire: React.ReactNode }[] = [
  {
    key: "overview",
    name: t("概览", "Overview"),
    use: t("一组指标和趋势", "Metrics and trends"),
    spec: t(["宽度 wide", "指标 1 → 2 → 4 列", "图表 2 列"], ["Width: wide", "Stats in 1 → 2 → 4 columns", "Charts in 2 columns"]),
    wire: (
      <>
        <Head />
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <Box key={i} className="flex h-6 flex-col justify-center gap-1 px-1">
              <Bar className="h-1 w-1/2" />
              <Bar className="h-1.5 w-2/3 bg-faint-foreground/40" />
            </Box>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1">
          {[0, 1].map((i) => (
            <Box key={i} className="flex items-end gap-0.5 p-1">
              {[40, 70, 55, 85, 60, 90].map((h, j) => (
                <div key={j} className="flex-1 rounded-t-[1px] bg-muted" style={{ height: `${h}%` }} />
              ))}
            </Box>
          ))}
        </div>
        <Bar className="w-full" />
        <Bar className="w-5/6" />
      </>
    ),
  },
  {
    key: "list",
    name: t("列表", "List"),
    use: t("管理一类对象", "Manage one kind of object"),
    spec: t(["宽度 wide", "筛选 ≤ 4 个", "表格 ≤ 6 列", "点行打开抽屉"], ["Width: wide", "≤ 4 filters", "≤ 6 table columns", "A row opens a drawer"]),
    wire: (
      <>
        <Head />
        <div className="flex gap-1">
          <Blk className="h-2.5 w-1/4" />
          <Blk className="h-2.5 w-8" />
          <Blk className="h-2.5 w-8" />
        </div>
        <div className="flex flex-1 flex-col">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("flex items-center gap-2 border-b px-1 py-1", i === 2 && "bg-selected")}>
              <Bar className="w-1/3" />
              <Bar className="w-1/6" />
              <Bar className="ml-auto w-1/6" />
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    key: "detail",
    name: t("对象详情页", "Detail page"),
    use: t("有标签页、子列表或要分享链接的对象", "Objects with tabs, sub-lists or a shareable link"),
    spec: t(["宽度 wide", "标签页 ≤ 6 个", "侧栏 320，内容区 ≥ 896 才分栏"], ["Width: wide", "≤ 6 tabs", "Aside 320; splits only at ≥ 896"]),
    wire: (
      <>
        <div className="flex items-center gap-1.5">
          <Blk className="size-2.5" />
          <Bar className="h-2 w-1/4 bg-faint-foreground/50" />
          <Btn className="ml-auto" />
        </div>
        <Bar className="w-1/3" />
        <div className="flex gap-2 border-b pb-1">
          <Bar className="w-6 bg-faint-foreground/50" />
          <Bar className="w-6" />
          <Bar className="w-6" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <div className="flex flex-1 flex-col gap-1">
            <Bar className="w-full" />
            <Bar className="w-5/6" />
            <Box className="mt-1 flex-1" />
          </div>
          <Box className="flex w-1/4 flex-col gap-1 p-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-1">
                <Bar className="w-1/3" />
                <Bar className="w-1/2 bg-faint-foreground/40" />
              </div>
            ))}
          </Box>
        </div>
      </>
    ),
  },
  {
    key: "split",
    name: t("列表-详情分栏", "List–detail"),
    use: t("一条一条处理的队列", "A queue worked one item at a time"),
    spec: t(["宽度 full + fill", "列表 360（280–480）", "lg 以下单栏"], ["Width: full + fill", "List 360 (280–480)", "One column below lg"]),
    wire: (
      <div className="-m-2.5 flex flex-1">
        <div className="flex w-1/3 flex-col border-r">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex flex-col gap-1 border-b p-1.5", i === 1 && "bg-selected")}>
              <Bar className="w-2/3 bg-faint-foreground/40" />
              <Bar className="w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <Head />
          <Bar className="w-full" />
          <Bar className="w-11/12" />
          <Bar className="w-4/5" />
          <Box className="mt-1 flex-1" />
        </div>
      </div>
    ),
  },
  {
    key: "aside",
    name: t("主栏 + 侧栏", "Main + aside"),
    use: t("内容，旁边是属性、相关、帮助", "Content with properties or help beside it"),
    spec: t(["宽度 wide", "侧栏 320，吸顶", "主栏 ≥ 528"], ["Width: wide", "Aside 320, sticky", "Main ≥ 528"]),
    wire: (
      <>
        <Head />
        <div className="flex flex-1 gap-1.5">
          <div className="flex flex-1 flex-col gap-1">
            {[100, 92, 96, 70, 100, 85, 60].map((w, i) => (
              <Bar key={i} className="max-w-full" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex w-1/4 flex-col gap-1">
            <Box className="h-8" />
            <Box className="h-6" />
          </div>
        </div>
      </>
    ),
  },
  {
    key: "settings",
    name: t("设置", "Settings"),
    use: t("账户、偏好、通知", "Account, preferences, notifications"),
    spec: t(["宽度 narrow", "标签在左、控件在右", "区块间距 40"], ["Width: narrow", "Label left, control right", "40 between sections"]),
    wire: (
      <div className="mx-auto flex w-3/4 flex-1 flex-col gap-1.5">
        <Head action={false} />
        {[0, 1].map((g) => (
          <div key={g} className="flex flex-col">
            <Bar className="mb-1 w-1/5 bg-faint-foreground/40" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between border-b py-1">
                <Bar className="w-1/3" />
                <Blk className="h-2.5 w-1/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "wizard",
    name: t("分步表单", "Multi-step form"),
    use: t("要分几步、后面取决于前面", "Steps that depend on earlier ones"),
    spec: t(["宽度 narrow", "表单 ≤ 560", "≤ 4 步时步骤条在顶部"], ["Width: narrow", "Form ≤ 560", "Steps on top when there are ≤ 4"]),
    wire: (
      <div className="mx-auto flex w-3/5 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div className={cn("size-2.5 shrink-0 rounded-full", i === 0 ? "bg-primary" : "bg-muted")} />
              {i < 2 && <div className="h-px flex-1 bg-border" />}
            </React.Fragment>
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <Bar className="w-1/4" />
            <Box className="h-2.5" />
          </div>
        ))}
        <div className="mt-auto flex gap-1">
          <Blk className="h-2.5 w-7" />
          <Blk className="ml-auto h-2.5 w-7" />
          <Btn />
        </div>
      </div>
    ),
  },
  {
    key: "empty",
    name: t("空页与结果页", "Empty and result pages"),
    use: t("第一次使用、404、无权限、出错", "First use, 404, no access, errors"),
    spec: t(["居中，最宽 464", "上方留 80", "≤ 1 个主操作"], ["Centered, at most 464 wide", "80 above", "≤ 1 primary action"]),
    wire: (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
        <div className="size-5 rounded-full bg-muted" />
        <Bar className="h-2 w-1/3 bg-faint-foreground/50" />
        <Bar className="w-1/2" />
        <Btn className="mt-1 w-10" />
      </div>
    ),
  },
  {
    key: "card",
    name: t("单卡片页", "Single card"),
    use: t("登录、注册、邀请、授权", "Sign in, sign up, invites, consent"),
    spec: t(["卡片 400", "控件高 44", "标志在卡片上方 24"], ["Card 400", "Controls 44 tall", "Logo 24 above the card"]),
    wire: (
      <div className="-m-2.5 flex flex-1 flex-col items-center justify-center gap-1.5 bg-sunken">
        <div className="size-2.5 rounded-full bg-faint-foreground/50" />
        <Box className="flex w-2/5 flex-col gap-1 bg-background p-1.5">
          <Bar className="h-2 w-1/2 bg-faint-foreground/50" />
          <Box className="h-2.5" />
          <Box className="h-2.5" />
          <Btn className="w-full" />
        </Box>
      </div>
    ),
  },
  {
    key: "editor",
    name: t("编辑器与画布", "Editor and canvas"),
    use: t("设计稿、文档、预览", "Designs, documents, previews"),
    spec: t(["宽度 full", "工具栏 48", "面板 240–320，可收起"], ["Width: full", "Toolbar 48", "Panels 240–320, collapsible"]),
    wire: (
      <div className="-m-2.5 flex flex-1 flex-col">
        <div className="flex items-center gap-1 border-b px-1.5 py-1">
          <Blk className="h-2 w-6" />
          <Blk className="h-2 w-2" />
          <Blk className="h-2 w-2" />
          <Btn className="ml-auto h-2" />
        </div>
        <div className="flex flex-1">
          <div className="flex w-1/5 flex-col gap-1 border-r p-1">
            <Bar className="w-3/4" />
            <Bar className="w-1/2" />
            <Bar className="w-2/3" />
          </div>
          <div className="grid flex-1 place-items-center bg-sunken">
            <Box className="h-10 w-16 bg-background" />
          </div>
          <div className="flex w-1/5 flex-col gap-1 border-l p-1">
            <Bar className="w-1/2" />
            <Blk className="h-2 w-full" />
            <Blk className="h-2 w-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "board",
    name: t("看板", "Board"),
    use: t("一组对象按阶段推进", "Items moving through stages"),
    spec: t(["宽度 full + fill", "列宽 288，列间 12", "看板内横向滚动"], ["Width: full + fill", "Columns 288, 12 apart", "Scrolls sideways inside"]),
    wire: (
      <>
        <Head />
        <div className="flex flex-1 gap-1.5 overflow-hidden">
          {[3, 2, 4, 1].map((n, c) => (
            <div key={c} className="flex w-1/4 shrink-0 flex-col gap-1 rounded-xs bg-sunken p-1">
              <Bar className="w-1/2 bg-faint-foreground/40" />
              {Array.from({ length: n }, (_, i) => (
                <Box key={i} className="flex flex-col gap-0.5 bg-background p-1">
                  <Bar className="w-3/4" />
                  <Bar className="h-1 w-1/3" />
                </Box>
              ))}
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    key: "grid",
    name: t("卡片网格", "Card grid"),
    use: t("图片、模板、项目", "Images, templates, projects"),
    spec: t(["宽度 wide", "每列 ≥ 240", "一个网格一种比例"], ["Width: wide", "Columns ≥ 240", "One aspect ratio per grid"]),
    wire: (
      <>
        <Head />
        <div className="grid flex-1 grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Box key={i} className="flex flex-col overflow-hidden">
              <Blk className="flex-1 rounded-none" />
              <div className="p-0.5">
                <Bar className="h-1 w-2/3" />
              </div>
            </Box>
          ))}
        </div>
      </>
    ),
  },
]

export function LayoutsPage() {
  return (
    <DocPage
      title={t("页面布局", "Layouts")}
      lead={t("先选骨架，再往里放组件。宽度只有 narrow / wide / full 三档。", "Pick a skeleton, then fill it in. Three widths: narrow, wide, full.")}
      info={t(
        "间距来自 --space-* token，跟着主题工作室里的留白设置一起变。",
        "Spacing comes from the --space-* tokens and follows the spacing setting in the theme studio.",
      )}
      source="references/patterns/page-layouts.md"
    >
      <Example
        title={t("骨架", "Skeletons")}
        info={t("线框图也用主题 token，在主题工作室里换皮肤，这里一起变。", "The wireframes use theme tokens too, so they change with the skin in the theme studio.")}
        canvas="none"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
          {wires.map((w) => (
            <figure key={w.key} className="flex flex-col gap-2">
              <div aria-hidden className="flex aspect-[16/10] flex-col gap-1.5 overflow-hidden rounded-md border bg-background p-2.5">
                {w.wire}
              </div>
              <figcaption className="flex flex-col">
                <span className="flex items-center gap-1">
                  <span className="text-body font-medium">{w.name}</span>
                  <Info label={t(`${w.name}的规格`, `${w.name} specs`)}>
                    <ul className="tabular flex flex-col gap-1">
                      {w.spec.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </Info>
                </span>
                <span className="text-small text-muted-foreground">{w.use}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Example>

      <Example
        title={t("概览", "Overview")}
        info={t("StatGrid + Stat，图表放进 Card。同一行的图一样高，加载和出错时也不变。", "StatGrid + Stat, charts in a Card. Charts in a row share one height, also while loading or on error.")}
        canvas="sunken"
      >
        <OverviewDemo />
      </Example>

      <Example
        title={t("对象详情页", "Detail page")}
        info={t(
          "PageHeader 带返回 + 元信息 + Tabs，正文是 PageColumns：内容区不到 896 时侧栏落到主栏下面。只改几个字段的对象用抽屉，不开页面。",
          "PageHeader with back + meta + Tabs; the body is PageColumns, and the aside drops below the main column when the content is under 896 wide. An object with only a few fields to edit opens in a drawer, not a page.",
        )}
      >
        <DetailDemo />
      </Example>

      <Example
        title={t("单卡片页", "Single card")}
        info={t("卡片 400，垂直居中；标志在上方 24；控件 44 高，主按钮和卡片一样宽。", "Card 400, centered vertically; logo 24 above; controls 44 tall, primary button as wide as the card.")}
        canvas="sunken"
      >
        <div className="flex flex-col items-center gap-6 py-6">
          <span className="flex items-center gap-2 text-heading font-semibold">
            <Sprout className="size-5" />
            {t("苗圃", "Seedbed")}
          </span>
          <Card className="w-full max-w-[400px] p-6">
            <h3 className="mb-5 text-title font-semibold">{t("登录", "Sign in")}</h3>
            <FieldGroup>
              <Field label={t("邮箱", "Email")}>
                <Input type="email" placeholder="name@example.com" className="h-(--control-lg)" />
              </Field>
              <Field label={t("密码", "Password")}>
                <Input type="password" className="h-(--control-lg)" />
              </Field>
              <Button variant="primary" size="lg" className="mt-1 w-full">
                {t("登录", "Sign in")}
              </Button>
            </FieldGroup>
          </Card>
        </div>
      </Example>

      <Example
        title={t("空页与结果页", "Empty and result pages")}
        info={t("整页的空状态居中、上方留 80；区块里的用 StateView size=sm。", "A full-page empty state is centered with 80 above; inside a section, use StateView size=sm.")}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <StateView
            kind="empty"
            icon={<FileQuestion />}
            title={t("找不到这个页面", "Page not found")}
            description={t("链接可能已经失效。", "The link may have expired.")}
            action={<Button size="sm">{t("回到首页", "Go to home")}</Button>}
          />
          <StateView kind="no-permission" description={t("联系项目管理员开通查看权限。", "Ask a project admin for view access.")} />
        </div>
      </Example>

      <Example
        title={t("卡片网格", "Card grid")}
        info={t("CardGrid：每列最窄 240，列数自动；一个网格只用一种比例。", "CardGrid: columns at least 240 wide, as many as fit; one aspect ratio per grid.")}
        canvas="none"
      >
        <CardGrid>
          {projects.slice(0, 6).map((p, i) => (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="aspect-video" style={{ background: catVar(CHART_SERIES[i], true) }} />
              <div className="flex flex-col gap-0.5 p-(--space-card)">
                <span className="truncate text-body font-medium">{p.name}</span>
                <span className="text-small text-faint-foreground">{p.owner}</span>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Example>

      <Example title={t("每一页都一样", "On every page")} canvas="none">
        <Spec
          rows={[
            [
              t("间距", "Spacing"),
              t(
                "页面内边距 --space-page（24，手机 16）· 区块之间 --space-section（32）· 卡片 --space-card（16）",
                "Page padding --space-page (24, 16 on phones) · between sections --space-section (32) · cards --space-card (16)",
              ),
            ],
            [
              t("滚动", "Scrolling"),
              t(
                "概览、详情、设置整页滚动；分栏、编辑器、看板占满视口高度，每栏自己滚",
                "Overview, detail and settings scroll as a page; split, editor and board fill the viewport and each pane scrolls on its own",
              ),
            ],
            [
              t("吸顶", "Sticky"),
              t("页头不吸顶；表头、列表头、工具栏、宽屏侧栏吸顶", "Page headers don't stick; table headers, list headers, toolbars and wide-screen asides do"),
            ],
            [t("主操作", "Primary action"), t("页头右侧，≤ 1 个；长表单在底部 SaveBar 保存", "At most one, at the right of the page header; long forms save from the SaveBar")],
            [
              t("两栏", "Two columns"),
              t(
                "PageColumns 自己 ≥ 896 才分栏；整页分栏从 lg（1024）起；不另做平板布局",
                "PageColumns splits only when it's ≥ 896 wide; full-page splits start at lg (1024); no separate tablet layout",
              ),
            ],
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- live demos ---------- */

const months = [62, 74, 58, 81, 77, 92, 88]
// May–Nov, in the page's language
const monthLabel = (i: number) => new Date(2026, i + 4, 1).toLocaleString(t("zh-CN", "en-US"), { month: "short" })
const shares = [46, 18, 9, 27]

function OverviewDemo() {
  return (
    <div className="flex flex-col gap-(--space-card)">
      <StatGrid>
        <Stat label={t("进行中的项目", "Active projects")} value="24" meta={t("较上周 +3", "+3 from last week")} />
        <Stat
          label={t("本月预算", "Budget this month")}
          info={t("已批准的预算，不含草稿。", "Approved budgets only, no drafts.")}
          value={fmtMoney(1284000)}
          meta={t("截至今天 9:00", "As of 9:00 today")}
        />
        <Stat label={t("按时交付率", "On-time delivery")} value="92%" meta={t("近 30 天", "Last 30 days")} />
        <Stat label={t("待审核", "Awaiting review")} value="7" meta={t("最久的已等 3 天", "Oldest has waited 3 days")} />
      </StatGrid>
      <div className="grid gap-(--space-card) xl:grid-cols-2">
        <Card
          title={t("每月新建项目", "New projects per month")}
          actions={
            <IconButton label={t("更多操作", "More actions")} size="icon-sm">
              <MoreHorizontal />
            </IconButton>
          }
        >
          <div className="flex h-[180px] items-end gap-2">
            {months.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-xs" style={{ height: `${v * 1.6}px`, background: catVar("blue") }} />
                <span className="tabular text-caption text-faint-foreground">{monthLabel(i)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t("状态分布", "By status")}>
          {/* label column sizes to the longest label, in either language; the bars stay aligned */}
          <div className="grid h-[180px] grid-cols-[auto_1fr_auto] content-center items-center gap-3">
            {(["active", "review", "blocked", "done"] as const).map((k, i) => (
              <React.Fragment key={k}>
                <span className="text-small whitespace-nowrap text-muted-foreground">{statusMeta[k].label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${shares[i]}%`, background: catVar(CHART_SERIES[i]) }} />
                </div>
                <span className="tabular text-right text-small">{shares[i]}%</span>
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function DetailDemo() {
  const p = projects[2]
  const [editing, setEditing] = React.useState(false)
  return (
    <div>
      <PageHeader
        back={
          <IconButton label={t("返回项目列表", "Back to projects")} size="icon-sm">
            <ArrowLeft />
          </IconButton>
        }
        title={p.name}
        actions={
          <>
            <IconButton label={t("更多操作", "More actions")}>
              <MoreHorizontal />
            </IconButton>
            <Button variant="primary">{t("提交审核", "Submit for review")}</Button>
          </>
        }
        className="mb-1"
      />
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
        <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge>
        <span>{t(`${p.owner} 负责`, `Owner: ${p.owner}`)}</span>
        <span className="tabular">{t(`更新于 ${formatDate(p.updatedAt)}`, `Updated ${formatDate(p.updatedAt)}`)}</span>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="mb-(--space-card)">
          <TabsTrigger value="overview">{t("概览", "Overview")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("任务", "Tasks")}</TabsTrigger>
          <TabsTrigger value="members">{t("成员", "Members")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PageColumns
            asideLabel={t("属性", "Properties")}
            aside={
              <Card
                title={t("属性", "Properties")}
                actions={
                  <IconButton
                    label={editing ? t("完成编辑", "Done editing") : t("编辑属性", "Edit properties")}
                    size="icon-sm"
                    onClick={() => setEditing((e) => !e)}
                  >
                    <Pencil />
                  </IconButton>
                }
              >
                <DetailList
                  editing={editing}
                  items={[
                    { label: t("编号", "ID"), value: <span className="tabular">{p.id}</span> },
                    { label: t("负责人", "Owner"), value: p.owner, edit: <Input defaultValue={p.owner} /> },
                    {
                      label: t("预算", "Budget"),
                      value: <span className="tabular">{fmtMoney(p.budget)}</span>,
                      edit: <Input defaultValue={p.budget} className="tabular" />,
                    },
                    { label: t("进度", "Progress"), value: <span className="tabular">{p.progress}%</span> },
                  ]}
                />
              </Card>
            }
          >
            <Section title={t("说明", "Description")}>
              <p className="max-w-[680px] text-body text-muted-foreground">
                {t(
                  "整理种植日历的数据来源，统一节气和地区的换算，下个版本开放给所有门店。",
                  "Clean up where the planting calendar's data comes from and align seasons across regions, then open it to every store in the next release.",
                )}
              </p>
            </Section>
            <Section title={t("最近的任务", "Recent tasks")}>
              <ul className="divide-y rounded-lg border">
                {projects.slice(10, 14).map((task) => (
                  <li key={task.id} className="flex h-(--row-h) items-center gap-3 px-4 text-body">
                    <span className="min-w-0 flex-1 truncate">{task.name}</span>
                    <StatusDot tone={statusMeta[task.status].tone}>{statusMeta[task.status].label}</StatusDot>
                  </li>
                ))}
              </ul>
            </Section>
          </PageColumns>
        </TabsContent>
        <TabsContent value="tasks">
          <StateView kind="empty" size="sm" title={t("还没有任务", "No tasks yet")} />
        </TabsContent>
        <TabsContent value="members">
          <StateView kind="empty" size="sm" title={t("还没有成员", "No members yet")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
