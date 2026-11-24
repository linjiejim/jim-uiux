import { configureStrings, en, zh } from "@/registry/jim/lib/strings"

/*
 * The gallery's language: Chinese or English, fixed for the page's lifetime.
 * Chosen by ?lang=, then the saved choice, then the browser. Switching saves and reloads, so
 * everything built at load (sample data, route names, studio labels, memoized table columns)
 * comes back in the new language. Pages write both: t("中文", "English").
 */
export type Lang = "zh" | "en"
const KEY = "gallery:lang"

function detect(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")
    if (fromUrl === "zh" || fromUrl === "en") return fromUrl
    const saved = localStorage.getItem(KEY)
    if (saved === "zh" || saved === "en") return saved
  } catch {
    // no storage (private mode): fall through to the browser
  }
  return typeof navigator !== "undefined" && !/^zh\b/i.test(navigator.language) ? "en" : "zh"
}

export const lang: Lang = typeof window === "undefined" ? "zh" : detect()

// The kit's own copy and formatters follow the same choice, before anything renders.
configureStrings(lang === "en" ? en : zh)
if (typeof document !== "undefined") document.documentElement.lang = lang === "en" ? "en" : "zh-CN"

/** The Chinese or the English version, by the page's language. Works for strings and JSX. */
export function t<T>(zhText: T, enText: T): T {
  return lang === "en" ? enText : zhText
}

export function setLang(next: Lang) {
  if (next === lang) return
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // not saved: the reload below still switches through the URL
  }
  const url = new URL(window.location.href)
  url.searchParams.delete("lang")
  if (localStorage.getItem(KEY) !== next) url.searchParams.set("lang", next)
  window.location.replace(url.toString())
  if (url.toString() === window.location.href) window.location.reload()
}
