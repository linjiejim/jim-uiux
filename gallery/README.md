# jim-uiux gallery

活的组件参考，同时也是 shadcn registry 的源。

```bash
pnpm install
pnpm dev              # http://localhost:5188 ，也提供 /r/{name}.json
pnpm test             # 守卫：在 gallery 自己身上跑（design-guard.config.json）
pnpm typecheck
pnpm registry:build   # 生成 registry.json，再生成 public/r/*.json
pnpm build            # 静态站点，输出到 dist/（含 r/）
```

线上：https://design.linjiejim.com （GitHub Pages）。PR 只跑检查；push 到 main 时，`.github/workflows/deploy.yml` 会检查、构建并发布到 Pages，`/version.json` 写着线上是哪个版本和提交。CI 会检查 `public/r` 是否已重新生成，所以改完组件要先跑 `pnpm registry:build` 再提交。

- `src/registry/jim/`：要分发的东西（theme、ui、hooks、lib、guards）。改这里。
- `src/gallery/`：演示页，不分发。
- `scripts/gen-registry.mjs`：从 import 推导依赖，并把版本锁定到本 package.json 的主版本。
- 加组件的顺序：组件 → gallery 示例 → `references/components.md` → `pnpm registry:build` → `pnpm test`。
