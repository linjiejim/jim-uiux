import * as React from "react"
import { wcagContrast, parse } from "culori"
import { cn } from "@/lib/utils"
import { CATEGORICAL, catClass } from "@/registry/jim/lib/categorical"
import { Button } from "@/registry/jim/ui/button"
import { Switch } from "@/registry/jim/ui/switch"
import { DocPage, Example, Rules, Spec } from "../doc"

/* ---------- live token reading ---------- */

function useThemeVersion() {
  const [v, setV] = React.useState(0)
  React.useEffect(() => {
    const mo = new MutationObserver(() => setV((x) => x + 1))
    mo.observe(document.documentElement, { attributes: true })
    return () => mo.disconnect()
  }, [])
  return v
}

function useResolved(vars: string[]) {
  const version = useThemeVersion()
  const [out, setOut] = React.useState<Record<string, string>>({})
  React.useLayoutEffect(() => {
    const probe = document.createElement("div")
    document.body.appendChild(probe)
    const res: Record<string, string> = {}
    for (const v of vars) {
      probe.style.backgroundColor = `var(${v})`
      res[v] = getComputedStyle(probe).backgroundColor
    }
    probe.remove()
    setOut(res)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, vars.join()])
  return out
}

function ratio(fg?: string, bg?: string) {
  if (!fg || !bg) return null
  const a = parse(fg)
  const b = parse(bg)
  if (!a || !b) return null
  // flatten translucent fg over bg
  if (a.alpha !== undefined && a.alpha < 1) return null
  return wcagContrast(a, b)
}

const surfaces = [
  ["--background", "画布"],
  ["--sunken", "下沉：侧栏、表头"],
  ["--muted", "填充：轨道、骨架、标签"],
  ["--popover", "浮层：菜单、弹框"],
  ["--selected", "选中行"],
  ["--inverse", "反色：Tooltip"],
] as const
const texts = [
  ["--foreground", "正文", 7],
  ["--muted-foreground", "次要文字", 4.5],
  ["--faint-foreground", "元信息、占位", 4.5],
  ["--primary", "强调色", 3],
  ["--destructive", "危险", 4.5],
  ["--success", "成功", 4.5],
  ["--warning", "警告", 4.5],
  ["--info", "信息", 4.5],
] as const
const lines = [
  ["--border", "细线：分割、卡片"],
  ["--input", "控件边框"],
  ["--ring", "焦点环"],
] as const

