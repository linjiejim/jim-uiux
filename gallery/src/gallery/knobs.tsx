import * as React from "react"
import { Palette } from "lucide-react"
import { useAppearance, type Appearance } from "@/registry/jim/lib/appearance"
import { Button } from "@/registry/jim/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"
import { Segmented } from "@/registry/jim/ui/segmented"

type Knobs = { theme: string; radius: string; density: string }
const KEY = "gallery:knobs"

function read(): Knobs {
  try {
    return { theme: "", radius: "", density: "", ...JSON.parse(localStorage.getItem(KEY) || "{}") }
  } catch {
    return { theme: "", radius: "", density: "" }
  }
}

export function ThemeKnobs() {
  const { preference, setAppearance } = useAppearance()
  const [k, setK] = React.useState<Knobs>(read)

  const set = (patch: Partial<Knobs>) => {
    const next = { ...k, ...patch }
    setK(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    for (const [name, v] of Object.entries(next)) {
      if (v) document.documentElement.setAttribute(`data-${name}`, v)
      else document.documentElement.removeAttribute(`data-${name}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          <Palette />
          主题与旋钮
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80">
        <div className="flex flex-col gap-4">
          <Knob label="外观">
            <Segmented<Appearance>
              size="sm"
              value={preference}
              onValueChange={setAppearance}
              options={[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
              ]}
            />
          </Knob>
          <Knob label="预设">
            <Segmented
              size="sm"
              value={k.theme || "default"}
              onValueChange={(v) => set({ theme: v === "default" ? "" : v })}
              options={[
                { value: "default", label: "默认黑白" },
                { value: "warm", label: "暖灰" },
              ]}
            />
          </Knob>
          <Knob label="圆角">
            <Segmented
              size="sm"
              value={k.radius || "default"}
              onValueChange={(v) => set({ radius: v === "default" ? "" : v })}
              options={[
                { value: "sharp", label: "锐利 4" },
                { value: "default", label: "默认 8" },
                { value: "round", label: "圆润 12" },
              ]}
            />
          </Knob>
          <Knob label="密度">
            <Segmented
              size="sm"
              value={k.density || "default"}
              onValueChange={(v) => set({ density: v === "default" ? "" : v })}
              options={[
                { value: "default", label: "舒适" },
                { value: "compact", label: "紧凑" },
              ]}
            />
          </Knob>
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
