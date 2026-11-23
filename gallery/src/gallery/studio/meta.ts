/**
 * Names the studio shows. Values never live here: presets come from the theme files, and a
 * preset without a name below still shows up (under its file name).
 */
export const NEUTRAL_LABELS: Record<string, string> = {
  "": "纯灰",
  warm: "暖灰",
  slate: "冷灰",
  sage: "灰绿",
  mauve: "灰紫",
  custom: "自定义",
}

export const ACCENT_LABELS: Record<string, string> = {
  "": "墨",
  blue: "蓝",
  indigo: "靛",
  violet: "紫",
  pink: "玫红",
  teal: "青",
  custom: "自定义",
}

/** Which neutral each accent preset reads best on (Radix's pairing advice, adapted). */
export const PAIRING: Record<string, string> = {
  blue: "slate",
  indigo: "slate",
  violet: "mauve",
  pink: "mauve",
  teal: "sage",
}

export const TOKEN_LABELS: Record<string, string> = {
  "--background": "画布",
  "--sunken": "下沉表面",
  "--muted": "填充",
  "--popover": "浮层",
  "--selected": "选中行",
  "--inverse": "反色底",
  "--inverse-foreground": "反色文字",
  "--foreground": "正文",
  "--muted-foreground": "次要文字",
  "--faint-foreground": "元信息",
  "--border": "细线",
  "--input": "控件边框",
  "--primary": "强调色",
  "--primary-foreground": "强调色上的文字",
  "--ring": "焦点环",
  "--destructive": "危险",
  "--destructive-subtle": "危险浅底",
  "--success": "成功",
  "--success-subtle": "成功浅底",
  "--warning": "警告",
  "--warning-subtle": "警告浅底",
  "--info": "信息",
  "--info-subtle": "信息浅底",
}

export function tokenLabel(t: string) {
  const cat = t.match(/^--cat-([a-z]+)(-subtle)?$/)
  if (cat) return `分类色 ${cat[1]}${cat[2] ? " 浅底" : ""}`
  return TOKEN_LABELS[t] ?? t
}
