import { DocPage, Example, Spec } from "../doc"

const principles = [
  ["简洁直观", "一屏一个重点。能删的元素先删，能用默认值替用户决定的就不让用户选。"],
  ["可用性先于好看", "触控 44px，对比度 AA，键盘可达，颜色永远不是唯一信号。"],
  ["必要的反馈", "每个操作都有回应：按下有状态，等待有进度，结果看得见。看得见的结果不再弹提示。"],
  ["简约的动效", "动效只解释状态变化。120–240ms，一条 ease-out 曲线，不弹跳，不装饰。"],
  ["文案精简", "按钮写动词加对象，提示一句话，报错说人话。页面标题下不写解释句。"],
  ["信息不过载", "表格默认 ≤ 6 列，筛选 ≤ 4 个，每页最多一个横幅。卡片只包真实的分组。"],
  ["扁平克制", "黑白灰加一个强调色。卡片用细线，不用阴影；阴影只给浮起来的层。"],
  ["一致胜过新奇", "同一个意图永远用同一个组件。尺寸取自刻度，页面里不发明新值。"],
]

export function PrinciplesPage() {
  return (
    <DocPage title="原则" lead="jim-uiux 是一套默认决策：值、组件和交互模式都已经定好，做项目时直接用，不再逐个打磨。">
      <section className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {principles.map(([t, d], i) => (
          <div key={t} className="flex gap-3">
            <span className="tabular w-5 shrink-0 text-body text-faint-foreground">{i + 1}</span>
            <div>
              <h2 className="text-heading font-semibold">{t}</h2>
              <p className="mt-1 text-body text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <Example title="可以定制的，只有这些" note="其余的值（间距、字号、动效、状态色语义、交互模式）全部锁定。左下角「主题与旋钮」可以实时切换。" canvas="none">
        <Spec
          rows={[
            ["强调色", "--primary / --primary-foreground，默认黑色。整套界面只有这一个强调色。"],
            ["中性色调", "预设：默认纯灰、暖灰（Notion 风）。"],
            ["圆角", "data-radius：锐利 4 / 默认 8 / 圆润 12，整套比例一起缩放。"],
            ["密度", "data-density：舒适 / 紧凑。触屏下控件始终 ≥ 44px。"],
            ["字体", "--font-sans / --font-display。默认 Inter + 苹方。"],
            ["默认外观", "跟随系统 / 浅色 / 深色，存的是偏好本身。"],
          ]}
        />
      </Example>

      <Example title="决策速查" canvas="none">
        <Spec
          rows={[
            ["列表对象的查看、编辑、新建", "右侧 Drawer，原位编辑，位置不变"],
            ["不属于列表对象的短任务", "Dialog（手机上从底部升起）"],
            ["不可逆操作", "ConfirmDialog，按钮重复动词"],
            ["可逆操作", "直接执行，Toast 给「撤销」"],
            ["2–4 个视图切换", "Segmented；页面分区用 Tabs"],
            ["选项 ≤ 8 个", "Select；更多用 Combobox"],
            ["错误", "就地显示加「重试」，不用会自动消失的 Toast"],
            ["加载", "300ms 后才出骨架，出现至少 600ms；按钮里用小转圈"],
          ]}
        />
      </Example>
    </DocPage>
  )
}
