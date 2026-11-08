---
name: jim-uiux
description: Jim's UI/UX design system — Notion-like minimal, black/white by default, themeable through a few knobs — as defaults that are already decided: tokens, shadcn-based components (a custom registry), interaction patterns (dialogs, drawers, bottom sheets, tables, forms, feedback, CRUD lists, filters, settings), copy rules, and vitest guards. Use whenever building or reviewing any web UI — a new page, a component, a whole app, a redesign, "make it look good", "polish this UI" — or when starting a project's design system; also for 设计规范 / UI 规范 / 交互规范 / 做个页面 / 做个后台 / 弹框多大 / 表格怎么设计 / 套用我的设计系统 / jim-uiux. Project rules (AGENTS.md, an existing design system) win where they exist; this fills every gap.
---

# jim-uiux — decided defaults for UI/UX

The point: **don't re-decide small things**. Sizes, colours, overlays, table
behaviour, feedback and copy are already settled here. Spend judgement on the
product, not on the dialog width.

Gallery (living reference, runs the real components): https://design.linjiejim.com
(local: `pnpm --dir <skill>/gallery dev` → http://localhost:5188). The shadcn
registry is served from the same site at `/r/{name}.json`. Read a page there or
its source under `gallery/src/gallery/pages/` when a spec below is not enough.

## Taste in one breath

Simple and obvious first. Usable before pretty. Feedback for every action,
said once. Motion only to explain a change. Short copy. No overload.
Black/white/grey plus **one** accent; hairlines, not shadows; shadows only for
things that float. The same intent always gets the same component.
→ `references/principles.md`

## Workflow

1. **Find out where you are.**
   - Project already has jim-uiux (look for `jim-theme.css`, `design-guard.config.json`, `docs/DESIGN.md`) → use its components; read `docs/DESIGN.md` for its knobs and exceptions.
   - Project has its own design system → its tokens and components win. Use this skill for the gaps: patterns, behaviour, copy, sizes it doesn't define. Don't import a second system. To adopt the kit's components later, keep its skin and bridge its tokens to the semantic names (`references/downstream.md`).
   - New React project → install the kit (`references/adoption.md`), pick knobs, write `docs/DESIGN.md`.
   - Not React (Vue/Nuxt, plain CSS) → take `jim-theme.css`, the guards and these docs; rebuild components to the same specs.
   - A project that newly installs the kit or aligns its own system to these rules gets one entry in this repo's `consumers.json` (fields: `references/downstream.md`), so later changes can find it.
2. **Before building a screen**, name the pattern (list/CRUD, settings, form, detail…) and read its file in `references/patterns/`. Pick components from `references/components.md`. Don't ask Jim pixel questions; ask only about direction, ≤ 3 questions, each with a recommendation.
3. **Build** with the kit's components and semantic tokens only.
4. **Before handing over**, run `references/checklist.md`: the guards, light + dark, phone width, keyboard, all five data states. Screenshot what changed.

## Hard rules (non-negotiable unless the project says otherwise)

- Semantic tokens only. No hex, `rgb()`, `bg-white`, `text-gray-*`, `text-[11px]` outside the theme. A new value → a new token, in the theme, with a gallery example.
- One accent colour. Red only for danger/failure, yellow for "needs you". Colour is never the only signal.
- Text ≥ 12px, from the type scale (`text-caption` … `text-hero`). Weights 400/500/600 only on the web; native titles follow the platform.
- Touch targets ≥ 44px on touch devices (the kit does this through `pointer: coarse`).
- One primary button per region. Labels are verb + object (「新建项目」), never 「确定」「提交」.
- Overlays come from the kit: Dialog / Drawer / ConfirmDialog / BottomSheet / Popover / DropdownMenu / ContextMenu. A right-click menu is only a shortcut: the same items sit in the ⋯ menu. Never `alert()`, `confirm()`, or a hand-written `fixed inset-0`.
- One drawer at a time; a list object is viewed, edited and created in that drawer, in place (same layout, values become editable). Dialog is for short tasks outside a list; dialog over dialog only for a confirm. A dialog whose content changes (tabs, a list) is `fixed`: the box never resizes.
- User-chosen colours (tags, project colours, chart series) come from the nine categorical pairs, stored by name; they are data, never a second accent.
- Embedded pages (iframes) ask the host to draw confirms and toasts; one Esc closes one layer.
- Reversible actions run at once and offer Undo; only irreversible ones ask first.
- Errors stay where they happened, in plain words, with Retry. Never an auto-dismissing toast for an error, never an error code. Native apps may use the system Alert for a failed action.
- Loading never shows "empty"; failure never looks like "empty". Skeletons are static, appear after 300ms, stay ≥ 600ms.
- Motion 120–240ms, one ease-out curve, no bounce, no decoration; reduced motion keeps fades only.
- Flat: cards are a 1px line, never a shadow; no card inside a card.
- No subtitle sentence under page titles; explanations go behind ⓘ.
- Tables: ≤ 6 default columns, numbers right-aligned with tabular figures, row click → detail drawer (edit in place there), no double-click edit, paginate 20/50/100.
- Light and dark both work; appearance preference is system/light/dark and stored as the preference.

A project may replace the whole skin (neutrals, accent, fonts, radius, shadows, motion, icons, brand) — `references/tokens.md`「换一整套皮肤」. The interaction rules above, one accent with its meaning, and the floors (contrast, 12px, 44px, colour never the only signal, reduced motion) stay; the look itself (black and white, flat 1px cards, 120–240ms motion, weights to 600) is the default skin's.

## References

| File | Read when |
| --- | --- |
| `references/principles.md` | Making any judgement call; explaining why |
| `references/tokens.md` | Colours, categorical colours, type, in-app text size, spacing, radius, shadow, motion, knobs, presets, dark mode |
| `references/components.md` | Picking or using a component; its sizes and behaviour |
| `references/patterns/overlays.md` | Dialog vs drawer vs sheet vs popover; inspector, command palette; sizes; closing; stacking; embedded pages |
| `references/patterns/feedback.md` | Toast, undo vs confirm, errors, loading, the five data states, infinite scroll, upload queue |
| `references/patterns/forms.md` | Fields, validation, submit, selection controls |
| `references/patterns/list-crud.md` | Any list/table page with create, edit, delete |
| `references/patterns/filters.md` | Search and filters on a list; faceted filters |
| `references/patterns/entry-pages.md` | Activation, invite, OAuth consent, sign-in return pages |
| `references/patterns/one-time-secret.md` | API keys and other values shown once |
| `references/patterns/annotations.md` | Select text → comment → thread side panel |
| `references/patterns/settings.md` | Settings and preferences pages |
| `references/patterns/layout.md` | App shell, workbench shell (rail, secondary column, inspector), page widths, responsive rules |
| `references/content.md` | Any visible text |
| `references/adoption.md` | Installing into a project, knobs, guards, upgrading, non-React, native apps |
| `references/downstream.md` | What the system owns vs a project's skin; the `consumers.json` list; pushing a change down; bringing a project's idea back |
| `references/checklist.md` | Before handing over UI work |
| `references/decisions.md` | Why a default is what it is; where Jim's past projects disagreed |

## Relation to other skills

- `design-in-pencil` / `pencil-to-code`: own the Pencil workflow. When a project uses jim-uiux, its Pencil variables and components mirror this kit (same names, same values).
- `dataviz`: owns charts. Charts use this theme's surfaces and text tokens, and series colours in `CHART_SERIES` order (`lib/categorical.ts`).
- Project `AGENTS.md` / `docs/DESIGN.md`: override this skill where they speak.

## Changing the system

The system evolves. Change a default in one place: theme → component → gallery
example → the reference doc → `references/decisions.md` (why) →
`CHANGELOG.md` (bump the version in `gallery/package.json`) →
`pnpm --dir gallery registry:build` → `pnpm --dir gallery test` and `typecheck` →
open a pull request (Jim reviews every change); merging to main runs
`.github/workflows/deploy.yml`, which deploys the gallery and registry to
GitHub Pages (`/version.json` shows what is live).

Then carry it downstream (`references/downstream.md`). `consumers.json` lists
the projects built on this system. `pnpm --dir gallery consumers --affected <ref>`
names the projects a change reaches and why; `pnpm --dir gallery consumers`
shows, for each, the version its design doc names and which `@jim` files differ
from the source here (`-` lines are upstream changes it lacks, `+` lines are its
own), then sums up what projects added on top of the kit. Upgrade each project
in its own pull request; `aligned` projects port the change into their own
components. What several projects added is the first candidate to come back
here — the list and the bar are in `references/downstream.md`.
