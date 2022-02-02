import React, { createContext, useState, useContext, useEffect } from "react";
import { isPresent } from "../utils/isPresent";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [game, setGame] = useState({});
  const [domain, setDomain] = useState("");
  const [env, setEnv] = useState("");
  const [version, setVersion] = useState("");
  const [options, setOptions] = useState({});
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);

  useEffect(() => {
    if(user && isPresent([game])) sessionStorage.setItem("game", JSON.stringify(game));
  }, [game, user]);

  useEffect(() => {
    if(user && domain) sessionStorage.setItem("domain", domain);
  }, [domain, user]);

  const value = {
    user,
    setUser,
    game,
    setGame,
    domain,
    setDomain,
    env,
    setEnv,
    version,
    setVersion,
    options,
    setOptions,
    page,
    setPage,
    itemsNumber,
    setItemsNumber,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
