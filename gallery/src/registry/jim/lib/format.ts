/**
 * Dates, money and numbers the way references/content.md writes them, in the strings' locale.
 */

import { s } from "@/registry/jim/lib/strings"

type DateInput = Date | string | number

const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d))
const valid = (d: Date) => !Number.isNaN(d.getTime())

// Intl formatters are slow to build; keep one per locale + options.
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>()
function dtf(options: Intl.DateTimeFormatOptions) {
  const key = `d|${s().locale}|${JSON.stringify(options)}`
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat(s().locale, options))
  return cache.get(key) as Intl.DateTimeFormat
}
function nf(options: Intl.NumberFormatOptions) {
  const key = `n|${s().locale}|${JSON.stringify(options)}`
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(s().locale, options))
  return cache.get(key) as Intl.NumberFormat
}

/** 「09:00」: 24-hour, two digits. */
export function formatTime(d: DateInput) {
  const date = toDate(d)
  return valid(date) ? dtf({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date) : ""
}

/**
 * A date as text. This year: 「10月31日」 / "Oct 31"; other years add the year:
 * 「2025年10月31日」 / "Oct 31, 2025". `time: true` adds 「 09:00」 for this year's dates only
 * (an old date with a time is noise). Invalid input → "".
 */
export function formatDate(d: DateInput, { time = false, now = new Date() }: { time?: boolean; now?: Date } = {}) {
  const date = toDate(d)
  if (!valid(date)) return ""
  const thisYear = date.getFullYear() === now.getFullYear()
  // month "short" is 「10月31日」 in Chinese and "Oct 31" in English ("numeric" would give 10/31)
  const day = dtf(thisYear ? { month: "short", day: "numeric" } : { year: "numeric", month: "short", day: "numeric" }).format(date)
  return thisYear && time ? `${day} ${formatTime(date)}` : day
}

/**
 * Relative time for feeds only (content.md): 「刚刚」「3 分钟前」「2 小时前」「昨天 09:00」, then a
 * date. Show the full time on hover: `title={formatDate(d, { time: true })}`. Future dates get a date.
 */
export function formatRelative(d: DateInput, now: Date = new Date()) {
  const date = toDate(d)
  if (!valid(date)) return ""
  const diff = now.getTime() - date.getTime()
  if (diff < 0) return formatDate(date, { time: true, now })
  const min = Math.floor(diff / 60_000)
  if (min < 1) return s().justNow
  if (min < 60) return s().minutesAgo(min)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (date.getTime() >= startOfToday) return s().hoursAgo(Math.floor(min / 60))
  if (date.getTime() >= startOfToday - 86_400_000) return s().yesterdayAt(formatTime(date))
  return formatDate(date, { time: true, now })
}

/**
 * Money: 「¥128,000」, thousands separators, the narrow symbol. Whole amounts show no decimals;
 * others show two (「¥12.50」). Default currency CNY.
 */
export function formatMoney(n: number, currency = "CNY") {
  if (!Number.isFinite(n)) return ""
  const whole = Number.isInteger(n)
  return nf({
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n)
}

/** A count with thousands separators: 「1,234」. Put the unit in the sentence: s().totalCount(n). */
export function formatNumber(n: number, maximumFractionDigits = 0) {
  return Number.isFinite(n) ? nf({ maximumFractionDigits }).format(n) : ""
}

/** A ratio (0.85) as 「85%」: no space before the sign. */
export function formatPercent(ratio: number, maximumFractionDigits = 0) {
  return Number.isFinite(ratio) ? nf({ style: "percent", maximumFractionDigits }).format(ratio) : ""
}

/** File sizes: 「820 KB」「1.4 MB」 (1024-based, one decimal from MB up). */
export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return ""
  const units = ["B", "KB", "MB", "GB", "TB"]
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${formatNumber(v, i >= 2 ? 1 : 0)} ${units[i]}`
}
