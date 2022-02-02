import axios from "axios";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/app-context";
import { toast } from "react-toastify";
import { isPresent } from "../utils/isPresent";

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
      setUser(null);
      setGame(null);
      setDomain(null);
      sessionStorage.clear()
      navigate("/");
    });
  };

  const checkLogin = async () => {
    const res = await axios.get("/loggedin");
    if (res.data === 0) {
      setUser(null);
      setGame(null);
      setDomain(null);
      navigate("/");
      return false;
    }
    const sessionGame = JSON.parse(sessionStorage.getItem("game"))
    const sessionDomain = sessionStorage.getItem("domain")
    setUser(res.data);
    if(isPresent([sessionGame])){
      setGame(sessionGame)
    }else{
      setGame(res.data.games[0]);
    }
    if(sessionDomain !== null && sessionDomain !== ""){
      setDomain(sessionDomain)
    }else{
      setDomain(res.data.games[0].domains[0]);
    }
    return true;
  };

  return { login, logout, checkLogin };
};

export default useSession;
