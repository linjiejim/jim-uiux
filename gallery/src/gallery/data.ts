export type Project = {
  id: string
  name: string
  owner: string
  status: "active" | "review" | "blocked" | "done" | "draft"
  budget: number
  progress: number
  updatedAt: string
  archived: boolean
}

export const statusMeta: Record<Project["status"], { label: string; tone: "info" | "warning" | "danger" | "success" | "neutral" }> = {
  active: { label: "进行中", tone: "info" },
  review: { label: "待审核", tone: "warning" },
  blocked: { label: "受阻", tone: "danger" },
  done: { label: "已完成", tone: "success" },
  draft: { label: "草稿", tone: "neutral" },
}

const names = [
  "官网改版", "会员体系", "种植日历", "设备固件 2.4", "售后工单", "数据看板", "营养液配方库", "门店小程序",
  "账单导出", "多语言支持", "社区内容审核", "推送通知", "AI 种植助手", "库存同步", "供应商门户", "直播带货",
  "积分商城", "隐私合规", "支付重构", "物流追踪", "用户访谈", "品牌手册", "包装设计", "海外仓",
  "OTA 升级通道", "传感器校准", "客服知识库", "退换货流程", "年度报告", "合作伙伴 API", "移动端性能", "可访问性审计",
]
const owners = ["林杰", "陈曦", "王蕾", "张弛", "李想", "周婷", "赵安", "孙越"]
const statuses: Project["status"][] = ["active", "review", "blocked", "done", "draft", "active", "done", "active"]

export const projects: Project[] = Array.from({ length: 57 }, (_, i) => {
  const d = new Date(2026, 9, 31 - (i % 28), 9 + (i % 9), (i * 7) % 60)
  return {
    id: `P-${String(1001 + i)}`,
    name: names[i % names.length] + (i >= names.length ? ` · 二期` : ""),
    owner: owners[(i * 3) % owners.length],
    status: statuses[(i * 5) % statuses.length],
    budget: 12000 + ((i * 7919) % 90) * 1500,
    progress: (i * 37) % 101,
    updatedAt: d.toISOString(),
    archived: i % 11 === 0,
  }
})

export const fmtMoney = (n: number) => `¥${n.toLocaleString("zh-CN")}`
export const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/** Fake latency so loading states are visible in the gallery. */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
