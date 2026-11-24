import { s } from "@/registry/jim/lib/strings"
import { t } from "../i18n"

/**
 * Names the studio shows. Values never live here: presets come from the theme files, and a
 * preset without a name below still shows up (under its file name).
 */
export const NEUTRAL_LABELS: Record<string, string> = {
  "": t("纯灰", "Gray"),
  warm: t("暖灰", "Warm"),
  slate: t("冷灰", "Slate"),
  sage: t("灰绿", "Sage"),
  mauve: t("灰紫", "Mauve"),
  custom: t("自定义", "Custom"),
}

export const ACCENT_LABELS: Record<string, string> = {
  "": t("墨", "Ink"),
  blue: t("蓝", "Blue"),
  indigo: t("靛", "Indigo"),
  violet: t("紫", "Violet"),
  pink: t("玫红", "Pink"),
  teal: t("青", "Teal"),
  custom: t("自定义", "Custom"),
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
  "--background": t("画布", "Canvas"),
  "--sunken": t("下沉表面", "Sunken"),
  "--muted": t("填充", "Fill"),
  "--popover": t("浮层", "Popover"),
  "--selected": t("选中行", "Selected row"),
  "--inverse": t("反色底", "Inverse"),
  "--inverse-foreground": t("反色文字", "Inverse text"),
  "--foreground": t("正文", "Text"),
  "--muted-foreground": t("次要文字", "Muted text"),
  "--faint-foreground": t("元信息", "Faint text"),
  "--border": t("细线", "Border"),
  "--input": t("控件边框", "Control border"),
  "--primary": t("强调色", "Accent"),
  "--primary-foreground": t("强调色上的文字", "Text on accent"),
  "--ring": t("焦点环", "Focus ring"),
  "--destructive": t("危险", "Danger"),
  "--destructive-subtle": t("危险浅底", "Danger subtle"),
  "--success": t("成功", "Success"),
  "--success-subtle": t("成功浅底", "Success subtle"),
  "--warning": t("警告", "Warning"),
  "--warning-subtle": t("警告浅底", "Warning subtle"),
  "--info": t("信息", "Info"),
  "--info-subtle": t("信息浅底", "Info subtle"),
}

export function tokenLabel(token: string) {
  const cat = token.match(/^--cat-([a-z]+)(-subtle)?$/)
  if (cat) {
    const name = (s().colorName as Record<string, string>)[cat[1]] ?? cat[1]
    return t(`分类色 ${name}${cat[2] ? " 浅底" : ""}`, `Category ${name.toLowerCase()}${cat[2] ? " subtle" : ""}`)
  }
  return TOKEN_LABELS[token] ?? token
}