export function ColorPage() {
  const all = [...surfaces.map((s) => s[0]), ...texts.map((t) => t[0]), ...lines.map((l) => l[0]), "--primary-foreground"]
  const c = useResolved(all)
  return (
    <DocPage
      title="颜色"
      lead="黑白灰加一个强调色。颜色只表达语义：强调色 = 主操作、当前、焦点；黄 = 需要你处理；红 = 失败或危险。"
      source="registry/jim/theme/jim-theme.css"
    >
      <Example title="表面" note="层级靠表面明度区分，不靠阴影。" canvas="none">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {surfaces.map(([v, label]) => (
            <div key={v} className="overflow-hidden rounded-lg border">
              <div className="h-16" style={{ background: `var(${v})` }} />
              <div className="border-t px-3 py-2">
                <div className="text-small font-medium">{label}</div>
                <code className="font-mono text-caption text-faint-foreground">{v}</code>
              </div>
            </div>
          ))}
        </div>
      </Example>

      <Example title="文字与对比度" note="数值是当前主题下与画布、下沉表面的实时对比度。守卫测试会在低于门槛时失败。" canvas="none">
        <div className="divide-y rounded-lg border">
          {texts.map(([v, label, min]) => {
            const r1 = ratio(c[v], c["--background"])
            const r2 = ratio(c[v], c["--sunken"])
            const ok = (r1 ?? 0) >= min && (v === "--primary" || (r2 ?? 0) >= min)
            return (
              <div key={v} className="flex items-center gap-4 px-4 py-3">
                <span className="w-24 shrink-0 text-body font-medium" style={{ color: `var(${v})` }}>
                  {label}
                </span>
                <code className="flex-1 truncate font-mono text-caption text-faint-foreground">{v}</code>
                <span className="tabular w-36 text-right text-small text-muted-foreground">
                  {r1?.toFixed(1)} / {r2?.toFixed(1)} · ≥{min}
                </span>
                <span className={cn("w-8 text-right text-small font-medium", ok ? "text-success" : "text-destructive")}>{ok ? "AA" : "✕"}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="w-24 shrink-0">
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-body font-medium text-primary-foreground">主按钮</span>
            </span>
            <code className="flex-1 truncate font-mono text-caption text-faint-foreground">--primary-foreground on --primary</code>
            <span className="tabular w-36 text-right text-small text-muted-foreground">
              {ratio(c["--primary-foreground"], c["--primary"])?.toFixed(1)} · ≥4.5
            </span>
            <span className="w-8 text-right text-small font-medium text-success">AA</span>
          </div>
        </div>
      </Example>

      <Example
        title="分类色"
        note="用户自己选的颜色（标签、项目色、选项）和图表系列。9 种，每种一对：fg 用于文字、圆点和柱子，-subtle 是标签底色；浅色、深色各一套，对比度由守卫检查。存名字（blue），不存色值；它们是数据，不是第二个强调色，不用在按钮、链接和导航上。"
        canvas="none"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {CATEGORICAL.map((name) => {
            const c = catClass(name)
            return (
              <div key={name} className="flex flex-col items-start gap-2 rounded-lg border p-3">
                <span className={cn("rounded-xs px-1.5 text-small font-medium", c.fill, c.fg)}>标签</span>
                <span className="flex items-center gap-1.5 text-small">
                  <span className={cn("size-2 rounded-full", c.dot)} />
                  {name}
                </span>
                <code className="font-mono text-caption text-faint-foreground">--cat-{name}</code>
              </div>
            )
          })}
        </div>
      </Example>

      <Example
        title="预设与增强对比度"
        note={'中性色预设换整套灰（data-theme），强调色预设换唯一的强调色（data-accent），两者可以任意组合，守卫逐一检查。系统打开「增强对比度」时，次要文字、细线和控件边框自动加深（也可以用 data-contrast="more" 强制）。要细调，去主题工作室。'}
        canvas="none"
      >
        <Spec
          rows={[
            ["中性色", "warm 暖灰（Notion）· slate 冷灰 · sage 灰绿 · mauve 灰紫；默认纯灰"],
            ["强调色", "blue 蓝 · indigo 靛 · violet 紫 · pink 玫红 · teal 青；默认墨（= 正文色）。没有红、绿、黄：它们已经是危险、成功、需要处理"],
            ["搭配", "蓝、靛配冷灰；紫、玫红配灰紫；青配灰绿"],
            ["增强对比度", "次要文字 ≥ 7:1，元信息 ≥ 5.5:1，控件边框 ≥ 3:1，焦点环 3px"],
          ]}
        />
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <a href="#/studio">打开主题工作室</a>
        </Button>
      </Example>

      <Example title="线" canvas="none">
        <div className="grid gap-3 sm:grid-cols-3">
          {lines.map(([v, label]) => (
            <div key={v} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="h-8 w-12 rounded-md bg-background" style={{ boxShadow: `inset 0 0 0 2px var(${v})` }} />
              <div>
                <div className="text-small font-medium">{label}</div>
                <code className="font-mono text-caption text-faint-foreground">{v}</code>
              </div>
            </div>
          ))}
        </div>
      </Example>

      <Example title="用法" canvas="none">
        <Rules
          dos={[
            "只用语义类名：bg-background、text-muted-foreground、border-border",
            "状态色同时配文字或图标",
            "需要新颜色时，先在主题里加语义 token，再用",
            "填充色上的文字用配对的 *-foreground",
          ]}
          donts={[
            // design-allow: 文档里列出的反例
            "裸色值：#fff、rgb()、bg-white、text-gray-500、bg-red-500",
            "第二个强调色",
            "用强调色做大面积背景或正文颜色",
            "品牌渐变",
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- type ---------- */

const scale = [
  ["text-hero", "40 / 52", "仅营销页", "font-semibold"],
  ["text-display", "28 / 40", "数据大字、空页标题", "font-semibold"],
  ["text-title-lg", "22 / 32", "页面标题", "font-semibold"],
  ["text-title", "18 / 26", "弹框标题", "font-semibold"],
  ["text-heading", "16 / 24", "区块标题、抽屉标题", "font-semibold"],
  ["text-reading", "16 / 26", "长文阅读、触屏输入框", ""],
  ["text-body", "14 / 22", "界面正文（默认）", ""],
  ["text-small", "13 / 20", "标签、表头、次要信息", ""],
  ["text-caption", "12 / 18", "说明、元信息。最小字号", ""],
] as const

export function TypePage() {
  return (
    <DocPage title="文字" lead="一个无衬线字族，9 级语义字号。中文行高 ≥ 1.4，最小 12px。" source="--text-* in jim-theme.css">
      <Example title="字号阶梯" canvas="none">
        <div className="divide-y">
          {scale.map(([cls, size, use, weight]) => (
            <div key={cls} className="flex items-baseline gap-6 py-3 max-sm:flex-col max-sm:gap-1">
              <div className="w-40 shrink-0">
                <code className="font-mono text-caption text-muted-foreground">{cls}</code>
                <div className="tabular text-caption text-faint-foreground">
                  {size} · {use}
                </div>
              </div>
              <div className={cn(cls, weight, "min-w-0 truncate")}>种一盆罗勒 Basil 2026</div>
            </div>
          ))}
        </div>
      </Example>
      <Example title="字重" canvas="none">
        <Spec
          rows={[
            ["400", "正文"],
            ["500", "标签、按钮、表头、强调一个词"],
            ["600", "所有标题。界面里不用 700 以上"],
          ]}
        />
      </Example>
      <Example title="用法" canvas="none">
        <Rules
          dos={[
            "数字用 .tabular（等宽数字），右对齐",
            "中文与英文、数字之间加一个空格",
            "标题和按钮用句子大小写，不全大写",
            "长文一行 ≤ 40 个汉字（约 680px）",
          ]}
          donts={[
            // design-allow: 文档里列出的反例
            "text-[11px] 这类任意字号",
            "小于 12px 的字",
            "同时加粗又变色来强调同一个词",
            "居中对齐的长段落",
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- shape ---------- */

export function ShapePage() {
  return (
    <DocPage title="间距、圆角与层级" lead="4px 网格。圆角由一个旋钮按比例缩放。卡片扁平，阴影只给浮层。">
      <Example title="间距刻度" note="只用这些：2 4 6 8 12 16 20 24 32 40 48 64。控件内 8–12，字段之间 16，区块之间 32。" canvas="none">
        <div className="flex flex-col gap-2">
          {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="tabular w-12 text-right text-small text-muted-foreground">{n * 4}</span>
              <div className="h-3 rounded-xs bg-primary" style={{ width: n * 4 }} />
            </div>
          ))}
        </div>
      </Example>
      <Example title="圆角" note="面越大，圆角越大。" canvas="none">
        <div className="flex flex-wrap gap-4">
          {[
            ["rounded-xs", "复选框、标签"],
            ["rounded-sm", "徽章、菜单项"],
            ["rounded-md", "按钮、输入框"],
            ["rounded-lg", "卡片、浮层、Toast"],
            ["rounded-xl", "弹框"],
            ["rounded-2xl", "底部弹层"],
          ].map(([cls, use]) => (
            <div key={cls} className="flex w-32 flex-col gap-2">
              <div className={cn("h-16 border-2 border-input bg-sunken", cls)} />
              <code className="font-mono text-caption">{cls}</code>
              <span className="text-caption text-faint-foreground">{use}</span>
            </div>
          ))}
        </div>
      </Example>
      <Example title="层级" note="两级阴影。页面上的卡片不加阴影。" canvas="sunken">
        <div className="flex flex-wrap gap-6">
          <div className="flex h-24 w-44 items-end rounded-lg border bg-background p-3 text-small">卡片：1px 细线</div>
          <div className="flex h-24 w-44 items-end rounded-lg bg-popover p-3 text-small shadow-popover">shadow-popover：菜单、选择器</div>
          <div className="flex h-24 w-44 items-end rounded-xl bg-popover p-3 text-small shadow-overlay">shadow-overlay：弹框、抽屉</div>
        </div>
      </Example>
      <Example title="尺寸" canvas="none">
        <Spec
          rows={[
            ["控件高度", "sm 28 · md 32 · lg 40（紧凑 24 · 28 · 36；触屏 36 · 44 · 48）"],
            ["表格", "表头 36 · 行 44（紧凑 32 · 36）"],
            ["导航项", "30（触屏 40）"],
            ["侧栏", "240，收起 56"],
            ["页面宽度", "narrow 720 · wide 1200 · full"],
            ["图标", "Lucide，描边 1.75；行内 14 · 按钮 16 · 标题 20"],
            ["z 轴", "sticky 10 · 下拉、弹框、抽屉 50（由 Portal 按打开顺序叠放）"],
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- motion ---------- */

/** Keeps a demo surface mounted while its exit animation plays (what Radix Presence does). */
function usePresence(open: boolean) {
  const [mounted, setMounted] = React.useState(open)
  React.useEffect(() => {
    if (open) setMounted(true)
  }, [open])
  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (!open && e.target === e.currentTarget) setMounted(false)
  }
  return { show: open || mounted, state: open ? "open" : "closed", onAnimationEnd }
}

const SLOW = 5

function MotionDemo() {
  const [open, setOpen] = React.useState(true)
  const [slow, setSlow] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)
  const dialog = usePresence(open)
  const menu = usePresence(open)
  const drawer = usePresence(open)
  const sheet = usePresence(open)
  // Same tokens the components use, scoped to this demo: slower, or with movement turned off.
  const vars = {
    ...(slow && {
      "--duration-fast": `${120 * SLOW}ms`,
      "--duration-base": `${200 * SLOW}ms`,
      "--duration-slow": `${240 * SLOW}ms`,
      "--duration-exit": `${160 * SLOW}ms`,
    }),
    ...(reduced && { "--motion": 0 }),
  } as React.CSSProperties
  const frame = "relative h-44 overflow-hidden rounded-lg border bg-background"
  const caption = "mt-1.5 text-caption text-muted-foreground"
  return (
    <div className="flex flex-col gap-4" style={vars}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button variant="primary" onClick={() => setOpen((o) => !o)}>
          {open ? "全部关闭" : "全部打开"}
        </Button>
        <label className="flex items-center gap-2 text-small">
          <Switch checked={slow} onCheckedChange={setSlow} />
          慢放 ×{SLOW}
        </label>
        <label className="flex items-center gap-2 text-small">
          <Switch checked={reduced} onCheckedChange={setReduced} />
          按「减少动效」播放
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <figure>
          <div className={frame}>
            {dialog.show && (
              <>
                <div data-state={dialog.state} className="absolute inset-0 bg-scrim data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
                <div
                  data-state={dialog.state}
                  onAnimationEnd={dialog.onAnimationEnd}
                  className="absolute inset-x-6 top-1/2 -mt-10 h-20 rounded-lg bg-popover p-3 text-small shadow-overlay data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out"
                >
                  弹框
                </div>
              </>
            )}
          </div>
          <figcaption className={caption}>弹框：缩放 97% + 淡入，200 / 160ms；遮罩只淡入</figcaption>
        </figure>
        <figure>
          <div className={cn(frame, "p-3")}>
            <div className="inline-flex h-(--control-sm) items-center rounded-md border px-2.5 text-small">菜单</div>
            {menu.show && (
              <div
                data-state={menu.state}
                onAnimationEnd={menu.onAnimationEnd}
                className="mt-1 w-36 rounded-lg bg-popover p-1 text-small shadow-popover data-[state=open]:animate-drop-in data-[state=closed]:animate-drop-out"
              >
                {["重命名", "复制链接", "删除"].map((t) => (
                  <div key={t} className="rounded-sm px-2 py-1.5">
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          <figcaption className={caption}>菜单：下移 4px + 淡入，120ms；关闭只淡出</figcaption>
        </figure>
        <figure>
          <div className={frame}>
            {drawer.show && (
              <div
                data-state={drawer.state}
                onAnimationEnd={drawer.onAnimationEnd}
                className="absolute inset-y-0 right-0 w-3/5 border-l bg-popover p-3 text-small shadow-overlay data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right"
              >
                抽屉
              </div>
            )}
          </div>
          <figcaption className={caption}>抽屉：从右滑入 240ms（ease-drawer），退出 160ms</figcaption>
        </figure>
        <figure>
          <div className={frame}>
            {sheet.show && (
              <div
                data-state={sheet.state}
                onAnimationEnd={sheet.onAnimationEnd}
                className="absolute inset-x-0 bottom-0 h-3/5 rounded-t-2xl bg-popover p-3 text-small shadow-overlay data-[state=open]:animate-slide-in-up data-[state=closed]:animate-slide-out-down"
              >
                底部弹层
              </div>
            )}
          </div>
          <figcaption className={caption}>底部弹层：从下滑入 240ms，退出 160ms</figcaption>
        </figure>
      </div>
    </div>
  )
}

function CurveDemo() {
  const [end, setEnd] = React.useState(false)
  const rows: [string, string, string][] = [
    ["linear", "ease-linear", "匀速：不用，显得机械"],
    ["ease-out", "ease-out", "进入：一开始就快，慢慢停下"],
    ["ease-in", "ease-in", "退出：慢慢起步，快速离开"],
    ["ease-drawer", "ease-drawer", "抽屉、底部弹层：更长的减速尾巴"],
  ]
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button onClick={() => setEnd((e) => !e)}>播放</Button>
      </div>
      {rows.map(([name, ease, note]) => (
        <div key={name} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[7rem_minmax(0,1fr)_14rem]">
          <code className="text-small">{name}</code>
          <div className="relative h-4 rounded-full bg-muted">
            <span
              className={cn("absolute top-0 size-4 rounded-full bg-foreground transition-[left] duration-1000 motion-reduce:transition-none", ease)}
              style={{ left: end ? "calc(100% - 1rem)" : 0 }}
            />
          </div>
          <span className="text-small text-muted-foreground">{note}</span>
        </div>
      ))}
    </div>
  )
}

export function MotionPage() {
  return (
    <DocPage title="动效" lead="动效只解释状态变化：从哪来、到哪去、发生了什么。不装饰，不循环（进行中的转圈除外）。">
      <Example title="时长与曲线" canvas="none">
        <Spec
          rows={[
            ["fast 120ms", "悬停、按下、开关；菜单、选择器的进出"],
            ["base 200ms", "弹框进入"],
            ["slow 240ms", "抽屉、底部弹层进入"],
            ["exit 160ms", "弹框、抽屉、底部弹层退出，比进入快"],
            ["ease-out", "cubic-bezier(.22, 1, .36, 1)：进入。不用弹跳曲线"],
            ["ease-in", "cubic-bezier(.4, 0, 1, 1)：退出"],
            ["ease-drawer", "cubic-bezier(.32, .72, 0, 1)：抽屉、底部弹层"],
            ["按下", "触屏 scale .97；桌面用按下态填充色"],
            ["减少动效", "系统打开「减少动效」时，位移和缩放归零，只保留淡入淡出"],
            ["默认过渡", "没写时长和曲线的 transition 默认 fast + ease-out"],
          ]}
        />
      </Example>
      <Example
        title="演示"
        note="和组件用的是同一组 token。正常速度下的位移很小，是故意的：只交代方向，不吸引注意。打开「慢放」看清楚每一种，打开「减少动效」看系统设置下的样子。"
        canvas="sunken"
      >
        <MotionDemo />
      </Example>
      <Example title="曲线" note="放慢到 1 秒，方便看出差别。" canvas="sunken">
        <CurveDemo />
      </Example>
      <Example title="用法" canvas="none">
        <Rules
          dos={["列表新增项淡入；删除项淡出后再收起", "数字变化直接跳到新值", "进行中才转圈，完成即停"]}
          donts={["视差、滚动劫持", "入场时整页依次飞入", "装饰性循环、粒子、彩带", "用计时器推进的动画"]}
        />
      </Example>
    </DocPage>
  )
}
