import * as React from "react"
import { Button } from "@/registry/jim/ui/button"
import { Callout } from "@/registry/jim/ui/callout"
import { Progress } from "@/registry/jim/ui/progress"
import { Skeleton } from "@/registry/jim/ui/skeleton"
import { Spinner } from "@/registry/jim/ui/spinner"
import { StateView } from "@/registry/jim/ui/state"
import { notify } from "@/registry/jim/ui/toast"
import { Segmented } from "@/registry/jim/ui/segmented"
import { UploadQueuePanel, UploadRejected, useUploadQueue } from "@/registry/jim/ui/upload-queue"
import { formatNumber } from "@/registry/jim/lib/format"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { t } from "../i18n"

const exported = t("报告已导出到「下载」", "Report exported to Downloads")

export function FeedbackPage() {
  const [kind, setKind] = React.useState<"empty" | "no-match" | "no-permission" | "error">("empty")
  return (
    <DocPage
      title={t("反馈与状态", "Feedback and states")}
      lead={t("每个操作都有回应，但只说一次：结果看得见，就不再弹提示。", "Every action gets a response, once: if the result is visible, skip the toast.")}
      source="registry/jim/ui/toast.tsx · callout.tsx · state.tsx · skeleton.tsx · progress.tsx · upload-queue.tsx"
    >
      <Example
        title="Toast"
        note={t("点按钮看每一种；悬停展开叠起来的提示。", "Click to see each kind. Hover to expand the stack.")}
        info={t(
          "桌面在右上角叠放，手机在顶部占满宽度。✕ 随时能关（后台进度除外）。级别只靠图标颜色区分，错误加很淡的红底。成功、提示 4 秒，警告 6 秒，带撤销 8 秒；错误、等你处理、后台进度不自动消失。最多同时 3 条。",
          "Stacked top right on desktop, full width at the top on phones. ✕ closes any of them (except background progress). Only the icon color shows the level; errors add a faint red tint. Success and info last 4s, warnings 6s, undo 8s; errors, needs-action and background progress stay until handled. At most 3 at once.",
        )}
      >
        <Row>
          <Button onClick={() => notify.success(exported)}>{t("成功", "Success")}</Button>
          <Button onClick={() => notify.info(t("同步会在后台完成", "Sync will finish in the background"))}>{t("提示", "Info")}</Button>
          <Button onClick={() => notify.warning(t("已导出 98 条，2 条因格式问题跳过", "Exported 98 rows; 2 skipped for bad formatting"))}>
            {t("警告", "Warning")}
          </Button>
          <Button onClick={() => notify.undo(t("已归档 3 个项目", "Archived 3 projects"), () => notify(t("已恢复", "Restored")))}>{t("撤销", "Undo")}</Button>
          <Button
            onClick={() =>
              notify.error(t("同步失败，网络连接中断", "Couldn't sync. Connection lost."), { retry: () => notify.success(t("已重新同步", "Synced again")) })
            }
          >
            {t("错误", "Error")}
          </Button>
          <Button onClick={() => notify(t("已加入「稍后阅读」", "Added to Read later"))}>{t("普通", "Plain")}</Button>
          <Button
            onClick={() =>
              notify.prompt("update", t("新版本已下载，重启后生效", "Update downloaded. Restart to apply it."), {
                label: t("重启", "Restart"),
                onClick: () => notify(t("正在重启", "Restarting")),
              })
            }
          >
            {t("等你处理", "Needs action")}
          </Button>
          <Button
            onClick={() => {
              const id = notify.loading(t(`正在导出 ${formatNumber(1204)} 条记录…`, `Exporting ${formatNumber(1204)} records…`))
              setTimeout(() => {
                notify.dismiss(id)
                notify.success(exported)
              }, 3000)
            }}
          >
            {t("后台进度", "Background progress")}
          </Button>
        </Row>
      </Example>

      <Example
        title={t("提示框", "Callout")}
        note={t("要一直留在页面上、直到原因消失的提示。", "For messages that stay on the page until the cause goes away.")}
        info={t(
          "比如只显示一次的值、缺少的配置、确认框里操作失败的原因。图标加一两句话，最多一个操作；淡底和图标一起表示级别。",
          "Such as a value shown only once, missing setup, or why an action in a confirm dialog failed. An icon and a sentence or two, at most one action; the tint and icon show the level.",
        )}
      >
        <div className="flex max-w-xl flex-col gap-3">
          <Callout tone="info">{t("导入在后台进行，完成后会出现在列表里。", "Importing in the background. It'll show up in the list when done.")}</Callout>
          <Callout tone="warning" action={<Button size="sm">{t("配置邮箱", "Set up email")}</Button>}>
            {t("还没有配置发件邮箱，邀请邮件发不出去。", "No sender email is set up, so invites can't go out.")}
          </Callout>
          <Callout tone="danger">{t("删除失败：项目里还有 3 个进行中的任务。", "Couldn't delete: the project still has 3 active tasks.")}</Callout>
          <Callout tone="neutral">{t("这个视图只显示你有权限查看的项目。", "This view only shows projects you have access to.")}</Callout>
        </div>
      </Example>

      <Example
        title={t("空、无匹配、无权限、出错", "Empty, no match, no access, error")}
        note={t("四种长得不一样，出错不会被当成「没有数据」。", "Each looks different, so a failure never reads as “no data”.")}
        info={t("一个图标、一句标题，最多一行说明、一个操作。", "One icon, a one-line title, at most one line of description and one action.")}
      >
        <Segmented
          size="sm"
          value={kind}
          onValueChange={setKind}
          options={[
            { value: "empty", label: t("空", "Empty") },
            { value: "no-match", label: t("无匹配", "No match") },
            { value: "no-permission", label: t("无权限", "No access") },
            { value: "error", label: t("出错", "Error") },
          ]}
        />
        <div className="mt-4 rounded-lg border">
          {kind === "empty" && (
            <StateView
              kind="empty"
              title={t("还没有项目", "No projects yet")}
              description={t("项目把任务、文件和成员放在一起。", "A project keeps tasks, files and people together.")}
              action={
                <Button variant="primary" size="sm">
                  {t("新建项目", "New project")}
                </Button>
              }
            />
          )}
          {kind === "no-match" && <StateView kind="no-match" onClearFilters={() => notify(t("已清除筛选", "Filters cleared"))} />}
          {kind === "no-permission" && <StateView kind="no-permission" />}
          {kind === "error" && <StateView kind="error" onRetry={() => notify(t("重试中", "Retrying"))} />}
        </div>
      </Example>

      <Example
        title={t("加载", "Loading")}
        note={t("内容加载用静态骨架，短操作用按钮里的转圈。", "Static skeletons for content; a spinner in the button for short actions.")}
        info={t(
          "骨架不闪光、不脉冲；300ms 后才出现，出现后至少保留 600ms（useDelayedFlag）。",
          "Skeletons don't shimmer or pulse. They appear after 300ms and stay at least 600ms (useDelayedFlag).",
        )}
      >
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
              {t("保存修改", "Save changes")}
            </Button>
            <span className="inline-flex items-center gap-2 text-body text-muted-foreground">
              <Spinner /> {t("同步中", "Syncing")}
            </span>
          </Row>
        </div>
      </Example>

      <Example
        title={t("进度", "Progress")}
        note={t("只画知道总量的真实进度；不知道总量就用转圈。", "Only for real progress with a known total. Unknown total: use a spinner.")}
        info={t(
          "已传的字节、处理完的条数、跑完的步数。数字也写出来，进度条要有给读屏用的名字。",
          "Bytes sent, items processed, steps done. Show the numbers too, and give the bar an accessible name.",
        )}
      >
        <ProgressDemo />
      </Example>

      <Example
        title={t("上传队列", "Upload queue")}
        note={t("在右下角排队，同时传 3 个。", "Queues in the bottom-right corner, 3 at a time.")}
        info={t(
          "状态词固定：等待 / 上传中 x% / 已添加 / 已存在 / 失败（重试）。全部成功 4 秒后自动收起，有失败就不收。传完前离开页面会先问。",
          "Fixed status words: Waiting / Uploading x% / Added / Already there / Failed (Retry). Collapses 4s after everything succeeds; stays open if anything failed. Leaving the page before it finishes asks first.",
        )}
      >
        <UploadDemo />
      </Example>

      <Example title={t("确认还是撤销", "Confirm or undo")} canvas="none">
        <Spec
          rows={[
            [t("可逆：归档、移出、隐藏、切换", "Reversible: archive, remove, hide, toggle"), t("立即执行 → Toast「已归档 · 撤销」", "Do it now → toast “Archived · Undo”")],
            [
              t("不可逆：删除、清空、发送、付款", "Irreversible: delete, empty, send, pay"),
              t("确认框 → 执行 → 结果看得见就不再提示", "Confirm dialog → do it → no toast if the result is visible"),
            ],
            [t("失败：字段", "Failed: a field"), t("显示在字段下方", "Under the field")],
            [t("失败：区块加载", "Failed: a section's load"), t("区块里显示出错状态 + 重试", "Error state in the section + Retry")],
            [t("失败：后台操作", "Failed: a background task"), t("不消失的错误 Toast + 重试", "Persistent error toast + Retry")],
            [
              t("等你处理但不是错误：更新已下载", "Needs you, not an error: update downloaded"),
              t("不消失的 Toast + 一个动作（「重启」），同一件事只留一条", "Persistent toast + one action (“Restart”); one per thing"),
            ],
            [
              t("你发起的慢操作：下载、大批导出", "A slow task you started: download, bulk export"),
              t("后台进度 Toast，结束后收起，再按结果反馈", "Background progress toast; it closes when done, then reports the result"),
            ],
          ]}
        />
      </Example>

      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={[
            t("错误说人话，说下一步", "Errors in plain words, with the next step"),
            t("乐观更新：先改界面，失败再回滚并说明", "Optimistic updates: change the UI first; on failure, roll back and say why"),
          ]}
          donts={[
            t("同一件事既弹 Toast 又弹框", "A toast and a dialog for the same thing"),
            t("错误码、堆栈、内部 ID", "Error codes, stack traces, internal IDs"),
            t("加载时显示「暂无数据」", "“No data” while loading"),
            t("按时间走的假进度条", "Fake, time-based progress bars"),
          ]}
        />
      </Example>
    </DocPage>
  )
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))
let attempts = 0

