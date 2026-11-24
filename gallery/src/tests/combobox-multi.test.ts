/** Combobox multiple: search, menu order, the create item, how many chips fit; server render. */
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Combobox, canCreate, filterOptions, fitChips, orderOptions, type ComboOption } from "@/registry/jim/ui/combobox"

const opts: ComboOption[] = [
  { value: "bj", label: "北京", hint: "华北" },
  { value: "sh", label: "上海", hint: "华东" },
  { value: "gz", label: "广州", hint: "华南" },
  { value: "sz", label: "Shenzhen" },
]

describe("combobox multiple", () => {
  it("searches label, hint and value, case-insensitive", () => {
    expect(filterOptions(opts, "华东").map((o) => o.value)).toEqual(["sh"])
    expect(filterOptions(opts, "SHEN").map((o) => o.value)).toEqual(["sz"])
    expect(filterOptions(opts, "gz").map((o) => o.value)).toEqual(["gz"])
    expect(filterOptions(opts, "  ")).toBe(opts)
  })

  it("puts what was picked at open first, the rest keep their order", () => {
    expect(orderOptions(opts, ["gz", "bj"]).map((o) => o.value)).toEqual(["bj", "gz", "sh", "sz"])
    expect(orderOptions(opts, []).map((o) => o.value)).toEqual(["bj", "sh", "gz", "sz"])
  })

  it("offers 创建 only for a new, non-empty name", () => {
    expect(canCreate("", opts)).toBe(false)
    expect(canCreate("   ", opts)).toBe(false)
    expect(canCreate("北京", opts)).toBe(false)
    expect(canCreate(" shenzhen ", opts)).toBe(false)
    expect(canCreate("北", opts)).toBe(true)
    expect(canCreate("杭州", opts)).toBe(true)
  })

  it("fits chips on one line and keeps room for +N", () => {
    // all fit: no +N needed
    expect(fitChips([40, 40, 40], 128, 4, 24)).toBe(3)
    // the last one doesn't fit: two plus "+1"
    expect(fitChips([40, 40, 40], 120, 4, 24)).toBe(2)
    // four chips in 128: two plus "+2" (40 + 4 + 40 + 4 + 24 = 112)
    expect(fitChips([40, 40, 40, 40], 128, 4, 24)).toBe(2)
    // a first chip wider than the room still shows (it truncates)
    expect(fitChips([300, 40], 100, 4, 24)).toBe(1)
    expect(fitChips([], 100, 4, 24)).toBe(0)
    // not measured yet (server render): all of them
    expect(fitChips([40, 40], 0, 4, 24)).toBe(2)
  })

  it("renders on the server: chips, their ✕, and the picked labels for screen readers", () => {
    const html = renderToString(createElement(Combobox, { multiple: true, options: opts, defaultValue: ["sh", "gz"] }))
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain("移除「上海」")
    expect(html).toContain("上海和广州")
    expect(html).not.toContain("请选择")
  })

  it("controlled undefined means nothing picked", () => {
    const html = renderToString(createElement(Combobox, { multiple: true, options: opts, value: undefined, defaultValue: ["sh"] }))
    expect(html).toContain("请选择")
    expect(html).not.toContain("移除")
  })
})
