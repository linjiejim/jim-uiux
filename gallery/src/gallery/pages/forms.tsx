import * as React from "react"
import { Button } from "@/registry/jim/ui/button"
import { Checkbox } from "@/registry/jim/ui/checkbox"
import { Combobox, type ComboOption } from "@/registry/jim/ui/combobox"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Input, Textarea } from "@/registry/jim/ui/input"
import { RadioGroup } from "@/registry/jim/ui/radio-group"
import { Select } from "@/registry/jim/ui/select"
import { Slider } from "@/registry/jim/ui/slider"
import { SwatchPicker, categoricalOptions } from "@/registry/jim/ui/swatch-picker"
import { Switch } from "@/registry/jim/ui/switch"
import { notify } from "@/registry/jim/ui/toast"
import { DocPage, Example, Rules, Spec } from "../doc"
import { t } from "../i18n"

const cities = t(
  ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "重庆", "苏州", "厦门", "青岛", "长沙"],
  ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Hangzhou", "Chengdu", "Wuhan", "Nanjing", "Xi'an", "Chongqing", "Suzhou", "Xiamen", "Qingdao", "Changsha"],
).map((c) => ({ value: c, label: c }))

export function FormsPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({})
  const [saving, setSaving] = React.useState(false)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const emailRef = React.useRef<HTMLInputElement>(null)

  const validateEmail = (v: string) =>
    v && !/^\S+@\S+\.\S+$/.test(v) ? t("邮箱格式不对，例如 name@example.com", "Enter an email like name@example.com") : undefined

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = { name: name.trim() ? undefined : t("请填写项目名称", "Enter a project name"), email: validateEmail(email) }
    setErrors(next)
    if (next.name) return nameRef.current?.focus()
    if (next.email) return emailRef.current?.focus()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      notify.success(t("项目已创建", "Project created"))
    }, 1000)
  }

  return (
    <DocPage
      title={t("表单", "Forms")}
      lead={t("标签在上，一列排布。", "Labels on top, one column.")}
      source="registry/jim/ui/field.tsx · input.tsx · select.tsx · combobox.tsx"
    >
      <Example
        title={t("完整示例", "Full example")}
        note={t("直接点「创建项目」，或填错邮箱后离开输入框。", "Click “Create project” as is, or type a bad email and leave the field.")}
        info={t(
          "离开字段时校验，改正后立即清除错误；提交时全部校验，焦点移到第一个错误。",
          "Fields check when you leave them and clear as soon as they're fixed. Submitting checks everything and moves focus to the first error.",
        )}
      >
        <form onSubmit={submit} noValidate className="max-w-md">
          <FieldGroup>
            <Field label={t("项目名称", "Project name")} required error={errors.name}>
              <Input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name && setErrors((x) => ({ ...x, name: undefined }))} />
            </Field>
            <Field label={t("负责人邮箱", "Owner email")} hint={t("用于接收进度通知", "For progress updates")} error={errors.email}>
              <Input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setErrors((x) => ({ ...x, email: validateEmail(email) }))} />
            </Field>
            <Field
              label={t("类型", "Type")}
              info={t("类型决定默认的看板列和提醒规则，创建后可以在设置里修改。", "Sets the default board columns and reminders. You can change it later in settings.")}
            >
              <Select
                defaultValue="product"
                options={[
                  { value: "product", label: t("产品研发", "Product") },
                  { value: "marketing", label: t("市场活动", "Marketing") },
                  { value: "ops", label: t("运营", "Operations") },
                ]}
              />
            </Field>
            <Field label={t("可见范围", "Visibility")}>
              <RadioGroup
                defaultValue="team"
                options={[
                  { value: "private", label: t("仅自己", "Only me") },
                  { value: "team", label: t("团队成员", "Team"), description: t("团队里的人都能查看和评论", "Anyone on the team can view and comment") },
                  { value: "public", label: t("公开", "Public"), description: t("拿到链接的人都能查看", "Anyone with the link can view") },
                ]}
              />
            </Field>
            <Field label={t("城市", "City")}>
              <Combobox options={cities} />
            </Field>
            <Field label={t("描述", "Description")}>
              <Textarea placeholder={t("一两句话说明目标", "The goal in a sentence or two")} />
            </Field>
            <label className="flex items-center gap-2 text-body">
              <Checkbox defaultChecked />
              {t("创建后通知团队成员", "Notify the team when it's created")}
            </label>
          </FieldGroup>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button">{t("取消", "Cancel")}</Button>
            <Button type="submit" variant="primary" loading={saving}>
              {t("创建项目", "Create project")}
            </Button>
          </div>
        </form>
      </Example>

      <Example title={t("控件状态", "States")}>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label={t("默认", "Default")}>
            <Input placeholder={t("例如：官网改版", "e.g. Website redesign")} />
          </Field>
          <Field label={t("只读", "Read-only")} hint={t("可以复制，不能修改", "Can copy, can't edit")}>
            <Input readOnly value="P-1024" />
          </Field>
          <Field label={t("禁用", "Disabled")}>
            <Input disabled value={t("不可编辑", "Not editable")} />
          </Field>
          <Field label={t("出错", "Error")} error={t("名称已被占用，换一个", "That name is taken. Try another.")}>
            <Input defaultValue={t("官网改版", "Website redesign")} />
          </Field>
        </div>
      </Example>

      <Example
        title={t("开关与复选框", "Switches and checkboxes")}
        note={t("开关立即生效；点「保存」才生效的用复选框。", "A switch applies at once; a checkbox waits for Save.")}
      >
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-body">
            <Switch defaultChecked />
            {t("新工单提醒", "New ticket alerts")}
          </label>
          <label className="flex items-center gap-3 text-body">
            <Checkbox />
            {t("同时删除关联的文件", "Also delete linked files")}
          </label>
        </div>
      </Example>

      <Example
        title={t("多选", "Multiple")}
        note={t("「成员」从服务器搜索：输入「错」看失败和重试，输入「无」看没有结果。", "Members searches a server: type “fail” to see an error and retry, or “xyz” for no results.")}
        info={t(
          "已选的是标签，一行放不下收成「+N」。菜单开着可以连续选，重新打开时已选的排在最前。搜索框为空时按 Backspace 删掉最后一个。",
          "Picks show as chips on one line; the rest collapse into “+N”. The menu stays open for picking several, and picks come first when it reopens. Backspace in an empty search removes the last one.",
        )}
      >
        <MultiSelects />
      </Example>

      <Example
        title={t("滑杆与色块", "Sliders and swatches")}
        note={t("方向键都能用。", "Arrow keys work on both.")}
        info={t(
          "滑杆用于手感比精确数字更重要的数值，拖动时只改界面，要存的值在 onValueCommit 里存。色块从固定的一组颜色里选一个：标签、项目色用九种分类色，存名字。",
          "Use a slider when feel matters more than an exact number. Dragging only updates the UI; save in onValueCommit. Swatches pick from a fixed set: tag and project colors use the nine categorical colors and store the name.",
        )}
      >
        <SliderAndSwatches />
      </Example>

      <Example title={t("规格", "Spec")} canvas="none">
        <Spec
          rows={t<[string, string][]>(
            [
              ["标签", "字段上方，13px / 500；必填标红色 *"],
              ["说明", "字段下方一行，12px；更长的放进 ⓘ"],
              ["错误", "替换说明，红色加图标，说清怎么改"],
              ["校验时机", "离开字段时校验，改正时立即清除；提交时全部校验"],
              ["选择控件", "2–4 项切换视图用 Segmented；≤ 8 项用 Select；更多用 Combobox"],
              ["多选", "Combobox multiple；标签只占一行，放不下收成「+N」；服务器搜索停顿 250ms 再查"],
              ["滑杆", "轨道 4、滑块 16（触屏 20，点击区 44）；读数在右，写单位；← → 一步，PageUp / PageDown 十步"],
              ["色块", "24（sm 20），选中的加一圈环；一组只占一个 Tab 位，方向键移动；每个都有名字"],
              ["字段间距", "16；分组之间 32"],
              ["表单宽度", "单列，最宽 480"],
              ["提交", "按钮显示加载并禁用；成功后结果可见就不再提示"],
            ],
            [
              ["Label", "Above the field, 13px / 500; required gets a red *"],
              ["Hint", "One line below, 12px; anything longer goes in ⓘ"],
              ["Error", "Replaces the hint, red with an icon, says how to fix it"],
              ["Validation", "On leaving a field, cleared as soon as it's fixed; everything on submit"],
              ["Pickers", "2–4 views: Segmented; ≤ 8 options: Select; more: Combobox"],
              ["Multiple", "Combobox multiple; chips on one line, overflow as “+N”; server search waits 250ms"],
              ["Slider", "Track 4, thumb 16 (touch 20, hit area 44); readout on the right with its unit; ← → one step, PageUp / PageDown ten"],
              ["Swatches", "24 (sm 20), a ring on the selected one; one Tab stop, arrows move; each has a name"],
              ["Field spacing", "16; 32 between groups"],
              ["Form width", "One column, 480 at most"],
              ["Submit", "The button shows loading and disables; no toast when the result is visible"],
            ],
          )}
        />
      </Example>
      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={t(
            ["一列表单，从上到下", "错误说清怎么改", "给默认值，减少必填项", "筛选和查看模式不标 *"],
            ["One column, top to bottom", "Errors say how to fix them", "Defaults over required fields", "No * on filters or read-only views"],
          )}
          donts={t(
            ["用占位文字代替标签", "输入时每敲一个字就报错", "错误码、技术术语", "双列表单（除非是成对的起止日期）"],
            ["Placeholders as labels", "Errors on every keystroke", "Error codes or jargon", "Two columns (except a start–end date pair)"],
          )}
        />
      </Example>
    </DocPage>
  )
}

