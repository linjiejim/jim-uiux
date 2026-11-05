/** Upload queue core: failures always end in "failed" and free their slot; concurrency holds. */
import { describe, expect, it } from "vitest"
import { createUploadQueue, UploadRejected, type UploadItem, type UploadRun } from "@/registry/jim/ui/upload-queue"

const settle = async () => {
  for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0))
}
const file = (name: string) => new File(["x"], name)

function queue(run: UploadRun, concurrency = 1) {
  let items: UploadItem[] = []
  const q = createUploadQueue({ run, concurrency }, (next) => (items = next))
  return { q, rows: () => items.map((i) => [i.file.name, i.status, i.retryable ?? null, i.error ?? null]) }
}

describe("upload queue", () => {
  it("a runner that throws synchronously ends failed and frees its slot", async () => {
    const { q, rows } = queue((f) => {
      if (f.name === "big.mov") throw new UploadRejected("文件超过 20 MB")
      if (f.name === "boom.jpg") throw new Error("网络中断")
      return Promise.resolve("added")
    })
    q.add([file("big.mov"), file("boom.jpg"), file("ok.jpg")])
    await settle()
    expect(rows()).toEqual([
      ["big.mov", "failed", false, "文件超过 20 MB"],
      ["boom.jpg", "failed", true, "网络中断"],
      ["ok.jpg", "added", null, null],
    ])
  })

  it("a rejected promise fails the same way, and retry runs it again", async () => {
    let attempts = 0
    const { q, rows } = queue(async () => {
      if (++attempts === 1) throw new Error("网络中断")
      return "exists"
    })
    q.add([file("a.jpg")])
    await settle()
    expect(rows()).toEqual([["a.jpg", "failed", true, "网络中断"]])
    q.retry(q.items[0].id)
    await settle()
    expect(rows()).toEqual([["a.jpg", "exists", true, null]])
  })

  it("never runs more than `concurrency` at once", async () => {
    let live = 0
    let peak = 0
    const { q, rows } = queue(async () => {
      peak = Math.max(peak, ++live)
      await new Promise((r) => setTimeout(r, 5))
      live--
    }, 2)
    q.add(["1", "2", "3", "4", "5"].map((n) => file(`${n}.jpg`)))
    await new Promise((r) => setTimeout(r, 60))
    expect(peak).toBe(2)
    expect(rows().every((r) => r[1] === "added")).toBe(true)
  })
})
