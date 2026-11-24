import { describe, expect, it } from "vitest"
import { lineMatches, rules, type Rule } from "@/registry/jim/guards/guard-lib"

// Each 1.10.0 guard rule catches its bad cases and lets the good ones through.
const hits = (rs: Rule[], line: string) => rs.some((r) => lineMatches(r, line))

const cases: Record<keyof typeof rules, { bad: string[]; good: string[] }> = {
  weight: {
    bad: ['<h1 className="text-title font-bold">', "font-weight: 700;", "  font-weight: bold;", "style={{ fontWeight: 800 }}", 'fontWeight: "bold"', "font-extrabold", "font-black"],
    good: ['<h1 className="text-title font-semibold">', "font-weight: 600;", "font-medium", "fontWeight: 500", "font-bolder-ish-name", "font-blackout"],
  },
  layer: {
    bad: ['className="fixed z-50"', "z-10", "z-[100]", "z-index: 999;", "style={{ zIndex: 1000 }}", "hover:z-20"],
    good: ["z-(--z-overlay)", "z-[1]", "z-[9]", "z-0", "z-index: 2;", "zIndex: 3", "lazy-10", "z-[var(--z-toast)]"],
  },
  motion: {
    bad: ["duration-300", "transition duration-[250ms]", "delay-150", "ease-[cubic-bezier(.4,0,.2,1)]", "transition: opacity 300ms ease;", "animation-duration: .2s;"],
    good: ["duration-(--duration-fast)", "ease-out", "ease-drawer", "transition-colors", "transition: opacity var(--duration-base) var(--ease-out);", "data-duration-picker"],
  },
  darkColour: {
    bad: ["dark:bg-muted", "dark:text-foreground", "dark:hover:bg-accent", "dark:data-[state=checked]:bg-primary", "dark:border-input"],
    good: ["dark:hidden", "dark:block", "dark: { foreground: x }", "bg-muted", "@custom-variant dark (&:where(.dark, .dark *));"],
  },
  vagueLabel: {
    bad: ["<Button>确定</Button>", '<Button variant="primary">提交</Button>', "<Button size=\"sm\"> OK </Button>", 'confirmLabel="确定"', "actionLabel='Submit'"],
    good: ["<Button>删除项目</Button>", "<Button>保存修改</Button>", 'confirmLabel="删除项目"', "// 不写「确定」「提交」", "<p>确定要删除吗？</p>"],
  },
}

describe("guard rules", () => {
  for (const [name, { bad, good }] of Object.entries(cases) as [keyof typeof rules, (typeof cases)[keyof typeof rules]][]) {
    it.each(bad)(`${name} catches %s`, (line) => expect(hits(rules[name], line)).toBe(true))
    it.each(good)(`${name} passes %s`, (line) => expect(hits(rules[name], line)).toBe(false))
  }
})
