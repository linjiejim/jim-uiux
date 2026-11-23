/**
 * The jim-uiux mark: a lowercase j on a 24 grid. Stem 4.5 wide, the dot a 4.5 rounded square,
 * every end rounded at 1.25, so the whole mark is built from the kit's own corner.
 * `public/favicon.svg` draws the same two shapes on a 32 tile; change both together.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <rect x="12.5" y="2" width="4.5" height="4.5" rx="1.25" />
      <path d="M12.5 9.25A1.25 1.25 0 0 1 13.75 8H15.75A1.25 1.25 0 0 1 17 9.25V14.5A7.5 7.5 0 0 1 9.5 22H8.25A1.25 1.25 0 0 1 7 20.75V18.75A1.25 1.25 0 0 1 8.25 17.5H9.5A3 3 0 0 0 12.5 14.5Z" />
    </svg>
  )
}