function SliderAndSwatches() {
  const [radius, setRadius] = React.useState(8)
  const [volume, setVolume] = React.useState(40)
  const [color, setColor] = React.useState("teal")
  return (
    <FieldGroup className="max-w-[400px]">
      <Field label={t("提醒音量", "Alert volume")}>
        <Slider value={volume} onValueChange={setVolume} format={(v) => (v ? `${v}%` : t("静音", "Muted"))} />
      </Field>
      <Field label={t("圆角", "Corner radius")}>
        <Slider value={radius} onValueChange={setRadius} min={0} max={16} step={2} format={(v) => `${v}px`} />
      </Field>
      <Field label={t("项目颜色", "Project color")}>
        <SwatchPicker value={color} onValueChange={setColor} options={categoricalOptions()} />
      </Field>
    </FieldGroup>
  )
}

const tagLabels = t(
  ["设计", "前端", "后端", "测试", "运维", "产品", "数据", "安全", "移动端", "文档", "增长", "客服"],
  ["Design", "Frontend", "Backend", "QA", "Ops", "Product", "Data", "Security", "Mobile", "Docs", "Growth", "Support"],
)
const tagOptions: ComboOption[] = tagLabels.map((l) => ({ value: l, label: l }))

const people: ComboOption[] = t(
  [
    ["林佳", "设计"],
    ["王浩", "前端"],
    ["陈思远", "后端"],
    ["赵敏", "产品"],
    ["周宁", "测试"],
    ["吴昊", "运维"],
    ["郑雨", "数据"],
    ["孙悦", "设计"],
    ["钱多多", "增长"],
    ["李想", "前端"],
    ["何静", "客服"],
    ["高远", "安全"],
  ],
  [
    ["Jia Lin", "Design"],
    ["Hao Wang", "Frontend"],
    ["Siyuan Chen", "Backend"],
    ["Min Zhao", "Product"],
    ["Ning Zhou", "QA"],
    ["Hao Wu", "Ops"],
    ["Yu Zheng", "Data"],
    ["Yue Sun", "Design"],
    ["Duoduo Qian", "Growth"],
    ["Xiang Li", "Frontend"],
    ["Jing He", "Support"],
    ["Yuan Gao", "Security"],
  ],
).map(([label, hint], i) => ({ value: `u${i + 1}`, label, hint }))

