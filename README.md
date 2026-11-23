# jim-uiux

A small, opinionated UI/UX design system for React apps — Notion-like minimal,
black and white by default, themeable through a few knobs. It ships as three
things that stay in one repo so they can't drift apart:

- **An agent skill** (`SKILL.md` + `references/`): the decided defaults — tokens,
  dialog and drawer sizes, table behaviour, feedback, copy rules — so an agent
  building UI doesn't re-decide small things.
- **A shadcn registry** (`@jim/*`): Radix + Tailwind v4 components built to those
  specs, served from `https://design.linjiejim.com/r/{name}.json`.
- **A living gallery** at **https://design.linjiejim.com** that runs the real
  components, with the theme knobs live, and a
  [theme studio](https://design.linjiejim.com/#/studio): tune neutrals, accent,
  contrast, radius, density and spacing on the real components, see every
  contrast check pass, and export the skin as CSS.

Plus vitest guards that fail a project's build on raw colours, text under 12px,
native dialogs, emoji icons and WCAG contrast misses in every theme (each preset
combination, light and dark, and the OS "increase contrast" mode).

[中文说明 →](README.zh-CN.md)

## Use the components

In a React project with Tailwind v4 and the `@/*` alias, add the registry to
`components.json`:

```json
{ "registries": { "@jim": "https://design.linjiejim.com/r/{name}.json" } }
```

Then install everything, or just what you need:

```bash
npx shadcn@latest add @jim/all @jim/guards
npx shadcn@latest add @jim/theme @jim/button @jim/dialog
```

Full setup (CSS imports, providers, guards, `docs/DESIGN.md`):
[`references/adoption.md`](references/adoption.md).

## Use the skill

Clone the repo into your agent's skills folder, e.g. for Claude Code:

```bash
git clone https://github.com/linjiejim/jim-uiux ~/.claude/skills/jim-uiux
```

The skill triggers on UI work ("build a settings page", "polish this UI").
Project rules (`AGENTS.md`, an existing design system) win where they exist.

## Built with it

- [Retrace](https://github.com/linjiejim/retrace): a desktop Git history viewer
- [Arbor](https://github.com/linjiejim/featuretree): interactive lessons in parametric CAD
- [Greenhouse](https://github.com/linjiejim/greenhouse): keeps its own brand and tokens, follows jim-uiux for interaction, feedback and copy
- [Ivan](https://github.com/linjiejim/ivan): its own 「墨」 skin and components; shares the interaction rules

The list lives in [`consumers.json`](consumers.json). Projects share the
interaction layer and may bring their own skin; how changes travel both ways is
in [`references/downstream.md`](references/downstream.md).

## Develop

```bash
cd gallery
pnpm install
pnpm dev              # http://localhost:5188, also serves /r/{name}.json
pnpm test             # the guards, run on the gallery itself
pnpm registry:build   # regenerate registry.json and public/r/*.json
pnpm consumers        # how downstream projects differ from here (needs gh)
```

Push to `main` deploys the gallery and registry to GitHub Pages;
`/version.json` shows what is live. How to change a default: see "Changing the
system" in [`SKILL.md`](SKILL.md).

The docs are written in Chinese; component APIs and code are in English.

### Screenshots in pull requests

```bash
node scripts/pr-assets.mjs 14 light.png dark.png demo.mp4   # 14 is the PR number; before opening it, use draft
```

The script commits the files to `refs/pr-assets/pr-14` in this repository and
prints markdown to paste into the PR description (links pinned to the commit
SHA; videos become GIFs if `ffmpeg` is installed). The ref is outside
`refs/heads`, so `git clone` never downloads the images. Uploads are public for
good: no real user data, keys or local paths. Where that push is refused
(Claude cloud sessions only allow `refs/heads/*`), the script pushes a
`pr-assets-inbox/…` branch instead and the
[PR assets inbox](.github/workflows/pr-assets-inbox.yml) workflow moves it over.
Same script as excalidesk's; keep the two in sync.

## License

MIT
