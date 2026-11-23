import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
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
