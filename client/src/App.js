import React from "react";
import Navigation from "./components/Navigation";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import GameAndDomainSelector from "./components/GameAndDomainSelector";
import { useEffect } from "react";
import { useAppContext } from "./context/app-context";
import { getEnv } from "./services/init";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useThemeSwitcher } from "react-css-theme-switcher";

function App() {
  const { user, game, domain, setEnv, setVersion, setOptions } = useAppContext();
  const { switcher, themes, currentTheme, status } = useThemeSwitcher();

  useEffect(() => {
    const init = async () => {
      const res = await getEnv();
      const env = res.data.env;
      const options = res.data.options;

      if (res.data) {
        setEnv(env);
        setVersion(res.data.version);
        setOptions(options);
      }

      if (options.identifiers.title) {
        document.title = options.identifiers.title;
      }

      if (env === "dev") {
        if (options.identifiers.theme === "sandbox") {
          return switcher({ theme: themes.sandbox });
        }
        if (options.identifiers.theme === "test") {
          return switcher({ theme: themes.test });
        }
        return switcher({ theme: themes.dev });
      }

      if (env === "prod") {
        if (options.identifiers.theme === "staging") {
          return switcher({ theme: themes.staging });
        }
        return switcher({ theme: themes.prod });
      }
    };
    init();
  }, [setEnv, setVersion, setOptions, switcher, themes]);

  return (
    <div>
      <BrowserRouter>
        <Navigation />
        {user && game && domain && <GameAndDomainSelector />}
        <AppRoutes />
        <ToastContainer theme="dark" position="bottom-right" closeButton={false} />
      </BrowserRouter>
    </div>
  );
}

export default App;
