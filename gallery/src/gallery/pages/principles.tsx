import { Button } from "@/registry/jim/ui/button"
import { DocPage, Example, Spec } from "../doc"
import { t } from "../i18n"

const principles = [
  [t("简洁直观", "Simple and direct"), t("一屏一个重点。能删的先删，能替用户定的就不让用户选。", "One focus per screen. Cut what you can; decide for the user where you can.")],
  [t("可用性先于好看", "Usable before pretty"), t("触控 44px，对比度 AA，键盘可达，颜色不是唯一信号。", "44px touch targets, AA contrast, keyboard reachable, never color alone.")],
  [t("必要的反馈", "Feedback that matters"), t("按下有状态，等待有进度。看得见的结果不再弹提示。", "Every press responds, every wait shows progress. A visible result needs no toast.")],
  [t("简约的动效", "Quiet motion"), t("动效只解释状态变化：120–240ms，ease-out，不弹跳。", "Motion only explains a change: 120–240ms, ease-out, no bounce.")],
  [t("文案精简", "Lean copy"), t("按钮写动词加对象，提示一句话，报错说人话。", "Buttons are a verb plus an object. Hints are one sentence. Errors are plain words.")],
  [t("信息不过载", "No overload"), t("表格默认 ≤ 6 列，筛选 ≤ 4 个，每页最多一个横幅。", "Tables start at 6 columns or fewer, filters at 4, one banner per page at most.")],
  [t("扁平克制", "Flat and restrained"), t("黑白灰加一个强调色。卡片用细线，阴影只给浮层。", "Grays plus one accent. Cards get a hairline; only floating layers get a shadow.")],
  [t("一致胜过新奇", "Consistent over novel"), t("同一个意图用同一个组件，尺寸取自刻度。", "One intent, one component. Sizes come from the scale.")],
]

const Attr = ({ children }: { children: string }) => <code className="mr-2 font-mono text-small text-muted-foreground">{children}</code>

export function PrinciplesPage() {
  return (
    <DocPage title={t("原则", "Principles")} lead={t("一套已经定好的默认：值、组件、交互模式，直接用。", "Decided defaults: values, components and patterns, ready to use.")}>
      <section className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {principles.map(([name, d], i) => (
          <div key={name} className="flex gap-3">
            <span className="tabular w-5 shrink-0 text-body text-faint-foreground">{i + 1}</span>
            <div>
              <h2 className="text-heading font-semibold">{name}</h2>
              <p className="mt-1 text-body text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <Example
        title={t("只有这些可以定制", "Only these can be customized")}
        info={t(
          "其余（字号、动效、状态色、交互模式）都锁定。左下角「主题与旋钮」切预设；主题工作室细调每一项、校验对比度并导出 CSS。",
          "Everything else (type sizes, motion, status colors, patterns) is fixed. Theme, at the bottom left, switches presets; the Theme studio fine-tunes every knob, checks contrast and exports CSS.",
        )}
        canvas="none"
      >
        <Spec
          rows={[
            [t("强调色", "Accent"), <><Attr>data-accent</Attr>{t("墨（默认）· 蓝 · 靛 · 紫 · 玫红 · 青", "Ink (default) · Blue · Indigo · Violet · Pink · Teal")}</>],
            [t("中性色", "Neutral"), <><Attr>data-theme</Attr>{t("纯灰（默认）· 暖灰 · 冷灰 · 灰绿 · 灰紫", "Gray (default) · Warm · Slate · Sage · Mauve")}</>],
            [t("圆角", "Radius"), <><Attr>data-radius</Attr>{t("锐利 4 · 默认 8 · 圆润 12", "Sharp 4 · Default 8 · Round 12")}</>],
            [t("密度", "Density"), <><Attr>data-density</Attr>{t("舒适 · 紧凑（触屏控件始终 ≥ 44px）", "Comfortable · Compact (touch controls stay ≥ 44px)")}</>],
            [t("留白", "Spacing"), <><Attr>data-spacing</Attr>{t("紧凑 · 标准 · 宽松", "Compact · Standard · Relaxed")}</>],
            [t("对比度", "Contrast"), <><Attr>data-contrast="more"</Attr>{t("或跟随系统「增强对比度」；工作室里调「层次」", "or the system's More contrast; Separation in the Theme studio")}</>],
            [t("字体", "Fonts"), <><Attr>--font-sans · --font-display</Attr>{t("默认 Inter + 苹方", "default Inter + PingFang")}</>],
            [t("外观", "Appearance"), t("跟随系统 · 浅色 · 深色", "System · Light · Dark")],
          ]}
        />
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <a href="#/studio">{t("打开主题工作室", "Open Theme studio")}</a>
        </Button>
      </Example>

      <Example title={t("决策速查", "Quick decisions")} canvas="none">
        <Spec
          rows={[
            [t("查看、编辑、新建列表里的对象", "View, edit or create a list item"), t("右侧 Drawer，原位编辑", "Drawer from the right, edit in place")],
            [t("不属于列表对象的短任务", "A short task outside a list"), t("Dialog（手机上从底部升起）", "Dialog (rises from the bottom on phones)")],
            [t("不可逆操作", "Irreversible action"), t("ConfirmDialog，按钮重复动词", "ConfirmDialog; the button repeats the verb")],
            [t("可逆操作", "Reversible action"), t("直接执行，Toast 给「撤销」", "Do it, then a toast with Undo")],
            [t("2–4 个视图切换", "Switching 2–4 views"), t("Segmented；页面分区用 Tabs", "Segmented; Tabs for page sections")],
            [t("选项 ≤ 8 个", "Up to 8 options"), t("Select；更多用 Combobox", "Select; Combobox beyond that")],
            [t("错误", "Errors"), t("就地显示加「重试」，不用会自动消失的 Toast", "Shown in place with Retry, never a toast that fades away")],
            [t("加载", "Loading"), t("300ms 后才出骨架，至少显示 600ms；按钮里用小转圈", "Skeleton after 300ms, shown for at least 600ms; a spinner inside buttons")],
          ]}
        />
      </Example>
    </DocPage>
  )
}
