import React, { useState } from "react";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useSession from "../hooks/useSession";

const PrivateRoute = (props) => {
  const { children } = props;
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { checkLogin } = useSession();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const res = await checkLogin();
      setIsLoggedIn(res);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  return loading ? (
    <div></div>
  ) : isLoggedIn ? (
    <>{children}</>
  ) : (
    <Navigate
      replace={true}
      to="/"
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
};

export default PrivateRoute;
