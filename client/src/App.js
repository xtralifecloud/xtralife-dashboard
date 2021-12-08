import Navigation from "./components/Navigation";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import GameAndDomainSelector from "./components/GameAndDomainSelector";
import { useEffect } from "react";
import { useAppContext } from "./context/app-context";
import { getEnv } from "./services/init";

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
  }, [setEnv, setVersion, setOptions])  ;

  return (
    <div>
      <BrowserRouter>
        <Navigation />
        <GameAndDomainSelector />
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
