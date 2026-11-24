# Changelog

## 1.10.2 · 2026-11-24

Where a long read's table of contents goes, switching to pages that load on demand, and two more hand-over checks (see `references/decisions.md`, 1.10.2).

- `patterns/page-layouts.md` adds “Long read + contents”: the text is `narrow`, the contents column is 224 wide right beside it, and the two center together in the main area; the column folds away when they don't fit.
- `patterns/feedback.md`: switching to a page that loads on demand swaps the page header at once and shows a skeleton for the body after 300ms, never a blank block; pages the reader will likely open next are prefetched while idle.
- `checklist.md`: a wide (≥ 1600) screenshot to confirm pages are centered; switch pages quickly from the sidebar to confirm the body never goes blank.
- `consumers.json` lists ohmwork.

## 1.10.1 · 2026-11-24

English release notes, and `InlineRename` text that lines up with its column (see the rows marked 1.10.1 under 1.10.0 in `references/decisions.md`).

- New `CHANGELOG.en.md`: every release in English, matching `CHANGELOG.md` item for item. In English mode the gallery's update toast, “What's new” and the list in Settings read it; GitHub releases add the English after the Chinese. `patterns/updates.md` shows how an app in two languages picks one by its UI language.
- `InlineRename` text no longer sits 7px to the right of the column header and the rest of the column: the box grows outward on both sides and the text stays put. `DataTable` cells leave room for the box.
- Upgrading: `InlineRename` text moves 7px left (whatever follows it, 14px), and its box sticks out 7px on each side. Inside your own `truncate` or `overflow-hidden` container, or right next to an icon (a gap under 8px), make room for the box: `-mx-2 px-2` on the container, at least `gap-2` to the icon; otherwise the box gets cut off or covers the icon. Where there's no room, pass `className="mx-0 max-w-full"` to keep the old placement.

## 1.10.0 · 2026-11-24

Formatters, stricter guards, English copy, multi-select and inline rename; the whole gallery in Chinese or English, leaner, with render-level tests (see `references/decisions.md`, 1.10.0).

- New `lib/format.ts`: `formatDate` (“Oct 31” / “10月31日” this year; other years add the year), `formatRelative` (“just now”, “3 min ago”, “yesterday 09:00”; feeds only), `formatMoney` (“¥128,000”), `formatNumber`, `formatPercent`, `formatBytes`, `formatTime`. The language follows `locale` in `strings`.
- The kit ships English copy: `configureStrings(en)`. `Strings` adds `locale` and the relative-time phrases; an upload failure reason is no longer joined to its label with a hard-coded full-width colon.
- `Combobox` adds `multiple`: selected options show as chips that collapse into “+N” when they don't fit; on reopen, selected options are listed first; async search (loading, no results, retry on failure) and creating options; Backspace removes the last one.
- New component `InlineRename`: rename in place when the name is already on screen. Enter or clicking away saves, Esc cancels (without also closing the drawer or dialog around it); Enter that only confirms an IME composition (Chinese input) doesn't save; supports validation, async save and starting from a menu. `patterns/overlays.md` says when to use it and when a dialog is still the right choice.
- Five new guards: font weights above 600; z-index of 10 or more without a layer token (`z-[1]`–`z-[9]` stay for order inside a component); hard-coded durations and curves; `dark:` color overrides; button labels like “确定” (OK), “提交” (Submit) and “OK”.
- Gallery:
  - The whole site in Chinese or English: the “EN” / “中文” switch at the bottom of the sidebar, or `?lang=en`; sample data, dates and numbers switch too.
  - The sidebar is regrouped into four groups with shorter labels; a list's table and grid views are one item, switched from the page header.
  - Each page leads with the demos; background, rationale and source paths move into the ⓘ next to the title; the copy is much shorter.
  - New demos for multi-select and inline rename.
