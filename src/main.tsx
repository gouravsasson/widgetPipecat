import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WidgetProvider } from "./constexts/WidgetContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <WidgetProvider
    agent_id={"c1a1ae07-3c1f-4d78-a91e-925aeeae2ec5"}
    schema={"6af30ad4-a50c-4acc-8996-d5f562b6987f"}
    access_token={"1234567890"}
  >
    <App />
  </WidgetProvider>
  // </StrictMode>,
);