const COVER = t("封面.png", "cover.png")
const BATCH = t(
  ["罗勒-01.jpg", "罗勒-02.jpg", "薄荷.jpg", COVER, "草莓-包装.jpg", "活动海报.psd"],
  ["basil-01.jpg", "basil-02.jpg", "mint.jpg", COVER, "strawberry-pack.jpg", "event-poster.psd"],
)
const MORE = t(["生菜.jpg", "番茄.jpg"], ["lettuce.jpg", "tomato.jpg"])

function UploadDemo() {
  const queue = useUploadQueue({
    concurrency: 3,
    run: async (file, report) => {
      if (file.name.endsWith(".psd")) throw new UploadRejected(t("不支持这种格式", "Unsupported format"))
      const n = ++attempts
      for (let p = 0; p < 1; p += 0.12) {
        report(p)
        await pause(160)
        if (n === 3 && p > 0.4) throw new Error(t("网络中断", "Connection lost"))
      }
      return file.name === COVER ? "exists" : "added"
    },
  })
  const files = (names: string[]) => names.map((n) => new File(["x"], n))
  return (
    <Row>
      <Button onClick={() => queue.add(files(BATCH))}>{t("添加 6 个文件", "Add 6 files")}</Button>
      <Button onClick={() => queue.add(files(MORE))}>{t("再添加 2 个", "Add 2 more")}</Button>
      <UploadQueuePanel queue={queue} />
    </Row>
  )
}

function ProgressDemo() {
  const [done, setDone] = React.useState(312)
  const total = 1204
  return (
    <div className="flex max-w-md flex-col gap-2">
      <div className="flex items-center justify-between text-small">
        <span id="export-progress">{t("正在导出记录", "Exporting records")}</span>
        <span className="tabular text-muted-foreground">
          {formatNumber(done)} / {formatNumber(total)}
        </span>
      </div>
      <Progress value={done} max={total} aria-labelledby="export-progress" />
      <Row className="mt-2">
        <Button size="sm" onClick={() => setDone((d) => Math.min(total, d + 200))}>
          {t("再处理 200 条", "Process 200 more")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDone(0)}>
          {t("重新开始", "Start over")}
        </Button>
      </Row>
    </div>
  )
}
