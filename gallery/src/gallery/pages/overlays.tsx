import * as React from "react"
import { Archive, Copy, FileText, Moon, Pencil, Plus, Settings, Trash2 } from "lucide-react"
import { BottomSheet, BottomSheetBody, BottomSheetContent, BottomSheetFooter, BottomSheetHeader, BottomSheetTrigger, BottomSheetClose } from "@/registry/jim/ui/bottom-sheet"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { ConfirmDialog } from "@/registry/jim/ui/confirm-dialog"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/registry/jim/ui/dialog"
import { DetailList, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTrigger } from "@/registry/jim/ui/drawer"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Input, Textarea } from "@/registry/jim/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"
import { getAppearance, resolveAppearance, setAppearance } from "@/registry/jim/lib/appearance"
import { Badge } from "@/registry/jim/ui/badge"
import { CommandGroup, CommandItem, CommandPalette } from "@/registry/jim/ui/command-palette"
import { Segmented } from "@/registry/jim/ui/segmented"
import { notify } from "@/registry/jim/ui/toast"
import { DocPage, Example, Row, Rules, Spec } from "../doc"

export function OverlaysPage() {
  return (
    <DocPage
      title="弹层"
      lead="先选对容器，再填内容。同一个意图永远用同一种弹层。"
      source="registry/jim/ui/dialog.tsx · drawer.tsx · bottom-sheet.tsx · confirm-dialog.tsx · popover.tsx · context-menu.tsx"
    >
      <Example title="选哪个" canvas="none">
        <Spec
          rows={[
            ["Dialog", "不属于列表对象的短任务：重命名、邀请成员、新建标签。阻断页面。手机上从底部升起"],
            ["Drawer", "查看、编辑、新建一个列表对象（原位编辑），同时保留列表上下文；筛选面板。一次只开一层"],
            ["ConfirmDialog", "不可逆或代价大的最后一步。可逆操作直接做，给撤销"],
            ["BottomSheet", "触屏布局里的选项、操作和短表单。原生 App 用系统 sheet"],
            ["Popover", "不阻断的小面板，挂在触发点上：筛选、选择器、快速改一个值"],
            ["DropdownMenu", "一组命令：行操作、更多菜单"],
            ["ContextMenu", "右键菜单：和 ⋯ 菜单同一组命令，只是快捷方式（演示在「数据展示」）"],
          ]}
        />
      </Example>

      <Example title="Dialog" note="用于不属于列表对象的短任务。尺寸：sm 400 · md 480（默认）· lg 640 · xl 工作区。高度最多 85dvh，内容区单独滚动。改了内容再关闭会先问一句。">
        <Row>
          <EditDialog />
          <SizeDialog size="sm" />
          <SizeDialog size="lg" />
        </Row>
      </Example>

      <Example title="Dialog · fixed" note="弹框里要切换标签、筛选列表或分步填写时加 fixed：md、lg 高度固定（560、640，最多 85dvh），只有内容区滚动，框的大小不随内容跳。sm 仍随内容，xl 一直固定。">
        <Row>
          <FixedDialog />
        </Row>
      </Example>

      <Example title="Drawer" note="宽度：sm 400 · md 560（默认）· lg min(60vw, 960)。手机上全宽。标题行放 ≤ 2 个图标操作。列表对象的查看、编辑、新建都在抽屉里原位进行，完整示例见「模式 · 列表与 CRUD」。">
        <Row>
          <DetailDrawer />
        </Row>
      </Example>

      <Example
        title="Drawer · dock（Inspector）"
        note="工作台的详情栏：不模态、没有遮罩，主区还能点。视口 ≥ 1440 时作为一栏停靠在主区旁边，更窄时浮起，点外面关闭。宽 360–520，拖左边缘调整，按地点记住。里面打开关联对象最多叠 3 层，可以提升到主区。示例见「模式 · 工作台外壳」。"
        canvas="none"
      >
        <Row>
          <Button asChild>
            <a href="#/workbench">打开工作台示例</a>
          </Button>
        </Row>
      </Example>

      <Example title="命令面板" note="⌘K（Windows 上 Ctrl+K）在任何页面打开，本站也可以。唯一一个顶部对齐的弹框：640×480，距顶部 120；结果变化时框不变，只有列表滚动。分组有标题，选中后执行并关闭。">
        <Row>
          <PaletteDemo />
        </Row>
      </Example>

      <Example title="ConfirmDialog" note="标题是问题，正文说后果，按钮重复动词。焦点默认在「取消」。确认按钮可以是异步的，失败时弹框不关闭，并在里面显示原因。">
        <Row>
          <DeleteConfirm fail={false} />
          <DeleteConfirm fail />
        </Row>
      </Example>

      <Example title="BottomSheet" note="把手 36×5，顶部圆角 24，最高 92dvh。下拉或点遮罩关闭。用手机宽度看效果最好。">
        <Row>
          <ShareSheet />
          <FeedbackSheet />
        </Row>
      </Example>

      <Example title="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button>改名称</Button>
          </PopoverTrigger>
          <PopoverContent>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                notify.success("名称已更新")
              }}
            >
              <Field label="名称">
                <Input defaultValue="官网改版" autoFocus />
              </Field>
              <Button type="submit" variant="primary" size="sm" className="self-end">
                保存
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </Example>

      <Example
        title="Popover · 锚到一个点"
        note="面板要出现在触发按钮以外的地方（画布、3D 视图里的一个点，文字里的一个词）时，加 PopoverAnchor。点换了就传一个新的 virtualRef 对象，Radix 才会重新定位；它每次现量画布的位置，页面滚动时跟着走。画布本身仍是触发器，所以有键盘入口（回车加在中心），关闭后焦点回到画布。"
      >
        <PinCanvas />
      </Example>

      <Example title="用法" canvas="none">
        <Rules
          dos={["Esc、点遮罩、✕ 都能关闭", "关闭后焦点回到触发按钮", "弹框里的表单按回车提交"]}
          donts={[
            "弹框里再开弹框（确认框除外）",
            "两个抽屉叠在一起",
            // design-allow: 文档里列出的反例
            "手写 fixed inset-0 遮罩",
            // design-allow: 文档里列出的反例
            "alert()、window.confirm()",
            "遮罩模糊",
          ]}
        />
      </Example>
    </DocPage>
  )
}

