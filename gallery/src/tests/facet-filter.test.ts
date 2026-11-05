/** Facet filter: URL parsing is pure, and nothing touches window during a server render. */
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { FacetFilter, facetsFromParams, useFacetParams, type Facet } from "@/registry/jim/ui/facet-filter"

const facets: Facet[] = [
  {
    key: "kind",
    label: "类型",
    kind: "single",
    options: [
      { value: "image", label: "图片" },
      { value: "video", label: "视频" },
    ],
  },
  {
    key: "tag",
    label: "标签",
    kind: "multi",
    options: [
      { value: "a", label: "甲" },
      { value: "b", label: "乙" },
    ],
  },
  { key: "ai", label: "已识别", kind: "boolean" },
]

describe("facet filter", () => {
  it("reads facets from URL parameters", () => {
    const v = facetsFromParams(facets, new URLSearchParams("kind=image&kind=video&tag=a&tag=b&ai=1&other=x"))
    expect(v).toEqual({ kind: ["image"], tag: ["a", "b"], ai: ["1"] })
  })

  it("renders on the server without touching window", () => {
    expect(typeof window).toBe("undefined")
    function Bar() {
      const [value, setValue] = useFacetParams(facets, { mode: "search" })
      return createElement(FacetFilter, { facets, value, onValueChange: setValue })
    }
    const html = renderToString(createElement(Bar))
    expect(html).toContain("类型")
    expect(html).not.toContain("：")
  })
})
