import React, { createContext, useState, useContext, useEffect } from "react";

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
    if (sessionStorage.getItem("user")) {
      setUser(JSON.parse(sessionStorage.getItem("user")));
    }
    if (sessionStorage.getItem("game")) {
      setGame(JSON.parse(sessionStorage.getItem("game")));
    }
    if (sessionStorage.getItem("domain")) {
      setDomain(sessionStorage.getItem("domain"));
    }
  }, [setUser, setDomain, setGame]);

  useEffect(() => {
    sessionStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem("game", JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    sessionStorage.setItem("domain", domain);
  }, [domain]);

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