type Pin = { x: number; y: number }

function PinCanvas() {
  const canvas = React.useRef<HTMLButtonElement>(null)
  const [draft, setDraft] = React.useState<Pin | null>(null)
  const [pins, setPins] = React.useState<(Pin & { note: string })[]>([])
  // A new anchor for each point, so Radix re-measures. It reads the canvas's box
  // each time, so the panel follows the canvas when the page scrolls.
  const anchor = React.useMemo(() => {
    const p = draft ?? { x: 0, y: 0 }
    return {
      current: {
        getBoundingClientRect: () => {
          const r = canvas.current?.getBoundingClientRect()
          return DOMRect.fromRect({ x: (r?.x ?? 0) + p.x, y: (r?.y ?? 0) + p.y, width: 0, height: 0 })
        },
      },
    }
  }, [draft])
  return (
    <Popover open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
      <PopoverAnchor virtualRef={anchor} />
      <PopoverTrigger asChild>
        <button
          ref={canvas}
          type="button"
          aria-label="在画布上加备注"
          className="relative block h-48 w-full max-w-md cursor-crosshair rounded-lg border bg-sunken text-small text-muted-foreground"
          onClick={(e) => {
            e.preventDefault() // place (or move) the note instead of toggling
            const r = e.currentTarget.getBoundingClientRect()
            // detail 0: Enter or Space, so put it in the middle
            setDraft(e.detail === 0 ? { x: r.width / 2, y: r.height / 2 } : { x: e.clientX - r.left, y: e.clientY - r.top })
          }}
        >
          {pins.length === 0 && "点画布上任意位置加备注"}
          {[...pins, ...(draft ? [{ ...draft, note: "" }] : [])].map((p, i) => (
            <span
              key={i}
              title={p.note || undefined}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
              style={{ left: p.x, top: p.y }}
            />
          ))}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const note = String(new FormData(e.currentTarget).get("note") ?? "").trim()
            if (draft && note) setPins((ps) => [...ps, { ...draft, note }])
            setDraft(null)
          }}
        >
          <Field label="备注">
            <Input name="note" autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="sm" className="self-end">
            添加
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function EditDialog() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const dirty = name !== "" || desc !== ""
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setName("")
          setDesc("")
        }
      }}
      dirty={dirty && !saving}
    >
      <DialogTrigger asChild>
        <Button variant="primary">新建标签</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault()
            setSaving(true)
            setTimeout(() => {
              setSaving(false)
              setOpen(false)
              notify.success("标签已创建")
            }, 900)
          }}
        >
          <DialogHeader title="新建标签" />
          <DialogBody>
            <FieldGroup>
              <Field label="名称" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </Field>
              <Field label="描述">
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">取消</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={saving} disabled={!name.trim()}>
              创建标签
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SizeDialog({ size }: { size: "sm" | "lg" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{size === "sm" ? "sm 400" : "lg 640"}</Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader title={size === "sm" ? "重命名文件" : "导入成员"} description={size === "lg" ? "支持 CSV，第一行为表头。" : undefined} />
        <DialogBody>
          {size === "sm" ? (
            <Input defaultValue="季度报告.pdf" aria-label="文件名" />
          ) : (
            <div className="grid h-40 place-items-center rounded-lg border border-dashed text-body text-muted-foreground">拖入文件，或点击选择</div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>取消</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary">{size === "sm" ? "重命名" : "导入成员"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FixedDialog() {
  const [tab, setTab] = React.useState("members")
  const members = ["林杰", "陈曦", "王蕾", "张弛", "李想", "周婷", "赵安", "孙越", "钱多", "吴桐", "郑好", "冯远"]
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>项目成员（md fixed）</Button>
      </DialogTrigger>
      <DialogContent fixed>
        <DialogHeader title="项目成员" />
        <div className="shrink-0 px-5 pb-2">
          <Segmented
            size="sm"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: "members", label: "成员 12" },
              { value: "invites", label: "邀请 1" },
            ]}
          />
        </div>
        <DialogBody>
          {tab === "members" ? (
            <ul className="divide-y">
              {members.map((m) => (
                <li key={m} className="flex h-11 items-center justify-between text-body">
                  {m}
                  <span className="text-small text-muted-foreground">成员</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              <li className="flex h-11 items-center justify-between text-body">
                chen@example.com
                <span className="text-small text-muted-foreground">待接受</span>
              </li>
            </ul>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>关闭</Button>
          </DialogClose>
          <Button variant="primary">邀请成员</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaletteDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开命令面板</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandGroup heading="操作">
          <CommandItem icon={<Plus />} shortcut="N" onSelect={() => notify("新建项目")}>
            新建项目
          </CommandItem>
          <CommandItem icon={<Archive />} onSelect={() => notify.undo("已归档 1 个项目", () => notify("已恢复"))}>
            归档当前项目
          </CommandItem>
          <CommandItem icon={<Moon />} keywords={["dark", "深色"]} onSelect={() => setAppearance(resolveAppearance(getAppearance()) === "dark" ? "light" : "dark")}>
            切换深色模式
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="最近">
          {["官网改版", "会员体系", "种植日历", "设备固件 2.4"].map((p) => (
            <CommandItem key={p} icon={<FileText />} hint="项目" onSelect={() => notify(`打开「${p}」`)}>
              {p}
            </CommandItem>
          ))}
          <CommandItem icon={<Settings />} shortcut="⌘," onSelect={() => notify("打开设置")}>
            设置
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    </>
  )
}

function DetailDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>查看详情</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader
          title="官网改版"
          description="P-1001 · 更新于 10月31日"
          actions={
            <>
              <IconButton label="复制链接" size="icon-sm">
                <Copy />
              </IconButton>
              <IconButton label="编辑" size="icon-sm">
                <Pencil />
              </IconButton>
            </>
          }
        />
        <DrawerBody>
          <DetailList
            items={[
              { label: "状态", value: <Badge tone="info">进行中</Badge> },
              { label: "负责人", value: "林杰" },
              { label: "预算", value: <span className="tabular">¥128,000</span> },
              { label: "进度", value: <span className="tabular">64%</span> },
              { label: "描述", value: "重做首页和产品页，统一到新的设计系统，移动端优先。" },
            ]}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

function DeleteConfirm({ fail }: { fail: boolean }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant={fail ? "secondary" : "secondary"} onClick={() => setOpen(true)}>
        <Trash2 />
        {fail ? "删除（模拟失败）" : "删除项目"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="删除项目「官网改版」？"
        description="项目里的 12 个任务和 3 个文件会一起删除，无法恢复。"
        confirmLabel="删除项目"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 900))
          if (fail) throw new Error("网络连接中断，项目没有删除。请重试。")
          notify.success("项目已删除")
        }}
      />
    </>
  )
}

