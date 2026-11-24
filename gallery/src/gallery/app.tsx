import * as React from "react"
import {
  BookOpen,
  Images,
  Languages,
  LayoutTemplate,
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
  RefreshCw,
  SwatchBook,
} from "lucide-react"
import { LucideProvider } from "lucide-react"
import { setAppearance, resolveAppearance, getAppearance } from "@/registry/jim/lib/appearance"
import { AppShell, NavGroup, NavItem } from "@/registry/jim/ui/app-shell"
import { CommandGroup, CommandItem, CommandPalette, useCommandPalette } from "@/registry/jim/ui/command-palette"
import { ReleaseNotesDialog, useNewVersionPrompt, useReleaseNotes } from "@/registry/jim/ui/release-notes"
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
import { UpdatesPattern } from "./pages/updates"
import { StudioPage } from "./pages/studio"
import { LayoutsPage } from "./pages/layouts"
import { kitReleases, RELEASES_URL } from "./changelog"
import { lang, setLang, t } from "./i18n"
import { IconButton } from "@/registry/jim/ui/button"
import { Wordmark } from "./logo"

/**
 * `nav`: the sidebar item this page lights up when it isn't one itself (the media grid is a view
 * of 列表; filters is an old link). Pages without `nav` are the sidebar.
 */
type RouteDef = { label: string; icon: React.ReactNode; page: React.ComponentType; group: string; fill?: boolean; nav?: string }

const G = { root: "", base: t("基础", "Foundations"), parts: t("组件", "Components"), pages: t("页面", "Pages") }

const routes: Record<string, RouteDef> = {
  principles: { label: t("原则", "Principles"), icon: <BookOpen />, page: PrinciplesPage, group: G.root },
  studio: { label: t("主题工作室", "Theme studio"), icon: <SwatchBook />, page: StudioPage, group: G.root },
  color: { label: t("颜色", "Color"), icon: <Palette />, page: ColorPage, group: G.base },
  type: { label: t("文字", "Type"), icon: <Type />, page: TypePage, group: G.base },
  shape: { label: t("间距与圆角", "Space & radius"), icon: <Square />, page: ShapePage, group: G.base },
  motion: { label: t("动效", "Motion"), icon: <Sparkles />, page: MotionPage, group: G.base },
  buttons: { label: t("按钮", "Buttons"), icon: <MousePointerClick />, page: ButtonsPage, group: G.parts },
  forms: { label: t("表单", "Forms"), icon: <TextCursorInput />, page: FormsPage, group: G.parts },
  overlays: { label: t("弹层", "Overlays"), icon: <Layers />, page: OverlaysPage, group: G.parts },
  feedback: { label: t("反馈", "Feedback"), icon: <MessageSquare />, page: FeedbackPage, group: G.parts },
  data: { label: t("数据", "Data"), icon: <Component />, page: DataDisplayPage, group: G.parts },
  layouts: { label: t("页面布局", "Layouts"), icon: <LayoutTemplate />, page: LayoutsPage, group: G.pages },
  crud: { label: t("列表", "Lists"), icon: <Table2 />, page: CrudPattern, group: G.pages, fill: true },
  media: { label: t("列表 · 网格", "Lists · grid"), icon: <Images />, page: MediaGridPattern, group: G.pages, nav: "crud" },
  filters: { label: t("列表", "Lists"), icon: <ListFilter />, page: CrudPattern, group: G.pages, fill: true, nav: "crud" },
  settings: { label: t("设置", "Settings"), icon: <Settings />, page: SettingsPattern, group: G.pages },
  workbench: { label: t("工作台", "Workbench"), icon: <PanelsTopLeft />, page: WorkbenchPattern, group: G.pages, fill: true },
  updates: { label: t("版本更新", "Updates"), icon: <RefreshCw />, page: UpdatesPattern, group: G.pages },
}

/** 中 / EN next to the theme knobs: saves the choice and reloads in the other language. */
function LanguageSwitch() {
  return (
    <IconButton
      // the name is the visible text (WCAG 2.5.3); the tooltip says what it does
      label={t("EN", "中文")}
      tooltip={t("Switch to English", "切换到中文")}
      size="icon-sm"
      variant="ghost"
      className="shrink-0 text-caption font-medium text-muted-foreground"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
    >
      {t("EN", "中文")}
    </IconButton>
  )
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
  // the gallery follows its own pattern: what changed since your last visit, and a newer deploy
  const notes = useReleaseNotes({ version: __JIM_UIUX_VERSION__, releases: kitReleases, storageKey: "jim-uiux:gallery:seen" })
  useNewVersionPrompt({ current: import.meta.env.PROD ? __JIM_UIUX_COMMIT__ : null })

  React.useEffect(() => {
    document.title = `${route.label} · jim-uiux`
  }, [route])

  return (
    <LucideProvider strokeWidth={1.75}>
      <TooltipProvider>
        <AppShell
          brand={
            <span className="text-body font-semibold">
              {/* 19 units tall, 5 of them below the baseline: sit on the text baseline */}
              <Wordmark className="mr-1 inline h-[1.2em] w-auto align-[-0.316em]" />{" "}
              <button
                type="button"
                onClick={notes.openAll}
                title={t("更新内容", "What's new")}
                className="rounded-sm text-caption font-normal text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                v{__JIM_UIUX_VERSION__}
              </button>
            </span>
          }
          footer={
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <ThemeKnobs />
              </div>
              <LanguageSwitch />
            </div>
          }
          sidebar={groups.map((g) => (
            <NavGroup key={g || "root"} label={g || undefined}>
              {Object.entries(routes)
                .filter(([, r]) => r.group === g && !r.nav)
                .map(([k, r]) => (
                  <NavItem key={k} href={`#/${k}`} icon={r.icon} label={r.label} active={k === key || route.nav === k} />
                ))}
            </NavGroup>
          ))}
        >
          <div key={key} className={route.fill ? "h-full" : undefined}>
            <Page />
          </div>
        </AppShell>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} placeholder={t("搜索页面或命令", "Search pages or commands")}>
          {groups.map((g) => (
            <CommandGroup key={g || "root"} heading={g || t("开始", "Start")}>
              {Object.entries(routes)
                .filter(([k, r]) => r.group === g && k !== "filters")
                .map(([k, r]) => (
                  <CommandItem key={k} icon={r.icon} value={`${r.label} ${k}`} onSelect={() => (window.location.hash = `#/${k}`)}>
                    {r.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
          <CommandGroup heading={t("操作", "Actions")}>
            <CommandItem
              icon={<Moon />}
              keywords={["dark", "light", "深色", "浅色"]}
              onSelect={() => setAppearance(resolveAppearance(getAppearance()) === "dark" ? "light" : "dark")}
            >
              {t("切换深浅色", "Toggle dark mode")}
            </CommandItem>
            <CommandItem icon={<Languages />} keywords={["language", "English", "中文", "语言"]} onSelect={() => setLang(lang === "en" ? "zh" : "en")}>
              {t("Switch to English", "切换到中文")}
            </CommandItem>
          </CommandGroup>
        </CommandPalette>
        <Toaster />
        <ReleaseNotesDialog {...notes.dialog} moreHref={RELEASES_URL} />
      </TooltipProvider>
    </LucideProvider>
  )
}
