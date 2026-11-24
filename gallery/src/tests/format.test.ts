import { afterAll, describe, expect, it } from "vitest"
import { formatBytes, formatDate, formatMoney, formatNumber, formatPercent, formatRelative, formatTime } from "@/registry/jim/lib/format"
import { configureStrings, en, zh } from "@/registry/jim/lib/strings"

// Local-time dates, so the tests don't depend on the machine's time zone.
const now = new Date(2026, 10, 24, 15, 30) // 2026-11-24 15:30
const at = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi)

afterAll(() => configureStrings(zh))

describe("format · zh", () => {
  it("dates: this year without the year, other years with it", () => {
    configureStrings(zh)
    expect(formatDate(at(2026, 10, 31), { now })).toBe("10月31日")
    expect(formatDate(at(2026, 10, 31, 9, 0), { time: true, now })).toBe("10月31日 09:00")
    expect(formatDate(at(2025, 10, 31, 9, 0), { time: true, now })).toBe("2025年10月31日")
    expect(formatDate("not a date")).toBe("")
  })

  it("time is 24-hour, two digits", () => {
    expect(formatTime(at(2026, 1, 1, 9, 5))).toBe("09:05")
    expect(formatTime(at(2026, 1, 1, 21, 0))).toBe("21:00")
  })

  it("relative time: 刚刚 → 分钟 → 小时 → 昨天 → date", () => {
    expect(formatRelative(at(2026, 11, 24, 15, 29, ), now)).toBe("1 分钟前")
    expect(formatRelative(new Date(now.getTime() - 20_000), now)).toBe("刚刚")
    expect(formatRelative(at(2026, 11, 24, 15, 0), now)).toBe("30 分钟前")
    expect(formatRelative(at(2026, 11, 24, 9, 0), now)).toBe("6 小时前")
    expect(formatRelative(at(2026, 11, 23, 22, 15), now)).toBe("昨天 22:15")
    expect(formatRelative(at(2026, 11, 20, 8, 0), now)).toBe("11月20日 08:00")
    expect(formatRelative(at(2026, 12, 1, 8, 0), now)).toBe("12月1日 08:00") // future → a date
  })

  it("money, numbers, percent, bytes", () => {
    expect(formatMoney(128000)).toBe("¥128,000")
    expect(formatMoney(12.5)).toBe("¥12.50")
    expect(formatMoney(-300)).toBe("-¥300")
    expect(formatMoney(Number.NaN)).toBe("")
    expect(formatNumber(1234567)).toBe("1,234,567")
    expect(formatNumber(3.14159, 2)).toBe("3.14")
    expect(formatPercent(0.85)).toBe("85%")
    expect(formatPercent(0.123, 1)).toBe("12.3%")
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(820 * 1024)).toBe("820 KB")
    expect(formatBytes(1.4 * 1024 * 1024)).toBe("1.4 MB")
  })
})

describe("format · en", () => {
  it("dates and relative time follow configureStrings(en)", () => {
    configureStrings(en)
    expect(formatDate(at(2026, 10, 31), { now })).toBe("Oct 31")
    expect(formatDate(at(2026, 10, 31, 9, 0), { time: true, now })).toBe("Oct 31 09:00")
    expect(formatDate(at(2025, 10, 31), { now })).toBe("Oct 31, 2025")
    expect(formatRelative(at(2026, 11, 24, 15, 0), now)).toBe("30 min ago")
    expect(formatRelative(at(2026, 11, 23, 22, 15), now)).toBe("yesterday 22:15")
    expect(formatMoney(128000)).toBe("¥128,000")
    expect(formatPercent(0.85)).toBe("85%")
  })
})
