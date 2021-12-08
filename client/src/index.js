import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./styles/index.scss";
import AppContextProvider from "./context/app-context";

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
        <App />
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
