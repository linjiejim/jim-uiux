import { parseChangelog } from "@/registry/jim/lib/changelog"
import { t } from "./i18n"

/** The kit's own CHANGELOG.md (CHANGELOG.en.md in English), read in at build time (vite.config.ts), as an app would its own. */
export const kitReleases = parseChangelog(t(__JIM_UIUX_CHANGELOG__, __JIM_UIUX_CHANGELOG_EN__))
export const RELEASES_URL = "https://github.com/linjiejim/jim-uiux/releases"