function ShareSheet() {
  return (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <Button>分享</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader title="分享项目" />
        <BottomSheetBody>
          <ul className="-mx-2 flex flex-col">
            {["复制链接", "发送给成员", "导出 PDF"].map((t) => (
              <li key={t}>
                <BottomSheetClose asChild>
                  <button className="flex min-h-12 w-full items-center rounded-md px-2 text-left text-reading active:bg-pressed" onClick={() => notify.success(`${t}：完成`)}>
                    {t}
                  </button>
                </BottomSheetClose>
              </li>
            ))}
          </ul>
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button size="lg">取消</Button>
          </BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

function FeedbackSheet() {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setText("")
      }}
      dirty={text.trim() !== ""}
    >
      <BottomSheetTrigger asChild>
        <Button>写反馈</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader title="写反馈" description="写了内容再关闭，会先确认。" />
        <BottomSheetBody>
          <Textarea aria-label="反馈" value={text} onChange={(e) => setText(e.target.value)} placeholder="哪里不好用？" />
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button size="lg">取消</Button>
          </BottomSheetClose>
          <Button
            size="lg"
            variant="primary"
            disabled={!text.trim()}
            onClick={() => {
              setOpen(false)
              setText("")
              notify.success("反馈已发送")
            }}
          >
            发送反馈
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}
