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
import pSBC from 'shade-blend-color';

function App() {
  const { user, game, domain, setEnv, setVersion, setOptions } = useAppContext();

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

      if (env === "prod") {
        document.documentElement.style.setProperty("--theme-color", "#6a1717");
        document.documentElement.style.setProperty("--theme-color-secondary", "#901f1f");
      }

      console.log('options:', options)

      if (options.title) {
        document.title = options.title;
      }

      if(options.themeColor) {
        document.documentElement.style.setProperty("--theme-color", options.themeColor);
        document.documentElement.style.setProperty("--theme-color-secondary", pSBC(0.2, options.themeColor));
      }
    };

    init();
  }, [setEnv, setVersion, setOptions]);

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
