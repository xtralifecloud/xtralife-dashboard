import axios from "axios";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/app-context";

const useSession = () => {
  const { setUser, setGame, setDomain } = useAppContext();
  const navigate = useNavigate();

  const login = (username, password, ggcode) => {
    axios
      .post("/login", {
        username: username,
        password: password,
        ggcode: ggcode,
      })
      .then((res) => {
        setUser(res.data);
        setGame(res.data.games[0]);
        setDomain(res.data.games[0].domains[0]);
        navigate("/status");
      })
      .catch((err) => {
        console.log("err:", err);
        return false;
      });
  };

  const logout = () => {
    axios.post("/logout").then(() => {
      window.sessionStorage.clear();
      window.location.replace('/')
    });
  };

  const checkLogin = async () => {
    const res = await axios.get("/loggedin");
    if (res.data === 0) {
      setUser(null);
      return false;
    }
    setUser(res.data);
    return true;
  };

  return { login, logout, checkLogin };
};

export default useSession;
