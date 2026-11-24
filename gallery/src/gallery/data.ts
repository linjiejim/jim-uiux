import { formatDate, formatMoney } from "@/registry/jim/lib/format"
import { t } from "./i18n"

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
  active: { label: t("进行中", "Active"), tone: "info" },
  review: { label: t("待审核", "In review"), tone: "warning" },
  blocked: { label: t("受阻", "Blocked"), tone: "danger" },
  done: { label: t("已完成", "Done"), tone: "success" },
  draft: { label: t("草稿", "Draft"), tone: "neutral" },
}

// Same rows in both languages: only the words change, ids and numbers don't.
const names = t(
  [
    "官网改版", "会员体系", "种植日历", "设备固件 2.4", "售后工单", "数据看板", "营养液配方库", "门店小程序",
    "账单导出", "多语言支持", "社区内容审核", "推送通知", "AI 种植助手", "库存同步", "供应商门户", "直播带货",
    "积分商城", "隐私合规", "支付重构", "物流追踪", "用户访谈", "品牌手册", "包装设计", "海外仓",
    "OTA 升级通道", "传感器校准", "客服知识库", "退换货流程", "年度报告", "合作伙伴 API", "移动端性能", "可访问性审计",
  ],
  [
    "Website redesign", "Membership program", "Planting calendar", "Device firmware 2.4", "Support tickets", "Analytics dashboard", "Nutrient recipe library", "Store mini app",
    "Billing export", "Multi-language support", "Community moderation", "Push notifications", "AI growing assistant", "Inventory sync", "Supplier portal", "Live shopping",
    "Rewards store", "Privacy compliance", "Payments rebuild", "Shipment tracking", "User interviews", "Brand guidelines", "Packaging design", "Overseas warehouse",
    "OTA update channel", "Sensor calibration", "Help center", "Returns flow", "Annual report", "Partner API", "Mobile performance", "Accessibility audit",
  ],
)
const owners = t(
  ["林杰", "陈曦", "王蕾", "张弛", "李想", "周婷", "赵安", "孙越"],
  ["Jie Lin", "Xi Chen", "Lei Wang", "Chi Zhang", "Xiang Li", "Ting Zhou", "An Zhao", "Yue Sun"],
)
const phase2 = t(" · 二期", " · phase 2")
const statuses: Project["status"][] = ["active", "review", "blocked", "done", "draft", "active", "done", "active"]

export const projects: Project[] = Array.from({ length: 57 }, (_, i) => {
  const d = new Date(2026, 9, 31 - (i % 28), 9 + (i % 9), (i * 7) % 60)
  return {
    id: `P-${String(1001 + i)}`,
    name: names[i % names.length] + (i >= names.length ? phase2 : ""),
    owner: owners[(i * 3) % owners.length],
    status: statuses[(i * 5) % statuses.length],
    budget: 12000 + ((i * 7919) % 90) * 1500,
    progress: (i * 37) % 101,
    updatedAt: d.toISOString(),
    archived: i % 11 === 0,
  }
})

// the kit's formatters (lib/format.ts), so the demos follow the language switch
export const fmtMoney = (n: number) => formatMoney(n)
export const fmtDate = (iso: string) => formatDate(iso, { time: true })

/** Fake latency so loading states are visible in the gallery. */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
