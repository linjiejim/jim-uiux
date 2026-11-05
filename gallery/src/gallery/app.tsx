import * as React from "react"
import {
  BookOpen,
  Images,
  Moon,
  PanelsTopLeft,
  Component,
  Layers,
  ListFilter,
  MessageSquare,
  MousePointerClick,
  Palette,
  Settings,
  Sparkles,
  Table2,
  TextCursorInput,
  Type,
  Square,
} from "lucide-react"
import { LucideProvider } from "lucide-react"
import { setAppearance, resolveAppearance, getAppearance } from "@/registry/jim/lib/appearance"
import { AppShell, NavGroup, NavItem } from "@/registry/jim/ui/app-shell"
import { CommandGroup, CommandItem, CommandPalette, useCommandPalette } from "@/registry/jim/ui/command-palette"
import { Toaster } from "@/registry/jim/ui/toast"
import { TooltipProvider } from "@/registry/jim/ui/tooltip"
import { ThemeKnobs } from "./knobs"
import { PrinciplesPage } from "./pages/principles"
import { ColorPage, MotionPage, ShapePage, TypePage } from "./pages/foundations"
import { ButtonsPage } from "./pages/buttons"
import { FormsPage } from "./pages/forms"
import { OverlaysPage } from "./pages/overlays"
import { FeedbackPage } from "./pages/feedback"
import { DataDisplayPage } from "./pages/data-display"
import { CrudPattern } from "./pages/crud"
import { SettingsPattern } from "./pages/settings-pattern"
import { WorkbenchPattern } from "./pages/workbench"
import { MediaGridPattern } from "./pages/media-grid"

type RouteDef = { label: string; icon: React.ReactNode; page: React.ComponentType; group: string; fill?: boolean }

const routes: Record<string, RouteDef> = {
  principles: { label: "原则", icon: <BookOpen />, page: PrinciplesPage, group: "" },
  color: { label: "颜色", icon: <Palette />, page: ColorPage, group: "基础" },
  type: { label: "文字", icon: <Type />, page: TypePage, group: "基础" },
  shape: { label: "间距、圆角与层级", icon: <Square />, page: ShapePage, group: "基础" },
  motion: { label: "动效", icon: <Sparkles />, page: MotionPage, group: "基础" },
  buttons: { label: "按钮", icon: <MousePointerClick />, page: ButtonsPage, group: "组件" },
  forms: { label: "表单", icon: <TextCursorInput />, page: FormsPage, group: "组件" },
  overlays: { label: "弹层", icon: <Layers />, page: OverlaysPage, group: "组件" },
  feedback: { label: "反馈与状态", icon: <MessageSquare />, page: FeedbackPage, group: "组件" },
  data: { label: "数据展示", icon: <Component />, page: DataDisplayPage, group: "组件" },
  crud: { label: "列表与 CRUD", icon: <Table2 />, page: CrudPattern, group: "模式", fill: true },
  filters: { label: "列表筛选", icon: <ListFilter />, page: CrudPattern, group: "模式", fill: true },
  settings: { label: "设置页", icon: <Settings />, page: SettingsPattern, group: "模式" },
  workbench: { label: "工作台外壳", icon: <PanelsTopLeft />, page: WorkbenchPattern, group: "模式", fill: true },
  media: { label: "分面筛选与媒体网格", icon: <Images />, page: MediaGridPattern, group: "模式" },
}

function useRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, "").split("?")[0] || "principles"
  return React.useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb)
      return () => window.removeEventListener("hashchange", cb)
    },
    get,
    () => "principles",
  )
}

export function App() {
  const key = useRoute()
  const route = routes[key] ?? routes.principles
  const Page = route.page
  const groups = [...new Set(Object.values(routes).map((r) => r.group))]
  const [paletteOpen, setPaletteOpen] = useCommandPalette()

  React.useEffect(() => {
    document.title = `${route.label} · jim-uiux`
  }, [route])

  return (
    <LucideProvider strokeWidth={1.75}>
      <TooltipProvider>
        <AppShell
          brand={
            <span className="text-body font-semibold">
              jim-uiux <span className="text-caption font-normal text-muted-foreground">v{__JIM_UIUX_VERSION__}</span>
            </span>
          }
          footer={<ThemeKnobs />}
          sidebar={groups.map((g) => (
            <NavGroup key={g || "root"} label={g || undefined}>
              {Object.entries(routes)
                .filter(([k, r]) => r.group === g && k !== "filters")
                .map(([k, r]) => (
                  <NavItem key={k} href={`#/${k}`} icon={r.icon} label={r.label} active={k === key || (key === "filters" && k === "crud")} />
                ))}
            </NavGroup>
          ))}
        >
          <div key={key} className={route.fill ? "h-full" : undefined}>
            <Page />
          </div>
        </AppShell>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} placeholder="搜索页面或命令">
          {groups.map((g) => (
            <CommandGroup key={g || "root"} heading={g || "开始"}>
              {Object.entries(routes)
                .filter(([k, r]) => r.group === g && k !== "filters")
                .map(([k, r]) => (
                  <CommandItem key={k} icon={r.icon} value={`${r.label} ${k}`} onSelect={() => (window.location.hash = `#/${k}`)}>
                    {r.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="操作">
            <CommandItem
              icon={<Moon />}
              keywords={["dark", "light", "深色", "浅色"]}
              onSelect={() => setAppearance(resolveAppearance(getAppearance()) === "dark" ? "light" : "dark")}
            >
              切换深浅色
            </CommandItem>
          </CommandGroup>
        </CommandPalette>
        <Toaster />
      </TooltipProvider>
    </LucideProvider>
  )
}
