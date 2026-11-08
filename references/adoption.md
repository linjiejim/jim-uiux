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
8. 在 jim-uiux 仓库的 `consumers.json` 里登记这个项目（见下文「下游项目登记」）。以后 jim-uiux 有改动，靠这份名单找到要同步的项目。

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

## 下游项目登记

jim-uiux 仓库根目录的 `consumers.json` 是用这套系统的项目名单，每个项目一条：

| 字段 | 含义 |
| --- | --- |
| `name` | 短名，命令行里用 |
| `repo` | GitHub 的 `owner/name` |
| `site` | 线上地址（可选） |
| `mode` | `registry`：用 shadcn 从 `@jim` 装组件，可以自动比对；`aligned`：有自己的 token 和组件，规则跟 jim-uiux，改动要手动移植 |
| `root` | `components.json` 所在目录，相对仓库根（monorepo 里常是子目录） |
| `design` | 项目的 `DESIGN.md` 路径，相对仓库根；第一行写「基于 jim-uiux X.Y.Z」，脚本从这里读版本号 |
| `summary` | 一句话：项目是什么，旋钮怎么选的 |

只登记长期维护的项目；试验性的原型不登记。项目停止维护或换掉设计系统时删掉它那条。

检查（在 jim-uiux 的 `gallery/` 里跑，需要登录好的 `gh`）：

```bash
pnpm consumers                          # 每个项目：标的版本、装了哪些文件、哪些和这里不一样、自己加了哪些组件
pnpm consumers retrace --diff dialog    # 看一个文件的具体差异：- 是上游，+ 是项目自己的
pnpm consumers retrace --path ~/Code/retrace   # 读本地检出（比如同步分支），不读 GitHub
pnpm consumers --discover --owner linjiejim    # 找提到 jim-uiux 但还没登记的仓库
```

默认读各仓库 GitHub 上的默认分支，对照的是本地 jim-uiux 源码（包括还没发布的改动）。比较前去掉了 `shadcn add` 会改写的部分（`"use client"`、`@/registry/jim/*` 的导入路径），剩下的差异都是真的：要么项目落后，要么项目改过。

## 已有设计系统的项目

- 项目自己的 token 和组件优先，不要引入第二套。
- 本技能只用来补空白：交互模式、行为、文案，以及项目没有定义的尺寸。
- 想逐步迁移时，先把项目的 token 名对齐到 shadcn 的语义名，再按组件逐个替换。

## 非 React 项目（Vue / Nuxt / 纯 CSS）

- 拿 `jim-theme.css`（任何 Tailwind v4 项目都能用；不用 Tailwind 的项目也可以只用里面的 CSS 变量）、守卫和本技能的文档。
- 组件按 `components.md` 的规格，用对应生态的 headless 库来做（Vue 用 Reka UI 或 shadcn-vue）。

## 原生移动端

原生端用系统组件表达同样的意思，不追求和 web 长得一样。

- token 只管颜色和语义：同样的语义名、同样的值写进 `theme.ts`（浅色、深色各一份，分类色也一样）。
- 字号跟平台：正文用平台默认（iOS 17、Android 16），标题用平台的阶梯；不照搬 web 的 14。
- 字重 400 / 500 / 600 的上限只约束 web；原生标题跟平台（iOS HIG 的大标题、标题 700）。
- 按钮、sheet、Alert、菜单、开关、分段控件用系统组件，高度和圆角跟系统；触控目标 ≥ 44pt。
- 底部弹层用系统 sheet（expo-router 的 formSheet / SwiftUI sheet），不用 JS 画。
- 用户操作失败可以用系统 Alert（见 `patterns/feedback.md`）；字段错误、区块加载失败仍然就地显示。
- 应用内文字大小（`tokens.md`）乘在字号阶梯上，系统 Dynamic Type 再乘一次。
- 毛玻璃之类的系统材质只用在控件层（输入栏、浮动按钮），内容放在实心表面上。
- 交互模式、文案、五种数据状态、撤销与确认的规则照样适用。

## 升级

1. 看 `CHANGELOG.md`，确认从当前版本到目标版本之间改了什么。在 jim-uiux 里跑 `pnpm --dir gallery consumers <项目名>`，看这个项目哪些文件和上游不一样。
2. 重新安装：`npx shadcn add @jim/<item> --overwrite`。会覆盖本地改动，所以先用 `pnpm --dir gallery consumers <项目名> --diff <item>` 看清 `+` 行（项目自己的改动）是不是有意的。如果是有意的，要么把它提回 jim-uiux，要么记进项目 `docs/DESIGN.md` 的例外里。
3. 跑守卫和项目自己的测试，用浅色、深色和手机宽度各截一张图。
4. 更新 `docs/DESIGN.md` 里的版本号。

## 把改动回馈给 jim-uiux

项目里发现更好的做法时：
1. 先在项目里验证。`consumers` 报告里的 `+` 行和「项目自己加的 ui 组件」就是候选。
2. 再按 SKILL.md 里「Changing the system」的顺序改回 jim-uiux。
3. 在 `decisions.md` 里写清原因。
