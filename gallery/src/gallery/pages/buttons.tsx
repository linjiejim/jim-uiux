import * as React from "react"
import { Copy, Download, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { DocPage, Example, Row, Rules, Spec } from "../doc"

export function ButtonsPage() {
  const [saving, setSaving] = React.useState(false)
  return (
    <DocPage title="按钮" lead="一个区域只有一个主按钮。标签写动词加对象。" source="registry/jim/ui/button.tsx">
      <Example title="层级">
        <Row>
          <Button variant="primary">
            <Plus />
            新建项目
          </Button>
          <Button>导出数据</Button>
          <Button variant="ghost">查看历史</Button>
          <Button variant="destructive">删除项目</Button>
          <Button variant="link">了解计费</Button>
        </Row>
      </Example>
      <Example title="尺寸" note="触屏设备上自动变为 36 / 44 / 48。">
        <Row>
          <Button size="sm">小 28</Button>
          <Button size="md">中 32</Button>
          <Button size="lg">大 40</Button>
        </Row>
      </Example>
      <Example title="状态" note="加载时宽度不变，按钮禁用，防止重复提交。主按钮禁用后变中性灰，而不是半透明的强调色。">
        <Row>
          <Button
            variant="primary"
            loading={saving}
            onClick={() => {
              setSaving(true)
              setTimeout(() => setSaving(false), 1500)
            }}
          >
            保存修改
          </Button>
          <Button variant="primary" disabled>
            保存修改
          </Button>
          <Button disabled>导出数据</Button>
        </Row>
      </Example>
      <Example title="图标按钮" note="必须给 label：它同时是读屏名称和悬停提示。">
        <Row>
          <IconButton label="复制链接">
            <Copy />
          </IconButton>
          <IconButton label="下载">
            <Download />
          </IconButton>
          <IconButton label="更多操作">
            <MoreHorizontal />
          </IconButton>
          <IconButton label="删除" variant="secondary">
            <Trash2 />
          </IconButton>
        </Row>
      </Example>
      <Example title="排列" canvas="none">
        <Spec
          rows={[
            ["弹框、表单底部", "靠右：次要在左，主按钮在最右"],
            ["手机弹框底部", "按钮平分一行，取消在左"],
            ["页面头部", "主操作在标题行最右，其他操作收进 ⋯"],
            ["危险操作", "列表里放进 ⋯ 菜单最后一项，确认框里用 destructive"],
          ]}
        />
      </Example>
      <Example title="用法" canvas="none">
        <Rules
          dos={["新建项目、保存修改、删除 3 个文件", "图标加文字优于只有图标", "按钮文字 ≤ 6 个字"]}
          donts={["确定、提交、OK", "两个并排的主按钮", "只在悬停时才出现的关键操作", "渐变、阴影按钮"]}
        />
      </Example>
    </DocPage>
  )
}