/** A pretend server: 600ms per query, 「错」 ("fail") fails, at most 8 results. */
async function searchPeople(query: string) {
  await new Promise((r) => setTimeout(r, 600))
  const q = query.toLowerCase()
  if (q.includes(t("错", "fail"))) throw new Error("network")
  return people.filter((p) => p.label.toLowerCase().includes(q) || p.hint?.toLowerCase().includes(q)).slice(0, 8)
}

function MultiSelects() {
  const [tags, setTags] = React.useState(tagLabels.slice(0, 5))
  const [created, setCreated] = React.useState<ComboOption[]>([])
  const [members, setMembers] = React.useState<ComboOption[]>([people[0], people[3]])
  return (
    <FieldGroup className="max-w-[400px]">
      <Field label={t("标签", "Tags")} hint={t("没有合适的，输入名字后选「创建」", "No match? Type a name and pick Create.")}>
        <Combobox
          multiple
          options={[...tagOptions, ...created]}
          value={tags}
          onValueChange={(v) => setTags(v)}
          onCreate={(label) => {
            const o = { value: label, label }
            setCreated((c) => [...c, o])
            return o
          }}
        />
      </Field>
      <Field label={t("成员", "Members")}>
        <Combobox multiple options={members} value={members.map((m) => m.value)} onValueChange={(_, picked) => setMembers(picked)} onSearch={searchPeople} />
      </Field>
      <Field label={t("禁用", "Disabled")}>
        <Combobox multiple disabled options={tagOptions} defaultValue={tagLabels.slice(0, 2)} />
      </Field>
    </FieldGroup>
  )
}
