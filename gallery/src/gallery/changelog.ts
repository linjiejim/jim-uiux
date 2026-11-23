import { parseChangelog } from "@/registry/jim/lib/changelog"

/** The kit's own CHANGELOG.md, read in at build time (vite.config.ts), as the app would its own. */
export const kitReleases = parseChangelog(__JIM_UIUX_CHANGELOG__)
export const RELEASES_URL = "https://github.com/linjiejim/jim-uiux/releases"
