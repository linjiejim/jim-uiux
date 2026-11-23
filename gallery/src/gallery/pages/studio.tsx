import * as React from "react"
import { Check, Download, RotateCcw, TriangleAlert } from "lucide-react"
import { converter, formatHex, parse } from "culori"
import { cn } from "@/lib/utils"
import { checkContrast, composeScope, resolveColor, rulesFor, type Check as ContrastCheck, type Decls } from "@/registry/jim/guards/contrast-lib"
import { useAppearance } from "@/registry/jim/lib/appearance"
import { Button } from "@/registry/jim/ui/button"
import { Callout } from "@/registry/jim/ui/callout"
import { CopyButton } from "@/registry/jim/ui/copy-button"
import { Field } from "@/registry/jim/ui/field"
import { Input } from "@/registry/jim/ui/input"
import { Page, PageHeader } from "@/registry/jim/ui/page"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Slider } from "@/registry/jim/ui/slider"
import { SwatchPicker } from "@/registry/jim/ui/swatch-picker"
import { Switch } from "@/registry/jim/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { ACCENT_LABELS, NEUTRAL_LABELS, PAIRING, tokenLabel } from "../studio/meta"
import { StudioPreview } from "../studio/preview"
import { accentSwatch, neutralSwatch } from "../studio/swatches"
import { ACCENT_PRESETS, BLOCKS, NEUTRAL_PRESETS, decodeState, encodeState, resetStudio, setMoreContrast, setStudio, useStudio } from "../studio/store"
import { isDefault, toCss, type Generated, type StudioState } from "../studio/theme-gen"

const toOklch = converter("oklch")

/*
 * Theme studio: tune a skin on the real components, see every contrast floor it meets, and take
 * the CSS. The whole gallery wears the result while it is set, so any page is a preview.
 * A design-time tool: products don't get a skin picker (principles「不做的事」).
 */
export function StudioPage() {
  const { state, generated, more } = useStudio()
  const { resolved } = useAppearance()
  const dark = resolved === "dark"

  // #/studio?t=… opens a shared skin, also when pasted while the studio is already open
  React.useEffect(() => {
    const open = () => {
      const t = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("t")
      if (!t) return
      const s = decodeState(t)
      if (s) setStudio(s)
      window.history.replaceState(null, "", "#/studio")
    }
    open()
    window.addEventListener("hashchange", open)
    return () => window.removeEventListener("hashchange", open)
  }, [])

  const link = `${window.location.origin}${window.location.pathname}#/studio?t=${encodeState(state)}`
  const css = toCss(generated, exportComment(state, link))

  return (
    <Page width="full">
      <PageHeader
        title="主题工作室"
        info="调中性色、强调色、对比度、圆角、密度和字体，整个 gallery 实时换上；每一项都按守卫的对比度门槛校验，导出的 CSS 就是通过校验的这一份。只在设计时用：产品里不给用户换皮肤。"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={resetStudio} disabled={isDefault(state)}>
              <RotateCcw />
              恢复默认
            </Button>
            <CopyButton value={link} label="复制链接" />
            <Button variant="primary" size="sm" onClick={() => download(css)}>
              <Download />
              下载 CSS
            </Button>
          </>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside aria-label="主题设置" className="flex flex-col gap-7 lg:sticky lg:top-6 lg:self-start">
          <Controls state={state} dark={dark} more={more} />
          <ContrastSummary generated={generated} />
        </aside>
        <Tabs defaultValue="preview" className="min-w-0">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="contrast">对比度</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <StudioPreview />
          </TabsContent>
          <TabsContent value="contrast">
            <ContrastReport generated={generated} />
          </TabsContent>
          <TabsContent value="css">
            <ExportCss css={css} state={state} />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  )
}

/* ---------- controls ---------- */

