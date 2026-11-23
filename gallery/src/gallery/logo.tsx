/*
 * jim-uiux logos. Both are built from the kit's own parts: straight strokes, dots that are
 * rounded squares, every free end rounded.
 *
 * Wordmark (the logo): "jim-uiux" with the hyphen drawn as a switch that is on. Units: stroke 2.5,
 * x-height 10 (y 4–14, baseline 14), corners 0.7, dots 2.5 squares 0.85 above the x-height;
 * arches are half circles (outer 3.75, inner 1.25), so u is m's arch upside down.
 *
 * Mark (the icon): the same j alone, on a 24 grid, stroke 4.5, corners 1.25. It is the favicon and
 * app icon (public/favicon.svg, public/apple-touch-icon.png) and the README badge.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 68.856 19" fill="currentColor" role="img" aria-label="jim-uiux" className={className}>
      <path d="M3.056 1.35A0.7 0.7 0 0 1 3.756 0.65H4.856A0.7 0.7 0 0 1 5.556 1.35V2.45A0.7 0.7 0 0 1 4.856 3.15H3.756A0.7 0.7 0 0 1 3.056 2.45ZM3.056 4.7A0.7 0.7 0 0 1 3.756 4H4.856A0.7 0.7 0 0 1 5.556 4.7V14.333A4.167 4.167 0 0 1 1.389 18.5H0.7A0.7 0.7 0 0 1 0 17.8V16.7A0.7 0.7 0 0 1 0.7 16H1.389A1.667 1.667 0 0 0 3.056 14.333ZM7.356 1.35A0.7 0.7 0 0 1 8.056 0.65H9.156A0.7 0.7 0 0 1 9.856 1.35V2.45A0.7 0.7 0 0 1 9.156 3.15H8.056A0.7 0.7 0 0 1 7.356 2.45ZM7.356 4.7A0.7 0.7 0 0 1 8.056 4H9.156A0.7 0.7 0 0 1 9.856 4.7V13.3A0.7 0.7 0 0 1 9.156 14H8.056A0.7 0.7 0 0 1 7.356 13.3ZM11.656 13.3V7.75A3.75 3.75 0 0 1 17.906 4.955A3.75 3.75 0 0 1 24.156 7.75V13.3A0.7 0.7 0 0 1 23.456 14H22.356A0.7 0.7 0 0 1 21.656 13.3V7.75A1.25 1.25 0 0 0 19.156 7.75V13.3A0.7 0.7 0 0 1 18.456 14H17.356A0.7 0.7 0 0 1 16.656 13.3V7.75A1.25 1.25 0 0 0 14.156 7.75V13.3A0.7 0.7 0 0 1 13.456 14H12.356A0.7 0.7 0 0 1 11.656 13.3ZM37.556 4.7A0.7 0.7 0 0 1 38.256 4H39.356A0.7 0.7 0 0 1 40.056 4.7V10.25A1.25 1.25 0 0 0 42.556 10.25V4.7A0.7 0.7 0 0 1 43.256 4H44.356A0.7 0.7 0 0 1 45.056 4.7V10.25A3.75 3.75 0 0 1 37.556 10.25ZM46.856 1.35A0.7 0.7 0 0 1 47.556 0.65H48.656A0.7 0.7 0 0 1 49.356 1.35V2.45A0.7 0.7 0 0 1 48.656 3.15H47.556A0.7 0.7 0 0 1 46.856 2.45ZM46.856 4.7A0.7 0.7 0 0 1 47.556 4H48.656A0.7 0.7 0 0 1 49.356 4.7V13.3A0.7 0.7 0 0 1 48.656 14H47.556A0.7 0.7 0 0 1 46.856 13.3ZM51.156 4.7A0.7 0.7 0 0 1 51.856 4H52.956A0.7 0.7 0 0 1 53.656 4.7V10.25A1.25 1.25 0 0 0 56.156 10.25V4.7A0.7 0.7 0 0 1 56.856 4H57.956A0.7 0.7 0 0 1 58.656 4.7V10.25A3.75 3.75 0 0 1 51.156 10.25Z" />
      <path fillRule="evenodd" d="M28.756 6H32.956A3 3 0 0 1 32.956 12H28.756A3 3 0 0 1 28.756 6ZM31.206 9A1.75 1.75 0 1 0 34.706 9A1.75 1.75 0 1 0 31.206 9Z" />
      <path d="M61.665 4.7L62.703 4.7L67.646 13.3L66.608 13.3ZM67.646 4.7L66.608 4.7L61.665 13.3L62.703 13.3Z" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  )
}
