/** InlineRename: what a commit means, IME detection, save errors; server render. */
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InlineRename, checkRename, isComposing, saveError } from "@/registry/jim/ui/inline-rename"

describe("inline rename", () => {
  it("trims, and an unchanged name is not a save", () => {
    expect(checkRename("  报价单.pdf ", "报价单.pdf")).toEqual({ kind: "same" })
    expect(checkRename(" 新名字 ", "旧名字")).toEqual({ kind: "save", name: "新名字" })
  })

  it("empty or rejected by the validator stays editing with an error", () => {
    expect(checkRename("   ", "旧名字")).toEqual({ kind: "invalid", error: "请输入名称" })
    const taken = (n: string) => (n === "品牌手册.pdf" ? "已有同名文件" : undefined)
    expect(checkRename("品牌手册.pdf", "旧名字", taken)).toEqual({ kind: "invalid", error: "已有同名文件" })
    expect(checkRename("别的.pdf", "旧名字", taken)).toEqual({ kind: "save", name: "别的.pdf" })
  })

  it("knows an Enter that only confirms an IME composition", () => {
    expect(isComposing({ isComposing: true, keyCode: 13 })).toBe(true)
    // Safari reports the composition's Enter as keyCode 229 after compositionend
    expect(isComposing({ isComposing: false, keyCode: 229 })).toBe(true)
    expect(isComposing({ isComposing: false, keyCode: 13 })).toBe(false)
  })

  it("shows the Error's own words, else a plain fallback", () => {
    expect(saveError(new Error("名称已被占用"))).toBe("名称已被占用")
    expect(saveError(new Error(""))).toBe("重命名失败，请重试")
    expect(saveError("boom")).toBe("重命名失败，请重试")
  })

  it("renders on the server as a button named by its text, with a hint", () => {
    const html = renderToString(createElement(InlineRename, { value: "首页改版.fig", "aria-label": "文件名", onSave: () => {} }))
    expect(html).toMatch(/<button[^>]*aria-describedby="[^"]+-hint"/)
    expect(html).toContain("首页改版.fig")
    expect(html).toContain("按 Enter 重命名")
  })

  it("editOnClick={false} and disabled render plain text", () => {
    for (const extra of [{ editOnClick: false }, { disabled: true }]) {
      const html = renderToString(createElement(InlineRename, { value: "品牌手册.pdf", "aria-label": "文件名", onSave: () => {}, ...extra }))
      expect(html).not.toContain("<button")
      expect(html).toContain("品牌手册.pdf")
    }
  })
})
