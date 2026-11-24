import * as React from "react"
import { wcagContrast, parse } from "culori"
import { cn } from "@/lib/utils"
import { CATEGORICAL, catClass } from "@/registry/jim/lib/categorical"
import { Button } from "@/registry/jim/ui/button"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Switch } from "@/registry/jim/ui/switch"
import { DocPage, Example, Rules, Spec } from "../doc"
import { lang, t } from "../i18n"

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
  ["--background", t("画布", "Canvas")],
  ["--sunken", t("下沉：侧栏、表头", "Sunken: sidebar, table header")],
  ["--muted", t("填充：轨道、骨架、标签", "Fill: tracks, skeletons, tags")],
  ["--popover", t("浮层：菜单、弹框", "Popover: menus, dialogs")],
  ["--selected", t("选中行", "Selected row")],
  ["--inverse", t("反色：Tooltip", "Inverse: tooltips")],
] as const
const texts = [
  ["--foreground", t("正文", "Body text"), 7],
  ["--muted-foreground", t("次要文字", "Secondary"), 4.5],
  ["--faint-foreground", t("元信息、占位", "Meta, placeholder"), 4.5],
  ["--primary", t("强调色", "Accent"), 3],
  ["--destructive", t("危险", "Danger"), 4.5],
  ["--success", t("成功", "Success"), 4.5],
  ["--warning", t("警告", "Warning"), 4.5],
  ["--info", t("信息", "Info"), 4.5],
] as const
const lines = [
  ["--border", t("细线：分割、卡片", "Hairline: dividers, cards")],
  ["--input", t("控件边框", "Control border")],
  ["--ring", t("焦点环", "Focus ring")],
] as const

