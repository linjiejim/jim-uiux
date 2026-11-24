import { Palette, SwatchBook } from "lucide-react"
import { useAppearance, type Appearance } from "@/registry/jim/lib/appearance"
import { Button } from "@/registry/jim/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"
import { Segmented } from "@/registry/jim/ui/segmented"
import { SwatchPicker } from "@/registry/jim/ui/swatch-picker"
import { t } from "./i18n"
import { ACCENT_LABELS, NEUTRAL_LABELS } from "./studio/meta"
import { ACCENT_PRESETS, NEUTRAL_PRESETS, resetStudio, setStudio, useStudio } from "./studio/store"
import { accentSwatch, neutralSwatch } from "./studio/swatches"
import { isDefault } from "./studio/theme-gen"

/*
 * The sidebar's quick knobs: appearance and the shipped presets. Same state as the theme
 * studio (studio/store.ts); anything finer — tint, contrast, radius, a custom accent — is there.
 */
export function ThemeKnobs() {
  const { preference, setAppearance, resolved } = useAppearance()
  const { state } = useStudio()
  const dark = resolved === "dark"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Palette />
          {t("主题与旋钮", "Theme")}
          {!isDefault(state) && <span aria-label={t("已自定义", "Customized")} className="ml-auto size-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80">
        <div className="flex flex-col gap-4">
          <Knob label={t("外观", "Appearance")}>
            <Segmented<Appearance>
              size="sm"
              aria-label={t("外观", "Appearance")}
              value={preference}
              onValueChange={setAppearance}
              options={[
                { value: "system", label: t("跟随系统", "System") },
                { value: "light", label: t("浅色", "Light") },
                { value: "dark", label: t("深色", "Dark") },
              ]}
            />
          </Knob>
          <Knob label={t("中性色", "Neutral")}>
            <SwatchPicker
              size="sm"
              aria-label={t("中性色", "Neutral")}
              value={state.neutral || "gray"}
              onValueChange={(v) => setStudio({ neutral: v === "gray" ? "" : v })}
              options={[
                ...["", ...NEUTRAL_PRESETS, ...(state.neutral === "custom" ? ["custom"] : [])].map((p) => ({
                  value: p || "gray",
                  label: NEUTRAL_LABELS[p] ?? p,
                  color: neutralSwatch(p, state, dark),
                })),
              ]}
            />
          </Knob>
          <Knob label={t("强调色", "Accent")}>
            <SwatchPicker
              size="sm"
              aria-label={t("强调色", "Accent")}
              value={state.accent || "ink"}
              onValueChange={(v) => setStudio({ accent: v === "ink" ? "" : v })}
              options={[
                ...["", ...ACCENT_PRESETS, ...(state.accent === "custom" ? ["custom"] : [])].map((p) => ({
                  value: p || "ink",
                  label: ACCENT_LABELS[p] ?? p,
                  color: accentSwatch(p, state, dark),
                })),
              ]}
            />
          </Knob>
          <Knob label={t("密度", "Density")}>
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
          </Knob>
          <div className="flex items-center gap-2 border-t pt-3">
            <Button asChild variant="secondary" size="sm">
              <a href="#/studio">
                <SwatchBook />
                {t("主题工作室", "Theme studio")}
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={resetStudio} disabled={isDefault(state)}>
              {t("恢复默认", "Reset")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Knob({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-faint-foreground">{label}</span>
      {children}
    </div>
  )
}
