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
import { Info } from "@/registry/jim/ui/info"
import { Input } from "@/registry/jim/ui/input"
import { Page, PageHeader } from "@/registry/jim/ui/page"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Slider } from "@/registry/jim/ui/slider"
import { SwatchPicker } from "@/registry/jim/ui/swatch-picker"
import { Switch } from "@/registry/jim/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { t } from "../i18n"
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
      const token = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("t")
      if (!token) return
      const s = decodeState(token)
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
        title={t("主题工作室", "Theme studio")}
        info={t(
          "调好的皮肤整个 gallery 实时换上；每个颜色都按守卫的对比度门槛校验，导出的就是通过校验的这份 CSS。只在设计时用，产品里不给用户换皮肤。",
          "The whole gallery wears the skin while it's set. Every color is checked against the guard's contrast floors, and the CSS you export is the one that passed. A design-time tool: products don't get a skin picker.",
        )}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={resetStudio} disabled={isDefault(state)}>
              <RotateCcw />
              {t("恢复默认", "Reset")}
            </Button>
            <CopyButton value={link} label={t("复制链接", "Copy link")} />
            <Button variant="primary" size="sm" onClick={() => download(css)}>
              <Download />
              {t("下载 CSS", "Download CSS")}
            </Button>
          </>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside aria-label={t("主题设置", "Theme settings")} className="flex flex-col gap-7 lg:sticky lg:top-6 lg:self-start">
          <Controls state={state} dark={dark} more={more} />
          <ContrastSummary generated={generated} />
        </aside>
        <Tabs defaultValue="preview" className="min-w-0">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">{t("预览", "Preview")}</TabsTrigger>
            <TabsTrigger value="contrast">{t("对比度", "Contrast")}</TabsTrigger>
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
      <Group title={t("颜色", "Color")}>
        <Field label={t("中性色", "Neutral")}>
          <SwatchPicker
            value={state.neutral || "gray"}
            onValueChange={(v) => setStudio({ neutral: v === "gray" ? "" : v })}
            options={neutralOptions}
          />
        </Field>
        {state.neutral === "custom" && (
          <div className="-mt-2 flex flex-col gap-3 rounded-md bg-sunken p-3">
            <Field label={t("色相", "Hue")}>
              <Slider value={state.hue} onValueChange={(hue) => setStudio({ hue })} min={0} max={360} step={5} format={(v) => `${v}°`} />
            </Field>
            <Field label={t("浓度", "Chroma")}>
              <Slider
                value={Math.round(state.chroma * 1000)}
                onValueChange={(v) => setStudio({ chroma: v / 1000 })}
                min={0}
                max={40}
                format={(v) => (v ? String(v) : t("无", "None"))}
              />
            </Field>
          </div>
        )}
        <Field
          label={t("强调色", "Accent")}
          hint={pair && pair !== state.neutral ? t(`和「${NEUTRAL_LABELS[pair]}」中性色最搭`, `Pairs best with ${NEUTRAL_LABELS[pair]}`) : undefined}
        >
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
            {t(`强调色和「${clash}」太接近，主按钮和状态会分不清。`, `Too close to ${clash}: primary buttons and statuses will look alike.`)}
          </Callout>
        )}
      </Group>

      <Group title={t("对比度", "Contrast")}>
        <Field
          label={t("层次", "Separation")}
          info={t(
            "柔和收紧表面、细线和文字之间的差距，高则拉开；文字始终不低于门槛。",
            "Soft brings surfaces, lines and text closer; high pulls them apart. Text never drops below its floor.",
          )}
        >
          <Slider
            value={state.contrast}
            onValueChange={(contrast) => setStudio({ contrast })}
            min={-100}
            max={100}
            step={10}
            format={contrastName}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <label htmlFor="studio-more" className="text-body">
              {t("增强对比度", "More contrast")}
            </label>
            <Info>
              {t(
                "预览系统打开「增强对比度」时的样子；用户那边自动生效，不用另外导出。",
                "Previews the system's Increase contrast setting. It applies on its own for users; nothing extra to export.",
              )}
            </Info>
          </span>
          <Switch id="studio-more" checked={more} onCheckedChange={setMoreContrast} />
        </div>
      </Group>

      <Group title={t("形状与间距", "Shape & spacing")}>
        <Field label={t("圆角", "Radius")}>
          <Slider value={state.radius} onValueChange={(radius) => setStudio({ radius })} min={0} max={16} step={2} format={(v) => `${v}px`} />
        </Field>
        <Field
          label={t("密度", "Density")}
          info={t("控件和表格行的高度；触屏上始终 ≥ 44px。", "Height of controls and table rows. Always ≥ 44px on touch screens.")}
        >
          <Segmented
            size="sm"
            aria-label={t("密度", "Density")}
            value={state.density || "comfortable"}
            onValueChange={(v) => setStudio({ density: v === "compact" ? "compact" : "" })}
            options={[
              { value: "comfortable", label: t("舒适", "Comfortable") },
              { value: "compact", label: t("紧凑", "Compact") },
            ]}
          />
        </Field>
        <Field
          label={t("留白", "Spacing")}
          info={t("页边距、区块之间、字段之间和卡片内边距。", "Page margins, gaps between sections and fields, card padding.")}
        >
          <Segmented
            size="sm"
            aria-label={t("留白", "Spacing")}
            value={state.spacing || "default"}
            onValueChange={(v) => setStudio({ spacing: v === "compact" || v === "relaxed" ? v : "" })}
            options={[
              { value: "compact", label: t("紧凑", "Compact") },
              { value: "default", label: t("标准", "Standard") },
              { value: "relaxed", label: t("宽松", "Relaxed") },
            ]}
          />
        </Field>
        <Field label={t("字体", "Font")}>
          <Segmented
            size="sm"
            aria-label={t("字体", "Font")}
            value={state.font || "inter"}
            onValueChange={(v) => setStudio({ font: v === "system" ? "system" : "" })}
            options={[
              { value: "inter", label: "Inter" },
              { value: "system", label: t("系统字体", "System") },
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
        <span className="sr-only">{t("选择颜色", "Pick a color")}</span>
        <input
          type="color"
          value={value || "#000000"} // design-allow: the native colour input needs a starting value
          onChange={(e) => setStudio({ accentColor: e.target.value })}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <Input
        aria-label={t("颜色值", "Color value")}
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
  ["light", t("浅色", "Light")],
  ["dark", t("深色", "Dark")],
  ["lightMore", t("浅色 · 增强对比度", "Light · more contrast")],
  ["darkMore", t("深色 · 增强对比度", "Dark · more contrast")],
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
      <div className="flex items-center gap-1.5">
        <span className={cn("flex items-center gap-1.5 font-medium", failed ? "text-destructive" : "text-success")}>
          {failed ? <TriangleAlert className="size-4" /> : <Check className="size-4" />}
          {failed ? t(`${failed} 项对比度不达标`, `${failed} contrast checks fail`) : t(`对比度 ${total} 项全部达标`, `All ${total} contrast checks pass`)}
        </span>
        <Info>
          {t(
            "浅色、深色和增强对比度下的正文、次要文字、强调色、状态色和分类色，各按守卫的门槛算一遍。",
            "Text, muted text, accent, status and categorical colors, each against the guard's floor in light, dark and more contrast.",
          )}
        </Info>
      </div>
      {moved.length > 0 && (
        <p className="text-muted-foreground">
          {t(`为达标自动调整了：${moved.map(tokenLabel).join("、")}`, `Adjusted to pass: ${moved.map(tokenLabel).join(", ")}`)}
        </p>
      )}
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
                  <th className="px-3 font-medium">{t("前景", "Foreground")}</th>
                  <th className="px-3 font-medium">{t("背景", "Background")}</th>
                  <th className="px-3 text-right font-medium">{t("对比度 / 门槛", "Ratio / floor")}</th>
                  <th className="w-10 px-3">
                    <span className="sr-only">{t("结果", "Result")}</span>
                  </th>
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
  const color = (token: string) => {
    try {
      return formatHex(resolveColor(`var(${token})`, decls))
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
        {c.ok ? (
          <Check aria-label={t("达标", "Pass")} className="size-4 text-success" />
        ) : (
          <TriangleAlert aria-label={t("不达标", "Fail")} className="size-4 text-destructive" />
        )}
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
        <div className="flex flex-1 flex-wrap items-center gap-x-1.5 text-body text-muted-foreground">
          <span>
            {t(<>在 {code("jim-theme.css")} 之后引入</>, <>Import it after {code("jim-theme.css")}</>)}
            {attrs && t(<>，并给 {code("<html>")} 加上 {code(attrs)}</>, <>, and set {code(attrs)} on {code("<html>")}</>)}
            {t("。", ".")}
          </span>
          <Info>
            {t(
              "存成 src/styles/<项目>-theme.css，再加进 design-guard.config.json 的 themeFiles，守卫按它算对比度。密度和留白不写进 CSS：触屏的 44px 下限和手机的页边距靠 <html> 上的这两个属性。",
              "Save it as src/styles/<project>-theme.css and add it to themeFiles in design-guard.config.json, so the guard checks its contrast. Density and spacing stay out of the CSS: the 44px touch minimum and phone margins hang on those two <html> attributes.",
            )}
          </Info>
        </div>
        <CopyButton value={css} label={t("复制 CSS", "Copy CSS")} />
      </div>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-sunken p-4 font-mono text-small leading-relaxed">{css}</pre>
    </div>
  )
}

const code = (text: string) => <code className="font-mono text-small">{text}</code>

/** The contrast slider's value in words: 标准 / 高 30 / 柔和 30. */
function contrastName(v: number) {
  return v === 0 ? t("标准", "Standard") : v > 0 ? t(`高 ${v}`, `High ${v}`) : t(`柔和 ${-v}`, `Soft ${-v}`)
}

function exportComment(s: StudioState, link: string) {
  const neutral = NEUTRAL_LABELS[s.neutral] ?? s.neutral
  const chroma = Math.round(s.chroma * 1000)
  const parts = [
    t(
      `中性色 ${neutral}${s.neutral === "custom" ? `（色相 ${s.hue}°，浓度 ${chroma}）` : ""}`,
      `Neutral ${neutral}${s.neutral === "custom" ? ` (hue ${s.hue}°, chroma ${chroma})` : ""}`,
    ),
    `${t("强调色", "Accent")} ${ACCENT_LABELS[s.accent] ?? s.accent}${s.accent === "custom" ? ` ${s.accentColor}` : ""}`,
    `${t("对比度", "Contrast")} ${contrastName(s.contrast)}`,
    `${t("圆角", "Radius")} ${s.radius}`,
    s.font === "system" ? t("系统字体", "System font") : "Inter",
  ]
  return [
    t(`jim-uiux 皮肤，由主题工作室生成（jim-uiux ${__JIM_UIUX_VERSION__}）`, `jim-uiux skin, made in the theme studio (jim-uiux ${__JIM_UIUX_VERSION__})`),
    parts.join(" · "),
    t(
      "在 jim-theme.css 之后引入；加进 design-guard.config.json 的 themeFiles，守卫按它算对比度。",
      "Import after jim-theme.css; add it to themeFiles in design-guard.config.json so the guard checks its contrast.",
    ),
    ...(s.density || s.spacing
      ? [`<html ${[s.density && `data-density="${s.density}"`, s.spacing && `data-spacing="${s.spacing}"`].filter(Boolean).join(" ")}>`]
      : []),
    `${t("再次打开：", "Reopen: ")}${link}`,
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
  for (const token of ["--destructive", "--success", "--warning"]) {
    const st = toOklch(resolveColor(`var(${token})`, decls))
    const d = Math.abs((((accent.h ?? 0) - (st.h ?? 0) + 540) % 360) - 180)
    if (d < 25) return tokenLabel(token)
  }
  return null
}
