import * as React from "react"
import { ArrowLeft, FileQuestion, MoreHorizontal, Pencil, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHART_SERIES, catVar } from "@/registry/jim/lib/categorical"
import { Badge, StatusDot } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { Card, CardGrid } from "@/registry/jim/ui/card"
import { DetailList } from "@/registry/jim/ui/drawer"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Input } from "@/registry/jim/ui/input"
import { PageColumns, PageHeader, Section } from "@/registry/jim/ui/page"
import { Stat, StatGrid } from "@/registry/jim/ui/stat"
import { StateView } from "@/registry/jim/ui/state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { DocPage, Example, Spec } from "../doc"
import { fmtMoney, projects, statusMeta } from "../data"

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

const wires: { key: string; name: string; use: string; spec: string; wire: React.ReactNode }[] = [
  {
    key: "overview",
    name: "概览",
    use: "一组指标和趋势",
    spec: "wide · 指标 1 → 2 → 4 列 · 图 2 列",
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
    name: "列表",
    use: "管理一类对象",
    spec: "wide · 筛选 ≤ 4 · 表格 ≤ 6 列 · 行点开抽屉",
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
    name: "对象详情页",
    use: "有标签页、子列表或要能分享链接的对象",
    spec: "wide · 标签页 ≤ 6 · 侧栏 320（内容区 ≥ 896）",
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
    name: "列表-详情分栏",
    use: "一条一条处理的队列",
    spec: "full + fill · 列表 360（280–480）· lg 以下单栏",
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
    name: "主栏 + 侧栏",
    use: "内容，旁边是属性、相关、帮助",
    spec: "wide · 侧栏 320 · 主栏 ≥ 544 · 吸顶",
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
    name: "设置",
    use: "设置与偏好",
    spec: "narrow · 标签在左、控件在右 · 区块 40",
    wire: (
      <div className="flex w-3/4 flex-1 flex-col gap-1.5">
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
    name: "分步表单",
    use: "要分几步、后面取决于前面",
    spec: "narrow · 表单 ≤ 560 · ≤ 4 步时步骤条在顶部",
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
    name: "空页与结果页",
    use: "第一次使用、404、无权限、出错",
    spec: "居中 · 最宽 464 · 上方 80 · ≤ 1 个主操作",
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
    name: "单卡片页",
    use: "登录、注册、邀请、授权",
    spec: "卡片 400 · 控件 44 · 标志在上方 24",
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
    name: "编辑器与画布",
    use: "画布、编辑器、预览",
    spec: "full · 工具栏 48 · 面板 240–320，可收起",
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
    name: "看板",
    use: "一组对象按阶段推进",
    spec: "full + fill · 列宽 288 · 列间 12 · 看板内横滚",
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
    name: "卡片网格",
    use: "图片、模板、项目",
    spec: "wide · 每列 ≥ 240 · 一种比例",
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
      title="页面布局"
      lead="常见页面的骨架：先选骨架，再往里放组件。宽度只用 narrow / wide / full 三档，间距来自 --space-* token，跟着「版面留白」一起变。"
      source="references/patterns/page-layouts.md"
    >
      <Example title="先选骨架" note="线框图用的也是主题 token，在主题工作室里换皮肤，这里一起变。" canvas="none">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
          {wires.map((w) => (
            <figure key={w.key} className="flex flex-col gap-2">
              <div aria-hidden className="flex aspect-[16/10] flex-col gap-1.5 overflow-hidden rounded-md border bg-background p-2.5">
                {w.wire}
              </div>
              <figcaption className="flex flex-col gap-0.5">
                <span className="text-body font-medium">{w.name}</span>
                <span className="text-small text-muted-foreground">{w.use}</span>
                <span className="tabular text-caption text-faint-foreground">{w.spec}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Example>

      <Example title="通用规则" canvas="none">
        <Spec
          rows={[
            ["间距", "页面内边距 --space-page（24，手机 16）· 区块之间 --space-section（32）· 卡片 --space-card（16）"],
            ["滚动", "概览、详情、设置整页滚动；分栏、编辑器、看板固定在视口高度，每栏自己滚"],
            ["吸顶", "页头不吸顶；表头、列表头、工具栏、宽屏侧栏吸顶"],
            ["主操作", "页头右侧，≤ 1 个；长表单的保存用底部 SaveBar"],
            ["两栏", "PageColumns 自己 ≥ 896 才分栏；整页分栏从 lg（1024）起；不另做平板布局"],
          ]}
        />
      </Example>

      <Example title="概览" note="StatGrid + Stat，图表放进 Card。同一行的图一样高，加载和出错时也不变。" canvas="sunken">
        <OverviewDemo />
      </Example>

      <Example
        title="对象详情页"
        note="PageHeader back + 元信息 + Tabs，正文是 PageColumns：侧栏 320，内容区不到 896 时落到主栏下面。只是改几个字段的列表对象用抽屉，不开页面。"
        canvas="default"
      >
        <DetailDemo />
      </Example>

      <Example title="单卡片页" note="卡片 400，垂直居中；标志在上方 24；控件 44 高，主按钮和卡片一样宽。" canvas="sunken">
        <div className="flex flex-col items-center gap-6 py-6">
          <span className="flex items-center gap-2 text-heading font-semibold">
            <Sprout className="size-5" />
            苗圃
          </span>
          <Card className="w-full max-w-[400px] p-6">
            <h3 className="mb-5 text-title font-semibold">登录</h3>
            <FieldGroup>
              <Field label="邮箱">
                <Input type="email" placeholder="name@example.com" className="h-(--control-lg)" />
              </Field>
              <Field label="密码">
                <Input type="password" className="h-(--control-lg)" />
              </Field>
              <Button variant="primary" size="lg" className="mt-1 w-full">
                登录
              </Button>
            </FieldGroup>
          </Card>
        </div>
      </Example>

      <Example title="空页与结果页" note="整页的空状态居中、上方留 80；区块里的用 StateView size=sm。" canvas="default">
        <div className="grid gap-6 md:grid-cols-2">
          <StateView
            kind="empty"
            icon={<FileQuestion />}
            title="找不到这个页面"
            description="链接可能已经失效。"
            action={<Button size="sm">回到首页</Button>}
          />
          <StateView kind="no-permission" description="请联系项目管理员开通查看权限。" />
        </div>
      </Example>

      <Example title="卡片网格" note="CardGrid：每列最窄 240，列数自动；一个网格只用一种比例。" canvas="none">
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
    </DocPage>
  )
}

/* ---------- live demos ---------- */

const months = [62, 74, 58, 81, 77, 92, 88]

function OverviewDemo() {
  return (
    <div className="flex flex-col gap-(--space-card)">
      <StatGrid>
        <Stat label="进行中的项目" value="24" meta="较上周 +3" />
        <Stat label="本月预算" info="已批准的预算，不含草稿。" value={fmtMoney(1284000)} meta="截至今天 9:00" />
        <Stat label="按时交付率" value="92%" meta="近 30 天" />
        <Stat label="待审核" value="7" meta="最久的已等 3 天" />
      </StatGrid>
      <div className="grid gap-(--space-card) xl:grid-cols-2">
        <Card title="每月新建项目" actions={<IconButton label="更多操作" size="icon-sm"><MoreHorizontal /></IconButton>}>
          <div className="flex h-[180px] items-end gap-2">
            {months.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-xs" style={{ height: `${v * 1.6}px`, background: catVar("blue") }} />
                <span className="tabular text-caption text-faint-foreground">{i + 5}月</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="状态分布">
          <div className="flex h-[180px] flex-col justify-center gap-3">
            {(["active", "review", "blocked", "done"] as const).map((k, i) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-small text-muted-foreground">{statusMeta[k].label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${[46, 18, 9, 27][i]}%`, background: catVar(CHART_SERIES[i]) }} />
                </div>
                <span className="tabular w-10 text-right text-small">{[46, 18, 9, 27][i]}%</span>
              </div>
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
          <IconButton label="返回项目列表" size="icon-sm">
            <ArrowLeft />
          </IconButton>
        }
        title={p.name}
        actions={
          <>
            <IconButton label="更多操作">
              <MoreHorizontal />
            </IconButton>
            <Button variant="primary">提交审核</Button>
          </>
        }
        className="mb-1"
      />
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
        <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge>
        <span>{p.owner} 负责</span>
        <span className="tabular">更新于 10月29日</span>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="mb-(--space-card)">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="tasks">任务</TabsTrigger>
          <TabsTrigger value="members">成员</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PageColumns
            asideLabel="属性"
            aside={
              <Card
                title="属性"
                actions={
                  <IconButton label={editing ? "完成编辑" : "编辑属性"} size="icon-sm" onClick={() => setEditing((e) => !e)}>
                    <Pencil />
                  </IconButton>
                }
              >
                <DetailList
                  editing={editing}
                  items={[
                    { label: "编号", value: <span className="tabular">{p.id}</span> },
                    { label: "负责人", value: p.owner, edit: <Input defaultValue={p.owner} /> },
                    { label: "预算", value: <span className="tabular">{fmtMoney(p.budget)}</span>, edit: <Input defaultValue={p.budget} className="tabular" /> },
                    { label: "进度", value: <span className="tabular">{p.progress}%</span> },
                  ]}
                />
              </Card>
            }
          >
            <Section title="说明">
              <p className="max-w-[680px] text-body text-muted-foreground">
                整理种植日历的数据来源，统一节气和地区的换算，下个版本开放给所有门店。
              </p>
            </Section>
            <Section title="最近的任务">
              <ul className="divide-y rounded-lg border">
                {projects.slice(10, 14).map((t) => (
                  <li key={t.id} className="flex h-(--row-h) items-center gap-3 px-4 text-body">
                    <span className="min-w-0 flex-1 truncate">{t.name}</span>
                    <StatusDot tone={statusMeta[t.status].tone}>{statusMeta[t.status].label}</StatusDot>
                  </li>
                ))}
              </ul>
            </Section>
          </PageColumns>
        </TabsContent>
        <TabsContent value="tasks">
          <StateView kind="empty" size="sm" title="还没有任务" />
        </TabsContent>
        <TabsContent value="members">
          <StateView kind="empty" size="sm" title="还没有成员" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
