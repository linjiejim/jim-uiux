import * as React from "react"
import { Button } from "@/registry/jim/ui/button"
import { Checkbox } from "@/registry/jim/ui/checkbox"
import { Combobox } from "@/registry/jim/ui/combobox"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Input, Textarea } from "@/registry/jim/ui/input"
import { RadioGroup } from "@/registry/jim/ui/radio-group"
import { Select } from "@/registry/jim/ui/select"
import { Switch } from "@/registry/jim/ui/switch"
import { notify } from "@/registry/jim/ui/toast"
import { DocPage, Example, Rules, Spec } from "../doc"

const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "重庆", "苏州", "厦门", "青岛", "长沙"].map((c) => ({
  value: c,
  label: c,
}))

export function FormsPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({})
  const [saving, setSaving] = React.useState(false)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const emailRef = React.useRef<HTMLInputElement>(null)

  const validateEmail = (v: string) => (v && !/^\S+@\S+\.\S+$/.test(v) ? "邮箱格式不对，例如 name@example.com" : undefined)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = { name: name.trim() ? undefined : "请填写项目名称", email: validateEmail(email) }
    setErrors(next)
    if (next.name) return nameRef.current?.focus()
    if (next.email) return emailRef.current?.focus()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      notify.success("项目已创建")
    }, 1000)
  }

  return (
    <DocPage title="表单" lead="标签在上，一列排布。离开字段时校验，提交失败把焦点移到第一个错误。" source="registry/jim/ui/field.tsx · input.tsx · select.tsx · combobox.tsx">
      <Example title="完整示例" note="试试直接点「创建项目」，或输入错误的邮箱后离开输入框。">
        <form onSubmit={submit} noValidate className="max-w-md">
          <FieldGroup>
            <Field label="项目名称" required error={errors.name}>
              <Input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name && setErrors((x) => ({ ...x, name: undefined }))} />
            </Field>
            <Field label="负责人邮箱" hint="用于接收进度通知" error={errors.email}>
              <Input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setErrors((x) => ({ ...x, email: validateEmail(email) }))} />
            </Field>
            <Field label="类型" info="类型决定默认的看板列和提醒规则，创建后可以在设置里修改。">
              <Select
                defaultValue="product"
                options={[
                  { value: "product", label: "产品研发" },
                  { value: "marketing", label: "市场活动" },
                  { value: "ops", label: "运营" },
                ]}
              />
            </Field>
            <Field label="可见范围">
              <RadioGroup
                defaultValue="team"
                options={[
                  { value: "private", label: "仅自己" },
                  { value: "team", label: "团队成员", description: "团队里的人都能查看和评论" },
                  { value: "public", label: "公开", description: "拿到链接的人都能查看" },
                ]}
              />
            </Field>
            <Field label="城市">
              <Combobox options={cities} />
            </Field>
            <Field label="描述">
              <Textarea placeholder="一两句话说明目标" />
            </Field>
            <label className="flex items-center gap-2 text-body">
              <Checkbox defaultChecked />
              创建后通知团队成员
            </label>
          </FieldGroup>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button">取消</Button>
            <Button type="submit" variant="primary" loading={saving}>
              创建项目
            </Button>
          </div>
        </form>
      </Example>

      <Example title="控件状态">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="默认">
            <Input placeholder="占位文字只举例，不当标签" />
          </Field>
          <Field label="只读" hint="查看模式：高对比、可复制">
            <Input readOnly value="P-1024" />
          </Field>
          <Field label="禁用">
            <Input disabled value="不可编辑" />
          </Field>
          <Field label="出错" error="名称已被占用">
            <Input defaultValue="官网改版" />
          </Field>
        </div>
      </Example>

      <Example title="开关与复选框" note="开关立即生效；只有点「保存」才生效的选项用复选框。">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-body">
            <Switch defaultChecked />
            新工单提醒
          </label>
          <label className="flex items-center gap-3 text-body">
            <Checkbox />
            同时删除关联的文件
          </label>
        </div>
      </Example>

      <Example title="规格" canvas="none">
        <Spec
          rows={[
            ["标签", "字段上方，13px / 500；必填标红色 *"],
            ["说明", "字段下方一行，12px；更长的解释放进 ⓘ"],
            ["错误", "替换说明的位置，红色加图标，说清怎么改"],
            ["校验时机", "离开字段时校验；改正时立即清除错误；提交时全部校验"],
            ["选择控件", "2–4 项切换视图用 Segmented；≤ 8 项用 Select；更多用 Combobox"],
            ["字段间距", "16；分组之间 32"],
            ["表单宽度", "单列，最宽 480（在 narrow 720 的页面里）"],
            ["提交", "按钮显示加载并禁用；成功后结果可见则不再提示"],
          ]}
        />
      </Example>
      <Example title="用法" canvas="none">
        <Rules
          dos={["一列表单，从上到下", "错误说清怎么改", "给默认值，减少必填项", "筛选和查看模式不标 *"]}
          donts={["用占位文字代替标签", "输入时每敲一个字就报错", "错误码、技术术语", "双列表单（除非是成对的起止日期）"]}
        />
      </Example>
    </DocPage>
  )
}
