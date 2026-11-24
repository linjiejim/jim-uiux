import * as React from "react"
import { Copy, Download, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { CopyButton } from "@/registry/jim/ui/copy-button"
import { Kbd } from "@/registry/jim/ui/kbd"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { t } from "../i18n"

export function ButtonsPage() {
  const [saving, setSaving] = React.useState(false)
  return (
    <DocPage
      title={t("按钮", "Buttons")}
      lead={t("一个区域只有一个主按钮。标签写动词加对象。", "One primary button per area. Labels are a verb plus an object.")}
      source="registry/jim/ui/button.tsx · copy-button.tsx · kbd.tsx"
    >
      <Example title={t("层级", "Hierarchy")} info="variant: primary · secondary · ghost · destructive · link">
        <Row>
          <Button variant="primary">
            <Plus />
            {t("新建项目", "New project")}
          </Button>
          <Button>{t("导出数据", "Export data")}</Button>
          <Button variant="ghost">{t("查看历史", "View history")}</Button>
          <Button variant="destructive">{t("删除项目", "Delete project")}</Button>
          <Button variant="link">{t("了解计费", "About billing")}</Button>
        </Row>
      </Example>
      <Example title={t("尺寸", "Sizes")} info={t("触屏设备上自动变为 36 / 44 / 48。", "On touch screens they grow to 36 / 44 / 48.")}>
        <Row>
          <Button size="sm">{t("小 28", "Small 28")}</Button>
          <Button size="md">{t("中 32", "Medium 32")}</Button>
          <Button size="lg">{t("大 40", "Large 40")}</Button>
        </Row>
      </Example>
      <Example
        title={t("状态", "States")}
        note={t("点第一个按钮看加载态。", "Click the first button to see loading.")}
        info={t(
          "加载时宽度不变、按钮禁用，防止重复提交。主按钮禁用后变中性灰，不是半透明的强调色。",
          "While loading, the width holds and the button is disabled, so it can't fire twice. A disabled primary turns neutral gray, not a faded accent.",
        )}
      >
        <Row>
          <Button
            variant="primary"
            loading={saving}
            onClick={() => {
              setSaving(true)
              setTimeout(() => setSaving(false), 1500)
            }}
          >
            {t("保存修改", "Save changes")}
          </Button>
          <Button variant="primary" disabled>
            {t("保存修改", "Save changes")}
          </Button>
          <Button disabled>{t("导出数据", "Export data")}</Button>
        </Row>
      </Example>
      <Example title={t("图标按钮", "Icon buttons")} note={t("label 必填：它既是悬停提示，也是读屏名称。", "The label prop is required: it's both the tooltip and the screen-reader name.")}>
        <Row>
          <IconButton label={t("复制链接", "Copy link")}>
            <Copy />
          </IconButton>
          <IconButton label={t("下载", "Download")}>
            <Download />
          </IconButton>
          <IconButton label={t("更多操作", "More actions")}>
            <MoreHorizontal />
          </IconButton>
          <IconButton label={t("删除", "Delete")} variant="secondary">
            <Trash2 />
          </IconButton>
          <IconButton label={t("导出", "Export")} tooltip={t("导出为 CSV（当前筛选结果）", "Export as CSV (current filters)")} tooltipSide="bottom">
            <Download />
          </IconButton>
        </Row>
      </Example>
      <Example
        title={t("复制", "Copy")}
        note={t("点一下：按钮自己变成「已复制」，不弹 Toast。", "Click one: the button itself says Copied, no toast.")}
        info={t(
          "1.5 秒后恢复；失败时显示「复制失败」。地方小（代码块角上、提交号旁边）用 iconOnly，文字放进悬停提示。",
          "It resets after 1.5 seconds; on failure it says Couldn't copy. In tight spots (a code block corner, next to a commit hash) use iconOnly and the label moves into the tooltip.",
        )}
      >
        <Row>
          <CopyButton value="sk-live-4f9a2c71e0b8" label={t("复制密钥", "Copy key")} />
          <CopyButton value="https://design.linjiejim.com" label={t("复制链接", "Copy link")} variant="ghost" />
          <span className="inline-flex items-center gap-1 font-mono text-small text-muted-foreground">
            3f9c2e1
            <CopyButton value="3f9c2e1a7b04d5e6f8091a2b3c4d5e6f7a8b9c0d" label={t("复制完整提交号", "Copy full commit hash")} iconOnly />
          </span>
        </Row>
      </Example>
      <Example
        title={t("按键提示", "Shortcuts")}
        info={t("Kbd 放在能用这个快捷键的地方：菜单项、命令面板、按钮旁。触屏上不显示。", "Put Kbd where the shortcut works: menu items, the command palette, next to a button. Leave it out on touch screens.")}
      >
        <Row className="text-small text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            {t("搜索", "Search")} <Kbd>⌘K</Kbd>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {t("隐藏面板", "Hide panel")} <Kbd>H</Kbd>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> {t("选择", "Select")}
          </span>
        </Row>
      </Example>
      <Example title={t("用法", "Usage")} canvas="none">
        <Spec
          rows={[
            [t("弹框、表单底部", "Dialog and form footers"), t("靠右：次要在左，主按钮在最右", "Right-aligned: secondary first, primary last")],
            [t("手机弹框底部", "Dialog footers on phones"), t("按钮平分一行，取消在左", "Buttons share the row, Cancel on the left")],
            [t("页面头部", "Page header"), t("主操作在标题行最右，其他收进 ⋯", "Primary action at the far right of the title row, the rest under ⋯")],
            [t("危险操作", "Destructive actions"), t("列表里放在 ⋯ 菜单最后一项，确认框里用 destructive", "Last item of the ⋯ menu in lists; destructive inside the confirm dialog")],
          ]}
        />
        <div className="mt-6">
          <Rules
            dos={[
              t("新建项目、保存修改、删除 3 个文件", "New project, Save changes, Delete 3 files"),
              t("图标加文字优于只有图标", "Icon plus text over icon alone"),
              t("按钮文字 ≤ 6 个字", "Labels of 3 words or fewer"),
            ]}
            donts={[
              t("确定、提交、OK", "OK, Submit, Confirm"),
              t("两个并排的主按钮", "Two primary buttons side by side"),
              t("只在悬停时才出现的关键操作", "Key actions that appear only on hover"),
              t("渐变、阴影按钮", "Gradient or shadowed buttons"),
            ]}
          />
        </div>
      </Example>
    </DocPage>
  )
}
