import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WidgetProvider } from "./constexts/WidgetContext";
import "./index.css";

class ReactWidget extends HTMLElement {
  private root: ReactDOM.Root | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const container = document.createElement("div");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://widget-pipecat-jk5d.vercel.app/react-widget.css";

    // Append the stylesheet and container to the Shadow DOM
    this.shadowRoot?.appendChild(link);
    this.shadowRoot?.appendChild(container);

    const agent_id = this.getAttribute("agent_id") || "";
    const schema = this.getAttribute("schema") || "";
    const access_token = this.getAttribute("access_token") || "";

    this.root = ReactDOM.createRoot(container);
    this.root.render(
      // <React.StrictMode>
      <WidgetProvider
        agent_id={agent_id}
        schema={schema}
        access_token={access_token}
      >
        <App />
      </WidgetProvider>
      // </React.StrictMode>
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

customElements.define("react-widget", ReactWidget);
