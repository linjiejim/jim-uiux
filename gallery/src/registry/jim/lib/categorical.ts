/**
 * Categorical colours: a colour the user chose (tag, project, select option) or a chart series.
 * Nine named pairs in the theme (--cat-<name> for text, dots and bars; --cat-<name>-subtle for
 * the fill behind a tag), light and dark. They are data, not a second accent: never on buttons,
 * links or navigation, and never the only signal — a tag still carries its name.
 * Store the name ("blue"), never a hex; draw through catClass() so Tailwind sees whole class names.
 */
export const CATEGORICAL = ["gray", "red", "orange", "amber", "green", "teal", "blue", "purple", "pink"] as const

export type Categorical = (typeof CATEGORICAL)[number]

/** Chart series order: hues far apart from their neighbours. Series beyond nine repeat. */
export const CHART_SERIES: readonly Categorical[] = ["blue", "orange", "purple", "teal", "pink", "amber", "red", "green", "gray"]

const classes: Record<Categorical, { fg: string; fill: string; dot: string }> = {
  gray: { fg: "text-cat-gray", fill: "bg-cat-gray-subtle", dot: "bg-cat-gray" },
  red: { fg: "text-cat-red", fill: "bg-cat-red-subtle", dot: "bg-cat-red" },
  orange: { fg: "text-cat-orange", fill: "bg-cat-orange-subtle", dot: "bg-cat-orange" },
  amber: { fg: "text-cat-amber", fill: "bg-cat-amber-subtle", dot: "bg-cat-amber" },
  green: { fg: "text-cat-green", fill: "bg-cat-green-subtle", dot: "bg-cat-green" },
  teal: { fg: "text-cat-teal", fill: "bg-cat-teal-subtle", dot: "bg-cat-teal" },
  blue: { fg: "text-cat-blue", fill: "bg-cat-blue-subtle", dot: "bg-cat-blue" },
  purple: { fg: "text-cat-purple", fill: "bg-cat-purple-subtle", dot: "bg-cat-purple" },
  pink: { fg: "text-cat-pink", fill: "bg-cat-pink-subtle", dot: "bg-cat-pink" },
}

/** A stored value as a colour name. Unknown or missing values fall back to a stable pick from `key` (or gray). */
export function categoricalFor(value: string | null | undefined, key?: string): Categorical {
  if (value && (CATEGORICAL as readonly string[]).includes(value)) return value as Categorical
  if (!key) return "gray"
  let h = 0
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)!) >>> 0
  return CATEGORICAL[h % CATEGORICAL.length]
}

/** Class names for a colour: `fg` text or icon, `fill` the tag background, `dot` a dot or bar. */
export function catClass(name: Categorical) {
  return classes[name]
}

/** CSS colour for SVG / canvas (charts): `var(--cat-blue)`. */
export function catVar(name: Categorical, fill = false) {
  return `var(--cat-${name}${fill ? "-subtle" : ""})`
}
