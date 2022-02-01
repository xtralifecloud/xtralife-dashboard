import axios from "axios";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/app-context";
import { toast } from "react-toastify";


const useSession = () => {
  const { setUser, setGame, setDomain } = useAppContext();
  const navigate = useNavigate();

  const login = async (username, password, ggcode) => {
    try {
      const res = await axios
        .post("/login", {
          username: username,
          password: password,
          ggcode: ggcode
        });
      setUser(res.data);
      setGame(res.data.games[0]);
      setDomain(res.data.games[0].domains[0]);
      navigate("/status");
    } catch (err) {
      if (err.response.status === 401) {
        toast.warn("Invalid credentials");
      } else {
        toast.error("Error while logging in. See console for more details");
      }
      return console.log("err:", err);
    }
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
