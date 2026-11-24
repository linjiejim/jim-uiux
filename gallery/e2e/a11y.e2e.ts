import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { MODES, ROUTES, open } from "./helpers"

// axe on every page in four modes. Serious and critical violations fail; each exclusion below
// says why it is a demo artefact rather than a kit problem.
for (const mode of MODES)
  for (const route of ROUTES)
    test(`axe · ${route} · ${mode.name}`, async ({ page }) => {
      await open(page, route, mode)
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze()
      const serious = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id}: ${v.help}\n${v.nodes.slice(0, 4).map((n) => `   ${n.target.join(" ")} | ${n.html.slice(0, 120)} | ${n.failureSummary?.split("\n").slice(1).join(" ").trim().slice(0, 160) ?? ""}`).join("\n")}`)
      expect(serious, serious.join("\n")).toEqual([])
    })
