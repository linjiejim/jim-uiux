# jim-uiux

一套小而有主见的 React UI/UX 设计系统：Notion 式的简洁，默认黑白，用几个旋钮换主题。三样东西放在同一个仓库里，免得互相脱节：

- **Agent 技能**（`SKILL.md` + `references/`）：已经定好的默认值，包括 token、弹框和抽屉尺寸、表格行为、反馈、文案规范。agent 做界面时不用再纠结小事。
- **shadcn registry**（`@jim/*`）：按这些规范做的 Radix + Tailwind v4 组件，地址 `https://design.linjiejim.com/r/{name}.json`。
- **活的 gallery**：**https://design.linjiejim.com** ，跑的是真组件，主题旋钮可以实时切换。

另有一组 vitest 守卫：项目里出现裸色值、小于 12px 的字、原生弹框、emoji 图标，或任一主题的 WCAG 对比度不达标，测试就会失败。

[English →](README.md)

## 用组件

前提是 React 项目已配好 Tailwind v4 和 `@/*` 别名。在 `components.json` 里加上 registry：

```json
{ "registries": { "@jim": "https://design.linjiejim.com/r/{name}.json" } }
```

然后全装，或者只装需要的：

```bash
npx shadcn@latest add @jim/all @jim/guards
npx shadcn@latest add @jim/theme @jim/button @jim/dialog
```

完整接入步骤（CSS 引入、Provider、守卫、`docs/DESIGN.md`）见 [`references/adoption.md`](references/adoption.md)。

## 用技能

把仓库克隆到 agent 的技能目录，以 Claude Code 为例：

```bash
git clone https://github.com/linjiejim/jim-uiux ~/.claude/skills/jim-uiux
```

做界面相关的事（「做个设置页」「把这个界面打磨一下」）时会自动触发。项目自己的规则（`AGENTS.md`、已有的设计系统）优先。

## 用它做的项目

- [Retrace](https://github.com/linjiejim/retrace)：Git 历史查看器（桌面版）
- [Arbor](https://github.com/linjiejim/featuretree)：工业建模互动课
- [Greenhouse](https://github.com/linjiejim/greenhouse)：自带品牌和 token，交互、反馈和文案跟 jim-uiux

名单和同步方式在 [`consumers.json`](consumers.json)；`pnpm --dir gallery consumers` 逐个比对它们和这里的差异。

## 开发

```bash
cd gallery
pnpm install
pnpm dev              # http://localhost:5188 ，也提供 /r/{name}.json
pnpm test             # 守卫，在 gallery 自己身上跑
pnpm registry:build   # 重新生成 registry.json 和 public/r/*.json
pnpm consumers        # 下游项目和这里差在哪（需要 gh）
```

push 到 `main` 会把 gallery 和 registry 发布到 GitHub Pages，`/version.json` 写着线上是哪个版本。怎么改默认值，见 [`SKILL.md`](SKILL.md) 的「Changing the system」。

## 许可

MIT