function Controls({ state, dark, more }: { state: StudioState; dark: boolean; more: boolean }) {
  const neutralOptions = ["", ...NEUTRAL_PRESETS, "custom"].map((v) => ({
    value: v || "gray",
    label: NEUTRAL_LABELS[v] ?? v,
    color: neutralSwatch(v, state, dark),
  }))
  const accentOptions = ["", ...ACCENT_PRESETS, "custom"].map((v) => ({
    value: v || "ink",
    label: ACCENT_LABELS[v] ?? v,
    color: accentSwatch(v, state, dark),
  }))
  const clash = accentClash(state)
  const pair = state.accent && PAIRING[state.accent]
  return (
    <>
      <Group title="颜色">
        <Field label="中性色">
          <SwatchPicker
            value={state.neutral || "gray"}
            onValueChange={(v) => setStudio({ neutral: v === "gray" ? "" : v })}
            options={neutralOptions}
          />
        </Field>
        {state.neutral === "custom" && (
          <div className="-mt-2 flex flex-col gap-3 rounded-md bg-sunken p-3">
            <Field label="色相">
              <Slider value={state.hue} onValueChange={(hue) => setStudio({ hue })} min={0} max={360} step={5} format={(v) => `${v}°`} />
            </Field>
            <Field label="浓度">
              <Slider
                value={Math.round(state.chroma * 1000)}
                onValueChange={(v) => setStudio({ chroma: v / 1000 })}
                min={0}
                max={40}
                format={(v) => (v ? String(v) : "无")}
              />
            </Field>
          </div>
        )}
        <Field label="强调色" hint={pair && pair !== state.neutral ? `和「${NEUTRAL_LABELS[pair]}」中性色最搭` : undefined}>
          <SwatchPicker
            value={state.accent || "ink"}
            onValueChange={(v) => {
              const accent = v === "ink" ? "" : v
              // a custom accent starts from whatever is on screen
              const accentColor = accent === "custom" && !state.accentColor ? currentPrimary() : state.accentColor
              setStudio({ accent, accentColor })
            }}
            options={accentOptions}
          />
        </Field>
        {state.accent === "custom" && <CustomAccent value={state.accentColor} />}
        {clash && (
          <Callout tone="warning" icon={<TriangleAlert />}>
            强调色和「{clash}」的颜色很接近：主按钮和状态会分不清。
          </Callout>
        )}
      </Group>

      <Group title="对比度">
        <Field label="层次" hint="柔和收紧表面、细线和文字之间的差距，高则拉开；文字始终不低于门槛。">
          <Slider
            value={state.contrast}
            onValueChange={(contrast) => setStudio({ contrast })}
            min={-100}
            max={100}
            step={10}
            format={(v) => (v === 0 ? "标准" : v > 0 ? `高 ${v}` : `柔和 ${-v}`)}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="studio-more" className="text-body">
            预览「增强对比度」
          </label>
          <Switch id="studio-more" checked={more} onCheckedChange={setMoreContrast} />
        </div>
      </Group>

      <Group title="形状与间距">
        <Field label="圆角">
          <Slider value={state.radius} onValueChange={(radius) => setStudio({ radius })} min={0} max={16} step={2} format={(v) => `${v}px`} />
        </Field>
        <Field label="控件密度" hint="控件和表格行的高度；触屏上始终 ≥ 44px。">
          <Segmented
            size="sm"
            aria-label="控件密度"
            value={state.density || "comfortable"}
            onValueChange={(v) => setStudio({ density: v === "compact" ? "compact" : "" })}
            options={[
              { value: "comfortable", label: "舒适" },
              { value: "compact", label: "紧凑" },
            ]}
          />
        </Field>
        <Field label="版面留白" hint="页边距、区块之间、字段之间和卡片内边距。">
          <Segmented
            size="sm"
            aria-label="版面留白"
            value={state.spacing || "default"}
            onValueChange={(v) => setStudio({ spacing: v === "compact" || v === "relaxed" ? v : "" })}
            options={[
              { value: "compact", label: "紧凑" },
              { value: "default", label: "标准" },
              { value: "relaxed", label: "宽松" },
            ]}
          />
        </Field>
        <Field label="字体">
          <Segmented
            size="sm"
            aria-label="字体"
            value={state.font || "inter"}
            onValueChange={(v) => setStudio({ font: v === "system" ? "system" : "" })}
            options={[
              { value: "inter", label: "Inter" },
              { value: "system", label: "系统字体" },
            ]}
          />
        </Field>
      </Group>
    </>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function CustomAccent({ value }: { value: string }) {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])
  const commit = (v: string) => {
    const c = parse(v.trim())
    if (c) setStudio({ accentColor: formatHex(c) })
    else setDraft(value)
  }
  return (
    <div className="-mt-2 flex items-center gap-2 rounded-md bg-sunken p-3">
      <label
        className="relative size-(--control-md) shrink-0 overflow-hidden rounded-md border border-input has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
        style={{ background: value }}
      >
        <span className="sr-only">选择颜色</span>
        <input
          type="color"
          value={value || "#000000"} // design-allow: the native colour input needs a starting value
          onChange={(e) => setStudio({ accentColor: e.target.value })}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <Input
        aria-label="颜色值"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
        className="font-mono"
        spellCheck={false}
      />
    </div>
  )
}

