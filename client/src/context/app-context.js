import React, { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [game, setGame] = useState({});
  const [domain, setDomain] = useState('');
  const [env, setEnv] = useState('');
  const [version, setVersion] = useState(''); 
  const [options, setOptions] = useState({}); 

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    if (localStorage.getItem("game")) {
      setGame(JSON.parse(localStorage.getItem("game")));
    }
    if (localStorage.getItem("domain")) {
      setDomain(localStorage.getItem("domain"));
    }
  }, [setUser, setDomain, setGame]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("game", JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    localStorage.setItem("domain", domain);
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
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
