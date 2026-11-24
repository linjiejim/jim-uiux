<img src="gallery/public/favicon.svg" width="56" alt="">

# jim-uiux

一套小而有主见的 React UI/UX 设计系统：Notion 式的简洁，默认黑白，用几个旋钮换主题。三样东西放在同一个仓库里，免得互相脱节：

- **Agent 技能**（`SKILL.md` + `references/`）：已经定好的默认值，包括 token、弹框和抽屉尺寸、表格行为、反馈、文案规范。agent 做界面时不用再纠结小事。
- **shadcn registry**（`@jim/*`）：按这些规范做的 Radix + Tailwind v4 组件，地址 `https://design.linjiejim.com/r/{name}.json`。
- **活的 gallery**：**https://design.linjiejim.com** ，跑的是真组件，主题旋钮可以实时切换；[主题工作室](https://design.linjiejim.com/#/studio)里调中性色、强调色、对比度、圆角、密度和留白，逐条校验对比度，导出皮肤 CSS。

另有一组 vitest 守卫：项目里出现裸色值、小于 12px 的字、比 600 更粗的字重、原生弹框、emoji 图标、写死的 z-index / 时长 / 曲线、`dark:` 颜色覆盖、「确定」「提交」这类按钮文案，或任一主题（每个预设组合、浅色深色、增强对比度）的 WCAG 对比度不达标，测试就会失败。

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
- [Ivan](https://github.com/linjiejim/ivan)：自己的皮肤「墨」和组件，交互规则一致

名单在 [`consumers.json`](consumers.json)。各项目共用交互层，皮肤可以自己换；改动怎么往下推、项目的好做法怎么提回来，见 [`references/downstream.md`](references/downstream.md)。

## 开发

```bash
cd gallery
pnpm install
pnpm dev              # http://localhost:5188 ，也提供 /r/{name}.json
pnpm test             # 守卫，在 gallery 自己身上跑
pnpm e2e              # 每个页面 × 浅色 / 深色 / 手机 / 增强对比度跑 axe，加交互检查和截图
pnpm e2e:baselines    # 在 Docker 里重做截图基线（和 CI 同一个镜像）
pnpm registry:build   # 重新生成 registry.json 和 public/r/*.json
pnpm consumers        # 下游项目和这里差在哪（需要 gh）
```

push 到 `main` 会把 gallery 和 registry 发布到 GitHub Pages，`/version.json` 写着线上是哪个版本。怎么改默认值，见 [`SKILL.md`](SKILL.md) 的「Changing the system」。

### PR 里的截图和录屏

```bash
node scripts/pr-assets.mjs 14 light.png dark.png demo.mp4   # 14 是 PR 号；还没开 PR 就写 draft
```

脚本把文件提交到本仓库的 `refs/pr-assets/pr-14`，在标准输出打印一段 markdown，直接贴进 PR 描述：链接钉在提交 SHA 上；装了 `ffmpeg` 的话视频会转成 GIF 内嵌。

- 这个 ref 不在 `refs/heads` 下，`git clone`、`git fetch` 默认都不拉，仓库不会因为截图变大。
- **传上去就永久公开**：截图里不能有真实用户的数据、密钥、本机路径。
- Claude 云端会话只能推 `refs/heads/*`：脚本被拒后改推临时分支 `pr-assets-inbox/<PR号>-<随机>`，[PR assets inbox](.github/workflows/pr-assets-inbox.yml) 工作流把素材搬进 `refs/pr-assets/pr-<PR号>` 再删掉分支。
- 想看一个 PR 传过哪些文件：`git fetch origin refs/pr-assets/pr-14 && git ls-tree -r --name-only FETCH_HEAD`。
- 脚本和 excalidesk 的是同一份，改了两边一起同步。

## 许可

MIT