/* ---------- contrast ---------- */

const SCOPES = [
  ["light", "浅色"],
  ["dark", "深色"],
  ["lightMore", "浅色 · 增强对比度"],
  ["darkMore", "深色 · 增强对比度"],
] as const

function useChecks(generated: Generated) {
  return React.useMemo(
    () =>
      SCOPES.map(([key, label]) => {
        const decls = generated.scopes[key]
        return { key, label, checks: checkContrast(decls, rulesFor(decls, key.endsWith("More"))) }
      }),
    [generated],
  )
}

function ContrastSummary({ generated }: { generated: Generated }) {
  const groups = useChecks(generated)
  const total = groups.reduce((n, g) => n + g.checks.length, 0)
  const failed = groups.reduce((n, g) => n + g.checks.filter((c) => !c.ok).length, 0)
  const moved = [...new Set([...generated.adjusted.light, ...generated.adjusted.dark])]
  return (
    <div className="flex flex-col gap-1.5 border-t pt-4 text-small">
      <div className={cn("flex items-center gap-1.5 font-medium", failed ? "text-destructive" : "text-success")}>
        {failed ? <TriangleAlert className="size-4" /> : <Check className="size-4" />}
        {failed ? `${failed} 项对比度不达标` : `对比度 ${total} 项全部达标`}
      </div>
      <p className="text-muted-foreground">
        {moved.length ? `为达标自动调整了：${moved.map(tokenLabel).join("、")}。` : "浅色、深色和增强对比度下，文字、强调色、状态色、分类色都过了门槛。"}
      </p>
    </div>
  )
}

