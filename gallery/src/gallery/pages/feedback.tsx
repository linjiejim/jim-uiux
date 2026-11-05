import * as React from "react"
import { Button } from "@/registry/jim/ui/button"
import { Skeleton } from "@/registry/jim/ui/skeleton"
import { Spinner } from "@/registry/jim/ui/spinner"
import { StateView } from "@/registry/jim/ui/state"
import { notify } from "@/registry/jim/ui/toast"
import { Segmented } from "@/registry/jim/ui/segmented"
import { DocPage, Example, Row, Rules, Spec } from "../doc"

export function FeedbackPage() {
  const [kind, setKind] = React.useState<"empty" | "no-match" | "no-permission" | "error">("empty")
  return (
    <DocPage title="反馈与状态" lead="每个操作都有回应，但只说一次：结果在屏幕上看得见，就不再弹提示。" source="registry/jim/ui/toast.tsx · state.tsx · skeleton.tsx">
      <Example title="Toast" note="顶部居中，叠放（悬停展开）。级别只用图标颜色区分，错误加一层很淡的红底。成功、提示 4 秒，警告 6 秒，带撤销 8 秒，错误不自动消失。最多同时 3 条。">
        <Row>
          <Button onClick={() => notify.success("报告已导出到「下载」")}>成功</Button>
          <Button onClick={() => notify.info("同步将在后台完成")}>提示</Button>
          <Button onClick={() => notify.warning("已导出 98 条，2 条因格式问题跳过")}>警告</Button>
          <Button onClick={() => notify.undo("已归档 3 个项目", () => notify("已恢复"))}>撤销</Button>
          <Button onClick={() => notify.error("同步失败，网络连接中断", { retry: () => notify.success("已重新同步") })}>错误</Button>
          <Button onClick={() => notify("链接已复制")}>普通</Button>
        </Row>
      </Example>

      <Example title="确认还是撤销" canvas="none">
        <Spec
          rows={[
            ["可逆：归档、移出、隐藏、切换", "立即执行 → Toast「已归档 · 撤销」"],
            ["不可逆：删除、清空、发送、付款", "ConfirmDialog → 执行 → 结果可见则不再提示"],
            ["失败：字段相关", "显示在字段下方"],
            ["失败：区块加载", "区块内显示错误状态 + 重试"],
            ["失败：后台操作", "不消失的错误 Toast + 重试"],
          ]}
        />
      </Example>

      <Example title="空、无匹配、无权限、出错" note="四种状态长得不一样，失败不会被当成「没有数据」。一个图标，一句标题，最多一行说明，最多一个操作。">
        <Segmented
          size="sm"
          value={kind}
          onValueChange={setKind}
          options={[
            { value: "empty", label: "空" },
            { value: "no-match", label: "无匹配" },
            { value: "no-permission", label: "无权限" },
            { value: "error", label: "出错" },
          ]}
        />
        <div className="mt-4 rounded-lg border">
          {kind === "empty" && (
            <StateView kind="empty" title="还没有项目" description="项目把任务、文件和成员放在一起。" action={<Button variant="primary" size="sm">新建项目</Button>} />
          )}
          {kind === "no-match" && <StateView kind="no-match" onClearFilters={() => notify("已清除筛选")} />}
          {kind === "no-permission" && <StateView kind="no-permission" />}
          {kind === "error" && <StateView kind="error" onRetry={() => notify("重试中")} />}
        </div>
      </Example>

      <Example title="加载" note="内容加载用静态骨架（不闪光、不脉冲），300ms 后才出现，出现后至少保留 600ms。短操作用按钮里的转圈。">
        <div className="flex flex-col gap-6">
          <div className="flex max-w-md flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
          <Row>
            <Button variant="primary" loading>
              保存修改
            </Button>
            <span className="inline-flex items-center gap-2 text-body text-muted-foreground">
              <Spinner /> 同步中
            </span>
          </Row>
        </div>
      </Example>

      <Example title="用法" canvas="none">
        <Rules
          dos={["错误说人话，说下一步", "进度未知用转圈，已知用百分比", "乐观更新：先改界面，失败再回滚并说明"]}
          donts={["同一件事既弹 Toast 又弹框", "错误码、堆栈、内部 ID", "加载时显示「暂无数据」", "假进度条"]}
        />
      </Example>
    </DocPage>
  )
}
