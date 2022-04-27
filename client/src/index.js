import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./styles/index.scss";
import AppContextProvider from "./context/app-context";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";

const themes = {
  sandbox: "/themes/sandbox.css",
  test: "/themes/test.css",
  dev: "/themes/dev.css",
  staging: "/themes/staging.css",
  prod: "/themes/prod.css",
};

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <ThemeSwitcherProvider defaultTheme="prod" themeMap={themes}>
        <App />
      </ThemeSwitcherProvider>
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