function ContrastReport({ generated }: { generated: Generated }) {
  const groups = useChecks(generated)
  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      {groups.map((g) => (
        <section key={g.key} className="min-w-0">
          <h3 className="mb-2 text-heading font-semibold">{g.label}</h3>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-small">
              <thead className="bg-sunken text-left text-muted-foreground">
                <tr className="h-(--row-head-h)">
                  <th className="px-3 font-medium">文字 / 图形</th>
                  <th className="px-3 font-medium">底</th>
                  <th className="px-3 text-right font-medium">对比度</th>
                  <th className="w-10 px-3" />
                </tr>
              </thead>
              <tbody>
                {g.checks.map((c, i) => (
                  <CheckRow key={i} c={c} decls={generated.scopes[g.key]} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

function CheckRow({ c, decls }: { c: ContrastCheck; decls: Decls }) {
  const color = (t: string) => {
    try {
      return formatHex(resolveColor(`var(${t})`, decls))
    } catch {
      return undefined
    }
  }
  return (
    <tr className="h-9 border-t">
      <td className="px-3">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-border" style={{ background: color(c.fg) }} />
          {tokenLabel(c.fg)}
        </span>
      </td>
      <td className="px-3 text-muted-foreground">{tokenLabel(c.bg)}</td>
      <td className="tabular whitespace-nowrap px-3 text-right">
        {c.ratio.toFixed(2)} <span className="text-faint-foreground">/ {c.min}</span>
      </td>
      <td className="px-3">
        {c.ok ? <Check aria-label="达标" className="size-4 text-success" /> : <TriangleAlert aria-label="不达标" className="size-4 text-destructive" />}
      </td>
    </tr>
  )
}

/* ---------- export ---------- */

function ExportCss({ css, state }: { css: string; state: StudioState }) {
  const attrs = [state.density && `data-density="${state.density}"`, state.spacing && `data-spacing="${state.spacing}"`].filter(Boolean).join(" ")
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 text-body text-muted-foreground">
          存成 <code className="font-mono text-small">src/styles/&lt;项目&gt;-theme.css</code>，在 jim-theme.css 之后引入，再加进 design-guard.config.json 的 themeFiles。
          {attrs && ` 密度和留白是 <html ${attrs}>，不写进 CSS（触屏的 44px 下限、手机的页边距靠它们）。`}
        </p>
        <CopyButton value={css} label="复制 CSS" />
      </div>
      <pre className="max-h-[560px] overflow-auto rounded-lg border bg-sunken p-4 font-mono text-small leading-relaxed">{css}</pre>
    </div>
  )
}

function exportComment(s: StudioState, link: string) {
  const parts = [
    `中性色 ${NEUTRAL_LABELS[s.neutral] ?? s.neutral}${s.neutral === "custom" ? `（色相 ${s.hue}°，浓度 ${Math.round(s.chroma * 1000)}）` : ""}`,
    `强调色 ${ACCENT_LABELS[s.accent] ?? s.accent}${s.accent === "custom" ? ` ${s.accentColor}` : ""}`,
    `对比度 ${s.contrast === 0 ? "标准" : s.contrast > 0 ? `高 ${s.contrast}` : `柔和 ${-s.contrast}`}`,
    `圆角 ${s.radius}`,
    s.font === "system" ? "系统字体" : "Inter",
  ]
  return [
    `jim-uiux 皮肤，由主题工作室生成（jim-uiux ${__JIM_UIUX_VERSION__}）`,
    parts.join(" · "),
    "在 jim-theme.css 之后引入；加进 design-guard.config.json 的 themeFiles，守卫按它算对比度。",
    ...(s.density || s.spacing
      ? [`<html ${[s.density && `data-density="${s.density}"`, s.spacing && `data-spacing="${s.spacing}"`].filter(Boolean).join(" ")}>`]
      : []),
    `再次打开：${link}`,
  ].join("\n")
}

function download(css: string) {
  const url = URL.createObjectURL(new Blob([css], { type: "text/css" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "jim-skin.css"
  a.click()
  URL.revokeObjectURL(url)
}

function currentPrimary() {
  const probe = document.createElement("div")
  probe.style.color = "var(--primary)"
  document.body.appendChild(probe)
  const c = parse(getComputedStyle(probe).color)
  probe.remove()
  return c ? formatHex(c) : ""
}

/** The status a custom or preset accent would be mistaken for: hue within 25° and clearly coloured. */
function accentClash(s: StudioState): string | null {
  if (!s.accent) return null
  const decls = composeScope(BLOCKS, { accent: s.accent === "custom" ? undefined : s.accent })
  const accent = toOklch(s.accent === "custom" ? (parse(s.accentColor) ?? resolveColor("var(--primary)", decls)) : resolveColor("var(--primary)", decls))
  if ((accent.c ?? 0) < 0.06) return null
  for (const [token, label] of [
    ["--destructive", "危险"],
    ["--success", "成功"],
    ["--warning", "警告"],
  ] as const) {
    const st = toOklch(resolveColor(`var(${token})`, decls))
    const d = Math.abs((((accent.h ?? 0) - (st.h ?? 0) + 540) % 360) - 180)
    if (d < 25) return label
  }
  return null
}
