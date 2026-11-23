import { Palette, SwatchBook } from "lucide-react"
import { useAppearance, type Appearance } from "@/registry/jim/lib/appearance"
import { Button } from "@/registry/jim/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"
import { Segmented } from "@/registry/jim/ui/segmented"
import { SwatchPicker } from "@/registry/jim/ui/swatch-picker"
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
          主题与旋钮
          {!isDefault(state) && <span aria-label="已自定义" className="ml-auto size-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80">
        <div className="flex flex-col gap-4">
          <Knob label="外观">
            <Segmented<Appearance>
              size="sm"
              aria-label="外观"
              value={preference}
              onValueChange={setAppearance}
              options={[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
              ]}
            />
          </Knob>
          <Knob label="中性色">
            <SwatchPicker
              size="sm"
              aria-label="中性色"
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
          <Knob label="强调色">
            <SwatchPicker
              size="sm"
              aria-label="强调色"
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
          <Knob label="密度">
            <Segmented
              size="sm"
              aria-label="密度"
              value={state.density || "comfortable"}
              onValueChange={(v) => setStudio({ density: v === "compact" ? "compact" : "" })}
              options={[
                { value: "comfortable", label: "舒适" },
                { value: "compact", label: "紧凑" },
              ]}
            />
          </Knob>
          <div className="flex items-center gap-2 border-t pt-3">
            <Button asChild variant="secondary" size="sm">
              <a href="#/studio">
                <SwatchBook />
                主题工作室
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={resetStudio} disabled={isDefault(state)}>
              恢复默认
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
