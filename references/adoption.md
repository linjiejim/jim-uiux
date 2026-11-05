# 接入与维护

## 新的 React 项目（Vite / Next）

前提：已经配好 Tailwind v4 和 `@/*` 路径别名。

1. registry 地址：线上 `https://design.linjiejim.com/r/{name}.json`（push 到 main 后由 CI 自动部署）。调试未发布的改动时，用本地 `pnpm --dir <jim-uiux 仓库>/gallery dev`，地址换成 `http://localhost:5188/r/{name}.json`。
2. 项目根目录的 `components.json`：

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york", "rsc": false, "tsx": true,
     "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
     "iconLibrary": "lucide",
     "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
     "registries": { "@jim": "https://design.linjiejim.com/r/{name}.json" }
   }
   ```

   Next.js 的 App Router 项目把 `rsc` 设为 `true`，`css` 指向 `app/globals.css`。交互组件都带了 `"use client"`，但还没有在 Next 项目里实际装过一次，第一次用时先跑一遍构建。
3. 安装：

   ```bash
   npx shadcn@latest add @jim/all @jim/guards --yes --overwrite
   ```

   这一步会覆盖 `lib/utils.ts`：新的 `cn()` 让 tailwind-merge 认识语义字号，否则 `text-body` 和 `text-muted-foreground` 合并时会丢掉一个。
4. 主 CSS 文件：

   ```css
   @import "tailwindcss";
   @import "./styles/jim-theme.css";
   /* 可选预设：@import "./styles/presets/warm.css"; */
   ```

5. 入口文件：
   - `import "@fontsource-variable/inter"`。
   - 外面包一层 `<LucideProvider strokeWidth={1.75}>`、`<TooltipProvider>`，并渲染 `<Toaster />`。
   - 把 `APPEARANCE_BOOT_SCRIPT` 内联到 `<head>`。
6. 守卫：在项目根目录放 `design-guard.config.json`（字段见 `guards/guard-lib.ts`），然后跑 `npx vitest run tests/design`。把它加进 CI 或本地的检查流程。
7. 写 `docs/DESIGN.md`（模板见下文）。

也可以只装需要的部分：`npx shadcn add @jim/theme @jim/button @jim/dialog`，registry 会自动带上依赖。

## 项目的 docs/DESIGN.md 模板

```markdown
# 设计

基于 jim-uiux <版本号>（见 https://github.com/linjiejim/jim-uiux）。本文只记录与默认值不同的地方。

## 旋钮
- 强调色：默认黑色
- 圆角：默认 8
- 密度：舒适
- 默认外观：跟随系统

## 状态词表
| 词 | 色调 |
| …

## 例外
- <哪里> 用了 <什么>，因为 <原因>。（代码对应的行上有 design-allow 注释）
```

## 已有设计系统的项目

- 项目自己的 token 和组件优先，不要引入第二套。
- 本技能只用来补空白：交互模式、行为、文案，以及项目没有定义的尺寸。
- 想逐步迁移时，先把项目的 token 名对齐到 shadcn 的语义名，再按组件逐个替换。

## 非 React 项目（Vue / Nuxt / 纯 CSS）

- 拿 `jim-theme.css`（任何 Tailwind v4 项目都能用；不用 Tailwind 的项目也可以只用里面的 CSS 变量）、守卫和本技能的文档。
- 组件按 `components.md` 的规格，用对应生态的 headless 库来做（Vue 用 Reka UI 或 shadcn-vue）。

## 原生移动端

还没有覆盖（规划在第三期）。在那之前：
- token 按同样的值写进 `theme.ts`。
- 底部弹层用系统自带的 sheet（expo-router 的 formSheet）。
- 交互模式、文案和状态规则照样适用。

## 升级

1. 看 `CHANGELOG.md`，确认从当前版本到目标版本之间改了什么。
2. 重新安装：`npx shadcn add @jim/<item> --overwrite`。会覆盖本地改动，所以先用 `git diff` 确认这些改动是有意的。如果是有意的，要么把它提回 jim-uiux，要么记进项目 `docs/DESIGN.md` 的例外里。
3. 跑守卫和项目自己的测试，用浅色、深色和手机宽度各截一张图。
4. 更新 `docs/DESIGN.md` 里的版本号。

## 把改动回馈给 jim-uiux

项目里发现更好的做法时：
1. 先在项目里验证。
2. 再按 SKILL.md 里「Changing the system」的顺序改回 jim-uiux。
3. 在 `decisions.md` 里写清原因。
