import Navigation from "./components/Navigation";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import GameAndDomainSelector from "./components/GameAndDomainSelector";
import { useEffect } from "react";
import { useAppContext } from "./context/app-context";
import { getEnv } from "./services/init";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { setEnv, setVersion, setOptions } = useAppContext();

  useEffect(() => {
    const init = async () => {
      const res = await getEnv();
      if (res.data) {
        setEnv(res.data.env);
        setVersion(res.data.version);
        setOptions(res.data.options);
      }
    };
    init();
  }, [setEnv, setVersion, setOptions]);

  return (
    <div>
      <BrowserRouter>
        <Navigation />
        <GameAndDomainSelector />
        <AppRoutes />
        <ToastContainer theme="dark" position="bottom-right"/>
      </BrowserRouter>
    </div>
  );
}

export default App;