export function ColorPage() {
  const all = [...surfaces.map((s) => s[0]), ...texts.map((x) => x[0]), ...lines.map((l) => l[0]), "--primary-foreground"]
  const c = useResolved(all)
  return (
    <DocPage
      title={t("颜色", "Color")}
      lead={t("黑白灰加一个强调色。颜色只表达语义。", "Grays plus one accent. Color only carries meaning.")}
      info={t(
        "强调色 = 主操作、当前、焦点；黄 = 需要你处理；红 = 失败或危险。",
        "Accent = primary action, current item, focus. Yellow = needs your attention. Red = failure or danger.",
      )}
      source="registry/jim/theme/jim-theme.css"
    >
      <Example
        title={t("表面与线", "Surfaces and lines")}
        info={t("层级靠表面明度区分，不靠阴影。", "Depth comes from surface lightness, not shadows.")}
        canvas="none"
      >
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
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
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

      <Example
        title={t("文字与对比度", "Text and contrast")}
        note={t("实时对比度：画布 / 下沉表面 · 门槛", "Live contrast on canvas / on sunken · minimum")}
        info={t("换主题或深浅色，数值跟着变。低于门槛时守卫测试失败。", "The numbers follow the current theme and mode. Below the minimum, the guard tests fail.")}
        canvas="none"
      >
        <div className="divide-y rounded-lg border">
          {texts.map(([v, label, min]) => {
            const r1 = ratio(c[v], c["--background"])
            const r2 = ratio(c[v], c["--sunken"])
            const ok = (r1 ?? 0) >= min && (v === "--primary" || (r2 ?? 0) >= min)
            return (
              <div key={v} className="flex items-center gap-4 px-4 py-3">
                <span className="w-32 shrink-0 text-body font-medium" style={{ color: `var(${v})` }}>
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
            <span className="w-32 shrink-0">
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-body font-medium text-primary-foreground">{t("主按钮", "Primary")}</span>
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
        title={t("分类色", "Categorical colors")}
        note={t("给用户选的颜色和图表系列用，不是第二个强调色。", "For colors users pick and for chart series. Never a second accent.")}
        info={t(
          "9 种，每种一对：fg 用于文字、圆点和柱子，-subtle 做标签底色；浅色、深色各一套，对比度由守卫检查。存名字（blue），不存色值。不用在按钮、链接和导航上。",
          "Nine, each a pair: fg for text, dots and bars; -subtle for tag fills. One set for light, one for dark, contrast checked by the guards. Store the name (blue), not the value. Not for buttons, links or navigation.",
        )}
        canvas="none"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {CATEGORICAL.map((name) => {
            const c = catClass(name)
            return (
              <div key={name} className="flex flex-col items-start gap-2 rounded-lg border p-3">
                <span className={cn("rounded-xs px-1.5 text-small font-medium", c.fill, c.fg)}>{t("标签", "Tag")}</span>
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
        title={t("预设与增强对比度", "Presets and contrast")}
        info={t(
          '中性色预设换整套灰（data-theme），强调色预设换唯一的强调色（data-accent），可以任意组合。没有红、绿、黄强调色：它们已经是危险、成功、需要处理。增强对比度跟随系统设置，也可以用 data-contrast="more" 强制。',
          'A neutral preset swaps every gray (data-theme); an accent preset swaps the one accent (data-accent). Any pair works. No red, green or yellow accent: those already mean danger, success and needs attention. More contrast follows the system setting, or force it with data-contrast="more".',
        )}
        canvas="none"
      >
        <Spec
          rows={[
            [t("中性色", "Neutral"), t("warm 暖灰 · slate 冷灰 · sage 灰绿 · mauve 灰紫；默认纯灰", "Warm · Slate · Sage · Mauve; default Gray")],
            [t("强调色", "Accent"), t("blue 蓝 · indigo 靛 · violet 紫 · pink 玫红 · teal 青；默认墨（= 正文色）", "Blue · Indigo · Violet · Pink · Teal; default Ink (the text color)")],
            [t("搭配", "Pairings"), t("蓝、靛配冷灰；紫、玫红配灰紫；青配灰绿", "Blue and Indigo with Slate; Violet and Pink with Mauve; Teal with Sage")],
            [t("增强对比度", "More contrast"), t("次要文字 ≥ 7:1，元信息 ≥ 5.5:1，控件边框 ≥ 3:1，焦点环 3px", "secondary text ≥ 7:1, meta ≥ 5.5:1, control borders ≥ 3:1, focus ring 3px")],
          ]}
        />
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <a href="#/studio">{t("打开主题工作室", "Open Theme studio")}</a>
        </Button>
      </Example>

      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={[
            t("只用语义类名：bg-background、text-muted-foreground、border-border", "Semantic classes only: bg-background, text-muted-foreground, border-border"),
            t("状态色同时配文字或图标", "Pair status colors with text or an icon"),
            t("需要新颜色时，先在主题里加语义 token", "Need a new color? Add a semantic token to the theme first"),
            t("填充色上的文字用配对的 *-foreground", "On a fill, use its paired *-foreground"),
          ]}
          donts={[
            // design-allow: 文档里列出的反例
            t("裸色值：#fff、rgb()、bg-white、text-gray-500、bg-red-500", "Raw values: #fff, rgb(), bg-white, text-gray-500, bg-red-500"),
            t("第二个强调色", "A second accent"),
            t("用强调色做大面积背景或正文颜色", "Accent as a large background or body text color"),
            t("品牌渐变", "Brand gradients"),
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- type ---------- */

const scale = [
  ["text-hero", "40 / 52", t("仅营销页", "Marketing pages only"), "font-semibold"],
  ["text-display", "28 / 40", t("数据大字、空页标题", "Big numbers, empty-page titles"), "font-semibold"],
  ["text-title-lg", "22 / 32", t("页面标题", "Page titles"), "font-semibold"],
  ["text-title", "18 / 26", t("弹框标题", "Dialog titles"), "font-semibold"],
  ["text-heading", "16 / 24", t("区块标题、抽屉标题", "Section and drawer titles"), "font-semibold"],
  ["text-reading", "16 / 26", t("长文阅读、触屏输入框", "Long-form text, touch inputs"), ""],
  ["text-body", "14 / 22", t("界面正文（默认）", "UI body (default)"), ""],
  ["text-small", "13 / 20", t("标签、表头、次要信息", "Labels, table headers, secondary info"), ""],
  ["text-caption", "12 / 18", t("说明、元信息；最小字号", "Captions, meta; the smallest size"), ""],
] as const

// The CJK specimen shows Chinese set with Latin and digits (Inter + PingFang, CJK line heights).
const specimens = { en: "Grow basil indoors 2026", zh: "种一盆罗勒 Basil 2026" } as const

export function TypePage() {
  const [specimen, setSpecimen] = React.useState<keyof typeof specimens>(lang)
  return (
    <DocPage
      title={t("文字", "Type")}
      lead={t("一个无衬线字族，9 级语义字号，最小 12px。", "One sans-serif family, nine semantic sizes, nothing under 12px.")}
      source={t("jim-theme.css 里的 --text-*", "--text-* in jim-theme.css")}
    >
      <Example
        title={t("字号阶梯", "Type scale")}
        info={t(
          "字体：Inter（含光学尺寸）+ 苹方。行高按中文定（≥ 1.4），中英混排也不挤。",
          "Fonts: Inter (with optical sizes), then PingFang for Chinese. Line heights are set for CJK (≥ 1.4), so mixed text never crowds.",
        )}
        canvas="none"
      >
        <Segmented<keyof typeof specimens>
          size="sm"
          aria-label={t("样张", "Specimen")}
          value={specimen}
          onValueChange={setSpecimen}
          options={t(
            [
              { value: "zh", label: "中文排版" },
              { value: "en", label: "英文" },
            ],
            [
              { value: "en", label: "English" },
              { value: "zh", label: "CJK specimen" },
            ],
          )}
        />
        <div className="mt-2 divide-y" lang={specimen === "zh" ? "zh-CN" : "en"}>
          {scale.map(([cls, size, use, weight]) => (
            <div key={cls} className="flex items-baseline gap-6 py-3 max-sm:flex-col max-sm:gap-1">
              <div className="w-48 shrink-0" lang={lang === "zh" ? "zh-CN" : "en"}>
                <code className="font-mono text-caption text-muted-foreground">{cls}</code>
                <div className="tabular text-caption text-faint-foreground">
                  {size} · {use}
                </div>
              </div>
              <div className={cn(cls, weight, "min-w-0 truncate")}>{specimens[specimen]}</div>
            </div>
          ))}
        </div>
      </Example>
      <Example title={t("字重", "Weights")} canvas="none">
        <Spec
          rows={[
            ["400", t("正文", "Body text")],
            ["500", <span className="font-medium">{t("标签、按钮、表头、强调一个词", "Labels, buttons, table headers, one stressed word")}</span>],
            ["600", <span className="font-semibold">{t("所有标题；界面里不用 700 以上", "All headings; nothing heavier in the UI")}</span>],
          ]}
        />
      </Example>
      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={[
            t("数字用 .tabular（等宽数字），右对齐", "Numbers use .tabular (fixed-width digits), right-aligned"),
            t("中文与英文、数字之间加一个空格", "In Chinese, a space between CJK and Latin or digits"),
            t("标题和按钮用句子大小写，不全大写", "Sentence case for titles and buttons, never all caps"),
            t("长文一行 ≤ 40 个汉字（约 680px）", "Long-form lines up to about 680px"),
          ]}
          donts={[
            // design-allow: 文档里列出的反例
            t("text-[11px] 这类任意字号", "Arbitrary sizes like text-[11px]"),
            t("小于 12px 的字", "Text under 12px"),
            t("同时加粗又变色来强调同一个词", "Bold and color on the same word"),
            t("居中对齐的长段落", "Centered long paragraphs"),
          ]}
        />
      </Example>
    </DocPage>
  )
}

/* ---------- shape ---------- */

const spacing: [number, string?][] = [
  [2],
  [4],
  [6],
  [8],
  [12, t("控件内边距", "Control padding")],
  [16, t("字段之间", "Between fields")],
  [20],
  [24],
  [32, t("区块之间", "Between sections")],
  [40],
  [48],
  [64],
]

const radii = [
  ["rounded-xs", t("复选框、标签", "Checkboxes, tags")],
  ["rounded-sm", t("徽章、菜单项", "Badges, menu items")],
  ["rounded-md", t("按钮、输入框", "Buttons, inputs")],
  ["rounded-lg", t("卡片、浮层、Toast", "Cards, popovers, toasts")],
  ["rounded-xl", t("弹框", "Dialogs")],
  ["rounded-2xl", t("底部弹层", "Bottom sheets")],
] as const

export function ShapePage() {
  return (
    <DocPage
      title={t("间距、圆角与层级", "Space, radius & elevation")}
      lead={t("4px 网格。卡片扁平，阴影只给浮层。", "A 4px grid. Cards stay flat; only floating layers get a shadow.")}
    >
      <Example
        title={t("间距刻度", "Spacing scale")}
        info={t(
          "只用这些值。页边距和区块、字段、卡片之间的距离随 data-spacing 一起缩放。",
          "Use only these. Page margins and the gaps between sections, fields and cards scale with data-spacing.",
        )}
        canvas="none"
      >
        <div className="flex flex-col gap-2">
          {spacing.map(([px, use]) => (
            <div key={px} className="flex items-center gap-4">
              <span className="tabular w-12 text-right text-small text-muted-foreground">{px}</span>
              <div className="h-3 rounded-xs bg-primary" style={{ width: px }} />
              {use && <span className="text-small text-muted-foreground">{use}</span>}
            </div>
          ))}
        </div>
      </Example>
      <Example
        title={t("圆角", "Radius")}
        info={t(
          "面越大，圆角越大。data-radius 按比例缩放整套：锐利 4 · 默认 8 · 圆润 12。",
          "Bigger surface, bigger radius. data-radius scales the whole set: Sharp 4 · Default 8 · Round 12.",
        )}
        canvas="none"
      >
        <div className="flex flex-wrap gap-4">
          {radii.map(([cls, use]) => (
            <div key={cls} className="flex w-32 flex-col gap-2">
              <div className={cn("h-16 border-2 border-input bg-sunken", cls)} />
              <code className="font-mono text-caption">{cls}</code>
              <span className="text-caption text-faint-foreground">{use}</span>
            </div>
          ))}
        </div>
      </Example>
      <Example title={t("层级", "Elevation")} canvas="sunken">
        <div className="flex flex-wrap gap-6">
          <div className="flex h-24 w-44 items-end rounded-lg border bg-background p-3 text-small">{t("卡片：1px 细线", "Card: 1px hairline")}</div>
          <div className="flex h-24 w-44 items-end rounded-lg bg-popover p-3 text-small shadow-popover">{t("shadow-popover：菜单、选择器", "shadow-popover: menus, pickers")}</div>
          <div className="flex h-24 w-44 items-end rounded-xl bg-popover p-3 text-small shadow-overlay">{t("shadow-overlay：弹框、抽屉", "shadow-overlay: dialogs, drawers")}</div>
        </div>
      </Example>
      <Example title={t("尺寸", "Sizes")} canvas="none">
        <Spec
          rows={[
            [t("控件高度", "Control height"), t("sm 28 · md 32 · lg 40（紧凑 24 · 28 · 36；触屏 36 · 44 · 48）", "sm 28 · md 32 · lg 40 (compact 24 · 28 · 36; touch 36 · 44 · 48)")],
            [t("表格", "Tables"), t("表头 36 · 行 44（紧凑 32 · 36）", "header 36 · row 44 (compact 32 · 36)")],
            [t("导航项", "Nav items"), t("30（触屏 40）", "30 (touch 40)")],
            [t("侧栏", "Sidebar"), t("240，收起 56", "240, collapsed 56")],
            [t("页面宽度", "Page width"), "narrow 720 · wide 1200 · full"],
            [t("图标", "Icons"), t("Lucide，描边 1.75；行内 14 · 按钮 16 · 标题 20", "Lucide, stroke 1.75; inline 14 · buttons 16 · titles 20")],
            [t("z 轴", "Z-index"), t("sticky 10 · float 40 · overlay 50 · toast 60；浮层之间按打开顺序叠放", "sticky 10 · float 40 · overlay 50 · toast 60; overlays stack in opening order")],
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
          {open ? t("全部关闭", "Close all") : t("全部打开", "Open all")}
        </Button>
        <label className="flex items-center gap-2 text-small">
          <Switch checked={slow} onCheckedChange={setSlow} />
          {t("慢放", "Slow")} ×{SLOW}
        </label>
        <label className="flex items-center gap-2 text-small">
          <Switch checked={reduced} onCheckedChange={setReduced} />
          {t("按「减少动效」播放", "Play with reduced motion")}
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
                  {t("弹框", "Dialog")}
                </div>
              </>
            )}
          </div>
          <figcaption className={caption}>{t("弹框：缩放 97% + 淡入 · 200 / 160ms", "Dialog: scale + fade · 200 / 160ms")}</figcaption>
        </figure>
        <figure>
          <div className={cn(frame, "p-3")}>
            <div className="inline-flex h-(--control-sm) items-center rounded-md border px-2.5 text-small">{t("菜单", "Menu")}</div>
            {menu.show && (
              <div
                data-state={menu.state}
                onAnimationEnd={menu.onAnimationEnd}
                className="mt-1 w-36 rounded-lg bg-popover p-1 text-small shadow-popover data-[state=open]:animate-drop-in data-[state=closed]:animate-drop-out"
              >
                {[t("重命名", "Rename"), t("复制链接", "Copy link"), t("删除", "Delete")].map((item) => (
                  <div key={item} className="rounded-sm px-2 py-1.5">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          <figcaption className={caption}>{t("菜单：下移 4px + 淡入 · 120ms", "Menu: drop 4px + fade · 120ms")}</figcaption>
        </figure>
        <figure>
          <div className={frame}>
            {drawer.show && (
              <div
                data-state={drawer.state}
                onAnimationEnd={drawer.onAnimationEnd}
                className="absolute inset-y-0 right-0 w-3/5 border-l bg-popover p-3 text-small shadow-overlay data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right"
              >
                {t("抽屉", "Drawer")}
              </div>
            )}
          </div>
          <figcaption className={caption}>{t("抽屉：从右滑入 · 240 / 160ms", "Drawer: slide in · 240 / 160ms")}</figcaption>
        </figure>
        <figure>
          <div className={frame}>
            {sheet.show && (
              <div
                data-state={sheet.state}
                onAnimationEnd={sheet.onAnimationEnd}
                className="absolute inset-x-0 bottom-0 h-3/5 rounded-t-2xl bg-popover p-3 text-small shadow-overlay data-[state=open]:animate-slide-in-up data-[state=closed]:animate-slide-out-down"
              >
                {t("底部弹层", "Bottom sheet")}
              </div>
            )}
          </div>
          <figcaption className={caption}>{t("底部弹层：从下滑入 · 240 / 160ms", "Bottom sheet: slide up · 240 / 160ms")}</figcaption>
        </figure>
      </div>
    </div>
  )
}

function CurveDemo() {
  const [end, setEnd] = React.useState(false)
  const rows: [string, string, string][] = [
    ["linear", "ease-linear", t("匀速：不用，显得机械", "Not used: feels mechanical")],
    ["ease-out", "ease-out", t("进入：起步快，慢慢停下", "Enter: starts fast, settles slowly")],
    ["ease-in", "ease-in", t("退出：慢慢起步，快速离开", "Exit: starts slow, leaves fast")],
    ["ease-drawer", "ease-drawer", t("抽屉、底部弹层：更长的减速尾巴", "Drawers, sheets: a longer settle")],
  ]
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button onClick={() => setEnd((e) => !e)}>{t("播放", "Play")}</Button>
      </div>
      {rows.map(([name, ease, note]) => (
        <div key={name} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[7rem_minmax(0,1fr)_14rem]">
          <code className="text-small">{name}</code>
          <div className="relative h-4 rounded-full bg-muted">
            <span
              // design-allow: slowed to 1s on purpose so the curves can be compared
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
    <DocPage
      title={t("动效", "Motion")}
      lead={t("动效只解释状态变化，不装饰。", "Motion explains a change of state. It never decorates.")}
      info={t(
        "交代从哪来、到哪去、发生了什么。不循环，进行中的转圈除外。",
        "Where something came from, where it went, what happened. No loops, except a spinner while work runs.",
      )}
    >
      <Example
        title={t("进入与退出", "Enter and exit")}
        note={t("正常速度下位移很小，是故意的：只交代方向。", "Movement is small at normal speed on purpose: it only shows direction.")}
        info={t(
          "和组件用的是同一组 token。系统打开「减少动效」时，位移和缩放归零，只保留淡入淡出。",
          "The same tokens the components use. With reduced motion on, movement and scaling drop out; fades stay.",
        )}
        canvas="sunken"
      >
        <MotionDemo />
      </Example>
      <Example
        title={t("曲线", "Curves")}
        note={t("放慢到 1 秒，方便比较。", "Slowed to 1 second so they can be compared.")}
        info={
          <div className="flex flex-col gap-1">
            <span>{t("不用弹跳曲线。", "No bounce curves.")}</span>
            <code className="font-mono text-caption">ease-out cubic-bezier(.22, 1, .36, 1)</code>
            <code className="font-mono text-caption">ease-in cubic-bezier(.4, 0, 1, 1)</code>
            <code className="font-mono text-caption">ease-drawer cubic-bezier(.32, .72, 0, 1)</code>
          </div>
        }
        canvas="sunken"
      >
        <CurveDemo />
      </Example>
      <Example
        title={t("时长", "Durations")}
        info={t("按下：触屏 scale .97，桌面用按下态填充色。", "Press: scale .97 on touch; a pressed fill on desktop.")}
        canvas="none"
      >
        <Spec
          rows={[
            ["fast 120ms", t("悬停、按下、开关；菜单、选择器的进出", "Hover, press, switches; menus and pickers in and out")],
            ["base 200ms", t("弹框进入", "Dialogs entering")],
            ["slow 240ms", t("抽屉、底部弹层进入", "Drawers and bottom sheets entering")],
            ["exit 160ms", t("弹框、抽屉、底部弹层退出", "Dialogs, drawers and sheets leaving")],
            [t("默认", "Default"), t("没写时长和曲线的过渡：fast + ease-out", "A transition with no duration or curve: fast + ease-out")],
          ]}
        />
      </Example>
      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={[
            t("列表新增项淡入；删除项淡出后再收起", "New list items fade in; removed ones fade out, then collapse"),
            t("数字变化直接跳到新值", "Numbers jump straight to the new value"),
            t("进行中才转圈，完成即停", "Spin only while working; stop when done"),
          ]}
          donts={[
            t("视差、滚动劫持", "Parallax, scroll hijacking"),
            t("入场时整页依次飞入", "Pages flying in piece by piece"),
            t("装饰性循环、粒子、彩带", "Decorative loops, particles, confetti"),
            t("用计时器推进的动画", "Animations driven by timers"),
          ]}
        />
      </Example>
    </DocPage>
  )
}