- Fixed (found by the render-level tests): the contrast guard computes on the 8-bit colors the screen actually shows, so light `--success-subtle` goes from 9% to 8% (the “Done” badge was only 4.49:1); a loading `Button` keeps its name (the text used to be hidden with `invisible`, so screen readers couldn't read it).
- Render-level tests: `pnpm e2e` (Playwright + axe) checks every page × light / dark / phone / more contrast for accessibility problems, plus interaction checks for focus return, the paging guard, reduced motion and the language switch, and a few screenshots; CI runs it on PRs. `pnpm e2e:baselines` remakes the screenshot baselines in Docker.
- Upgrading: after reinstalling `@jim/guards`, `font-bold`, bare z-index like `z-50`, hard-coded durations like `duration-300`, `dark:` color overrides and “确定” (OK) buttons in the project fail the guards; switch to tokens, or write `design-allow: <reason>` on that line. Projects with an English UI call `configureStrings(en)` at startup.

## 1.9.0 · 2026-11-24

Motion fixed, the remaining configurable values made tokens, and a batch of component correctness problems fixed (see `references/decisions.md`, 1.9.0). The default look is unchanged.

- Fixed: drawers animate when they close. The gallery's CRUD and list-detail demos cleared the selection the moment they closed, so the content unmounted at once; the new hook `useLastDefined` keeps the last content through the exit animation (`overlays.md` has the rule). Drawers and bottom sheets slide in and out fully opaque instead of fading as they slide; exit animations hold their end state (`forwards`), so an unmount one frame late doesn't flash back.
- Fixed: with the system's Reduce motion setting on, drawers, bottom sheets, the phone sidebar and the upload panel fade in and out (they used to appear and disappear at once). A new test makes sure that with `--motion` at 0 every enter and exit is a full fade and exits hold their end state.
- The gallery's “Motion” page is redone: it shows both enter and exit, adds “Slow ×5” and “Play with reduced motion”, includes drawers and bottom sheets, and compares the curves.
- Type sizes and fonts can now really be overridden: the values of `--text-*`, `--font-sans`, `--font-display` and `--font-mono` move to `:root`, so every `text-*` class follows an override; headings (h1–h4) use `--font-display`.
- New tokens: four stacking layers `--z-sticky` / `--z-float` / `--z-overlay` / `--z-toast`; focus `--focus-width`, `--focus-offset`, `--focus-halo`; `--disabled-opacity`. Under more contrast, the focus halo on text fields turns solid too. Transitions with no duration or curve default to `--duration-fast` + `--ease-out`.
- Focus: dialogs, drawers and confirm dialogs opened from code (Enter on a table row, a menu item, `useConfirm`) return focus to where it was when they close, instead of dropping it on the page; a dialog focuses its first input on open, not the ⓘ; the confirm button keeps focus while its action runs. New hook `useReturnFocus`.
- Drawer paging: with unsaved changes, ↑ / ↓ no longer page away (that used to drop the changes), and the previous / next buttons ask first; no paging while a dialog is open on top.
- `DataTable`: stays on the current page after an edit or delete (it used to jump back to page 1 on every data change); sorting goes back to page 1 and clears the selection; new prop `resetKey`, given a new value whenever search or filters change; server-side pagination remembers the page size too; menus and dialogs opened from a row no longer open the row by mistake; checkboxes have names (“Select all on this page”, “Select “Title””).
- Forms: `Select`, `Combobox`, `RadioGroup` and `SwatchPicker` show empty with `value={undefined}` (they used to keep the previous choice); `Checkbox` and `Switch` inside a `Field` take the field label as their name and are linked to its description and error; screen readers announce a field error when it appears (`Field`, `DetailList`); radio groups and sliders in `DetailList` edit mode have names.
- Filter bar: the ✕ has a 44 hit area on touch screens, and focus stays in the filter bar after clearing; both kinds of filter button open popovers of the same width, at most 320 tall; `Select` and `Combobox` get 8px collision padding.
- Touch: small icon buttons (`icon-sm`, 36) get a 44 hit area. Group spacing on settings pages follows the “Spacing” knob (40 at Standard).
- `Tooltip` works outside a `TooltipProvider` (it brings its own); `Tabs` focus rings and underlines are no longer clipped; the release notes dialog no longer flashes “No release notes yet” as it closes; `unseenReleases` returns nothing for a version that isn't SemVer.
- Upgrading: for tables with client-side pagination that filter `data` themselves, combine search and filters into a `resetKey` and pass it to `DataTable`; otherwise filtering doesn't go back to page 1 (it only falls back to the last page). The toast layer moves from sonner's 999999999 to `--z-toast` (60): if the project has custom layers above 60, raise `--z-toast`. `className` on `TabsList` applies only to the outer element, so `gap-*` and `justify-*` there no longer affect the tabs.

## 1.8.0 · 2026-11-23

A theme studio, more color presets, more contrast, layout spacing and page layout guidelines (see `references/decisions.md`, 1.8.0). The default skin's values are unchanged, and existing components work as before.

- New gallery page “Theme studio” (`#/studio`): tune the neutral (a preset, or hue + chroma), the accent (a preset, or any color), contrast (Soft ↔ High), radius (0–16), density, spacing and font, and the whole gallery takes them on live. Every contrast check (light, dark, more contrast) is listed, and failing colors are moved until they just pass; the exported skin file works when loaded after `jim-theme.css`, and “Copy link” shares the exact setup.
- New presets: neutrals `slate` (cool gray), `sage` (gray-green) and `mauve` (gray-purple), via `<html data-theme>`; accents in `accents.css`: blue, indigo, violet, pink and teal, via `<html data-accent>`, which pair with any neutral. Registry: `@jim/preset-slate`, `@jim/preset-sage`, `@jim/preset-mauve`, `@jim/preset-accents`.
- More contrast: turns on by itself when the system's Increase contrast setting is on (`prefers-contrast: more`), and `data-contrast="more"` forces it. Secondary text ≥ 7:1, metadata ≥ 5.5:1, control borders ≥ 3:1, a 3px focus ring; works with any skin.
- Spacing knob `data-spacing="compact|relaxed"` and tokens `--space-page`, `--space-section`, `--space-field`, `--space-card`; `Page`, `Section` and `FieldGroup` use them, with the same defaults as before.
- New components: `Slider` (value on the right, arrow keys adjust it), `SwatchPicker` (pick from a fixed set of colors; `categoricalOptions()` gives the nine categorical colors), `Stat` / `StatGrid` (dashboard metrics), `Card` / `CardGrid` (cards, and a card grid with automatic columns), `PageColumns` (a main column + a 320 side column). `strings.ts` adds `colorName`.
- New guidelines in `patterns/page-layouts.md`: overview, list, detail page, list-detail split, main + side column, settings, multi-step form, empty and result pages, single card, editor, board and card grid, each with its width, spacing and components, plus the rules for scrolling and sticky headers. The new gallery page “Layouts” has a wireframe of each.
- Guards: the contrast rules move into `guards/contrast-lib.ts` (the studio uses the same file); they now check every neutral preset × every accent preset × light / dark × more contrast. A missing token also counts as a failure.
- Details: the font is Inter with its optical size axis (`@fontsource-variable/inter/opsz.css`), so large text and numbers look finer, and Chinese is unaffected; headings use `text-wrap: balance`, paragraphs `pretty`; no gray tap highlight on touch screens.
- Fixed: on phones, a `PageHeader` with many actions keeps its title visible (the actions wrap to the next line).
- `Page` `narrow` / `wide` center in the main area (they used to sit at the left, leaving a large gap on the right in wide windows); `full` is unchanged.
- Gallery: “Theme” at the bottom left shares one set of settings with the studio (old settings migrate automatically) and switches the neutral and accent presets; the Forms page adds slider and swatch examples, the Color page explains the presets. The gallery has a logo: a “jim-uiux” wordmark whose hyphen is drawn as a switch turned on; a lowercase j (its dot a rounded square) is the favicon and app icon.
- Upgrading: for optical sizes, change the entry's `import "@fontsource-variable/inter"` to `import "@fontsource-variable/inter/opsz.css"` (it works without the change too). After reinstalling `@jim/guards`, the contrast test gains a more-contrast tier; a project skin with body text that is too light fails there. Pages no longer sit at the left: narrow and wide pages center in wide windows, so any `mx-auto` you wrapped around `Page`, or code that assumes left alignment, can go.

## 1.7.0 · 2026-11-23

The whole story for updates: how to prompt when a new version is out, how to say what changed after an update, how to write release notes, and how CI drafts them from commits (see `references/decisions.md`, 1.7.0). Existing components work as before.

- New guidelines in `patterns/updates.md`: what to say when (downloading, waiting for a restart, waiting for a reload, first open after updating, in settings); the `CHANGELOG.md` template (Heads-up / New / Improved / Fixed) and how to write it; the flow from commits to the Release, the update manifest and the app.
- New components `ReleaseNotesDialog` and `ReleaseNotes`, and hooks `useReleaseNotes` (says “Updated to x · See what's new” once after an update) and `useNewVersionPrompt` (a new web version is deployed: “Reload”). New lib `changelog.ts`: `parseChangelog`, `unseenReleases`, `compareVersions`; it also reads Keep a Changelog and release-please headings.
- New registry item `@jim/release-notes-script`: `scripts/release-notes.mjs`. `draft` drafts the next section from Conventional Commits, `notes` pulls out one version for the Release and the update manifest (falling back to the commits when there is none), and `check` verifies in a PR that the version has release notes. No dependencies; not part of `@jim/all`.
- `notify.info` can take an action; with one, it stays for 8 seconds.
- Fixed: a dialog opened by a toast action stays open (the button gives up focus before the action runs).
- `strings.ts` adds `whatsNew`, `seeWhatsNew`, `updatedTo`, `allReleaseNotes`, `releaseNotesEmpty`, `releaseDate`, `newVersionReady`, `reload`.
- Guidelines: `feedback.md`, `components.md`, `content.md`, `adoption.md` and `checklist.md` point to the new guidelines; `SKILL.md` gains a hard rule.
- Gallery: new page “Updates”; the version number in the sidebar opens jim-uiux's own release notes, and a new deploy prompts a reload.
- CI: PRs check that the version has a matching section; once merged to main and deployed, a new version gets a GitHub Release automatically (tags from `v1.7.0` on), with notes taken from `CHANGELOG.md`.
- Upgrading: desktop apps that use `notify.prompt` to say “Downloaded · Restart” (retrace, turnery) hook up `useReleaseNotes` for the step after the restart.

## 1.6.0 · 2026-11-17

A new way to do list detail: a modal drawer with an overlay, paged with the arrow keys. From downstream project feedback; see `references/decisions.md`, 1.6.0. Existing components work as before.

- New hook `useListPaging` (in `drawer.tsx`): while the drawer is open, ↑ / ↓ (also ← / →, K / J) move to the previous / next item in the list; nothing happens while focus is in a field or with ⌘ / Ctrl / Alt held; while the drawer is open, paging keeps the order from the moment it opened, so a reorder caused by opening doesn't make the current item jump.
- New component `DrawerPager`: goes in `DrawerHeader actions` and shows “3 / 12” with previous and next buttons; their tooltips include the shortcuts.
- `strings.ts` adds `previousItem`, `nextItem`, `itemPosition`.
- Guidelines: `patterns/overlays.md` adds a section on list detail with an overlay and paging, and the decision table separates it from the dock inspector; `components.md` adds the two new APIs.
- Gallery: the Overlays page adds a “List detail with paging” example (unread items first; the order holds while paging).

## 1.5.1 · 2026-11-17

- `ResizeHandle`: after a mouse drag, the accent focus line no longer stays lit. The handle takes focus on press (so the arrow keys work right after), and browsers count that programmatic focus as focus-visible; now a press leaves only the hover line, and the focus line comes back on the first key press. Keyboard use is unchanged.

## 1.5.0 · 2026-11-17

Two implementations the kit kept private become components, so the copies downstream projects wrote for themselves can be replaced (see `references/decisions.md`, 1.5.0). Existing components work as before.

- New component `ResizeHandle`: the drag area on a panel's edge. Drag it, or focus it and use the arrow keys (16px a step, Home / End for min / max); double-click goes back to `defaultValue`; `onValueChange` is called while dragging and `onValueCommit` when done (save the width there).
- New component `Progress`: progress with a known total, `value / max`, with `role="progressbar"`.
- The width handle of `Drawer mode="dock"` uses `ResizeHandle`: it gains double-click back to 400 and Home / End, and its keys no longer reach the page.
- `UploadQueuePanel` progress bars use `Progress`, so screen readers now read each file's progress.
- Guidelines: `components.md` documents both components, and `patterns/layout.md` and `patterns/feedback.md` point to them; both come off the candidate list in `downstream.md`.
- Gallery: the Overlays page adds “Resize handle”, the Feedback page adds “Progress”.

## 1.4.0 · 2026-11-16

Toasts move to the top right; four small components that three or more downstream projects had each written for themselves come into the kit (see `references/decisions.md`, 1.4.0). `notify` and existing components work as before.

- On desktop, toasts sit at the top right; on phones they stay at the top, full width.
- Every toast has a ✕ at its top right (before, only errors and `prompt` had one), except background progress (`loading`); the hit area is 44px on touch screens. The screen reader names of the ✕ and the notification region come from the kit's copy (“Close”, “Notifications”) instead of sonner's built-in English. `strings.ts` adds `notifications`.
- Fixed: error toasts show their faint red background (`bg-popover` used to cover it, so it never showed).
- New component `Info` (an ⓘ with extra explanation): opens after a short hover, stays open on click (a tap on touch screens, Enter on the keyboard), and works on touch screens. `info` on `PageHeader` and `Field` uses it; it used to be a Tooltip, which couldn't be opened on phones.
- New component `Kbd` (key hints); the command palette uses it.
- New component `CopyButton`: the button itself turns into “Copied” and goes back after 1.5 seconds; on failure it says “Couldn't copy”; `iconOnly` for tight spots. `strings.ts` adds `copy`, `copied`, `copyFailed`.
- New component `Callout`: four kinds of callout box, info / warning / danger / neutral. The failure reason in `ConfirmDialog` uses `Callout tone="danger"` (it gains an icon, and the text uses the body text color).
- `IconButton`: `tooltip` accepts text, and `tooltipSide` sets the side.
- Guidelines: `patterns/feedback.md` covers the new position, the ✕, and how desktop apps that draw their own title bar use `offset` to keep clear of it; no toast for copying to the clipboard becomes a general rule. `components.md`, `patterns/overlays.md` and `patterns/one-time-secret.md` document the four new components.
- Gallery: the Buttons page adds copy and key hints, the Overlays page adds the ⓘ info, the Feedback page adds callouts.
- Downstream: arbor in `consumers.json` becomes turnery (the repo is now `linjiejim/turnery`); the list of candidates to bring back into the kit in `downstream.md` is updated from the 2026-11-16 survey.
- Upgrading: retrace and turnery have buttons on the right of their title bars; after installing the new `toast.tsx`, pass `offset={{ top: titleBarHeight + 8, right: 16 }}` to `<Toaster>`.

## 1.3.1 · 2026-11-08

- Drawer dock width handle: arrow-key handling no longer uses a comma expression, so oxlint / eslint (`no-unused-expressions`) in projects no longer warns. Behavior is unchanged.

## 1.3.0 · 2026-11-08

Three things proven in downstream projects (see `references/decisions.md`, 1.3.0, for sources and reasons). Additions only; existing defaults are unchanged.

- Toast: `notify.prompt(id, message, action)` is a persistent notice for something waiting on the user that isn't an error (“New version downloaded · Restart”); showing the same id again replaces it. `notify.loading(message)` is for a slow operation the user started that runs elsewhere; it returns an id, and you call `notify.dismiss(id)` when it ends. From retrace.
- New component `ContextMenu` (right-click menu), sharing styles with DropdownMenu (`menuClass`); both menus have submenus (`Sub` / `SubTrigger` / `SubContent`). `dropdownMenuParts` / `contextMenuParts` (type `MenuParts`) let one item list serve both the ⋯ menu and the right-click menu. From retrace.
- `PopoverAnchor`: anchors a popover to something other than its trigger (a point on a canvas or in a 3D view). From arbor.
- Guidelines: `components.md`, `patterns/overlays.md`, `patterns/feedback.md` and `patterns/list-crud.md` cover right-click menus, submenus, anchored popovers and the two new toasts.
- Gallery: the Data display page adds a right-click menu with submenus, the Overlays page a Popover anchored to a point, the Feedback page a persistent prompt and background progress.
- Upgrading retrace: its own loading toast draws the spinner in the middle of the toast; switching to the kit's `toast.tsx` fixes it.

## 1.2.0 · 2026-11-08

The interaction layer is shared and the skin is open to projects; the kit records which projects use it, so changes can be pushed down and brought back up (see `references/decisions.md`, 2026-11-08). Component and theme values are unchanged.

- New `references/downstream.md`: jim-uiux owns the interaction layer, the semantic names and the default skin, and projects own their skin and domain components; the baseline that holds when the skin changes; two ways to adopt, `registry` and `aligned`; how changes are pushed down and brought back; the current list of candidates to bring back into the kit.
- `tokens.md` adds a section on replacing the whole skin: a project theme file assigns the semantic names and can bridge its old token names, and the contrast guard checks the project's skin. The rule “everything outside the knobs is locked” applies only to the default skin.
- New `consumers.json`: retrace, arbor (`registry`); greenhouse, ivan (`aligned`). Private projects go in an uncommitted `consumers.local.json`.
- New `pnpm --dir gallery consumers`: compares each project with this repo and collects the candidates to bring back; `--affected <ref>` lists the projects a change needs to reach; `--discover` finds repos that aren't registered.
- `SKILL.md`, `adoption.md`: register a project when adopting; after changing the system, push it down to the listed projects; the `docs/DESIGN.md` template adds “Skin”.

## 1.1.0 · 2026-11-06

Patterns proven in Greenhouse 4.2 come into the kit (see `references/decisions.md`, 2026-11-06). Additions only; existing defaults are unchanged.

- Drawer adds `mode="dock"`: a workbench inspector, non-modal and without an overlay; docks as a column at viewports ≥ 1440 and floats when narrower; 360–520 wide, draggable, remembered per place; `useInspectorStack` manages an object stack up to 3 deep, and `DrawerHeader` adds `onBack`.
- Dialog adds `fixed`: md / lg get a fixed height (560 / 640), and only the content area scrolls.
- New components: `CommandPalette` (⌘K, 640×480, 120 from the top), `FacetFilter` + `useFacetParams` (facet filters, kept in the URL), `useUploadQueue` + `UploadQueuePanel` (upload queue).
- The theme adds 9 categorical color pairs `--cat-*` / `--cat-*-subtle` (one set each for light and dark), plus `lib/categorical.ts` (`catClass`, `categoricalFor`, `CHART_SERIES`); the contrast guard covers every categorical color the theme declares.
- Guidelines: `layout.md` adds the workbench shell; `overlays.md` adds the inspector, fixed-size dialogs, the command palette and embedded pages (iframe); `feedback.md` adds infinite scroll (feeds and media grids), the upload queue and the native-app exception for Alert; `filters.md` adds facet filters; `tokens.md` adds categorical colors and in-app text size; `adoption.md` spells out the rules for native apps.
- New patterns: entry pages, one-time secrets, annotation sidebar.
- `decisions.md` settles two open items (native type sizes and buttons, command palette, file upload, chart colors) and corrects Greenhouse sources that no longer exist (v1 / v2 web, CrudDetail).
- Gallery: two new pages, “Workbench shell” and “Facet filters and media grid”; the Overlays page adds fixed-size dialogs, the inspector and the command palette, the Feedback page the upload queue, the Color page categorical colors; ⌘K jumps anywhere on the site.

## 1.0.0 · 2026-11-05

- Open source: its own repo, `linjiejim/jim-uiux` (MIT); the site and registry are hosted on GitHub Pages at the same address, still `https://design.linjiejim.com/r/{name}.json`.
- Removes the brand-specific presets, keeping only the default and warm gray (a breaking change, hence the major version). Brand colors go in the project's own theme.
- New `/version.json`; the gallery sidebar shows the version number.

## 0.3.0 · 2026-11-05

- `SettingsSection` adds `variant="grouped"` (and an optional `icon`): when settings live in a dialog, each group is a card with a small heading, so the groups are clear at a glance. The settings page's default style is unchanged. Guidelines: the settings dialog section of `references/patterns/settings.md`.
- Guards: the raw color check skips comment-only lines, so issue / PR numbers like `(#123)` are no longer taken for colors.

## 0.2.0 · 2026-11-01

- Toasts move to the top center, stacked (at the top on phones, clear of the safe area); they sit on the popover surface, the icon color shows the level, and errors add a faint red background; new `notify.info` and `notify.warning`.
- Viewing, editing and creating a list object happen in one drawer: `DetailList` adds `editing`, for editing in place without moving anything.
- With the sidebar collapsed, nav items show their label on hover.
- New RadioGroup.
- The registry goes live: `https://design.linjiejim.com/r/{name}.json`.

The version number matches `gallery/package.json`. Breaking changes (renamed tokens, component API changes) bump the major version.

## 0.1.0 · 2026-11-01

First release, covering phases one and two.

- Principles, tokens (light / dark, 3 presets, 4 knobs), copy guidelines.
- Components (shadcn registry `@jim/*`): Button, IconButton, Field, Input, Textarea, Select, Combobox, Checkbox, Switch, Dialog, Drawer, BottomSheet, ConfirmDialog / useConfirm, Popover, DropdownMenu, Tooltip, Tabs, Segmented, Badge, StatusDot, Skeleton, Spinner, StateView, Toast (notify), DataTable, Page / PageHeader / Section, FilterBar, SettingsSection / SettingRow / SaveBar, AppShell.
- Interaction patterns: overlays, feedback and states, forms, lists and CRUD, list filters, settings pages, layout.
- Guards: raw colors, minimum text size, native dialogs and hand-rolled overlays, emoji icons, and a WCAG contrast matrix for every theme scope.
- Gallery: three sections, foundations, components and patterns, with theme knobs that switch live.
