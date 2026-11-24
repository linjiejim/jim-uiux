import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
// first: picks the language and configures the kit's strings before anything renders
import "./gallery/i18n"
import "@fontsource-variable/inter/opsz.css"
import "./index.css"
import { App } from "./gallery/app"
import { initStudio } from "./gallery/studio/store"

initStudio()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
