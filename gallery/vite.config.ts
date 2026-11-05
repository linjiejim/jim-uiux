import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const { version } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"))

function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim()
  } catch {
    return "unknown"
  }
}

// /version.json says which build is live, so a missed deploy shows at a glance.
const versionFile = (): Plugin => ({
  name: "jim-uiux-version",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version, commit: commit() }) + "\n" })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), versionFile()],
  define: { __JIM_UIUX_VERSION__: JSON.stringify(version) },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { port: 5188 },
})
