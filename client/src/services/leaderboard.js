import axios from "axios";
import { toast } from "react-toastify";

export const getGame = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/domain/${domain}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading game. See console for more details")
    console.log(err);
  }
};

export const getLeaderboard = async (
  game,
  domain,
  leaderboard,
  page,
  count
) => {
  try {
    const res = await axios.get(
      `/game/${game}/domain/${domain}/leaderboard/${leaderboard}?page=${page}&count=${count}`
    );
    return res.data;
  } catch (err) {
    toast.error("Error while loading leaderboard. See console for more details")
    console.log(err);
  }
};

export const deleteLeaderboard = async (
  game,
  domain,
  leaderboard,
) => {
  try {
    const res = await axios.delete(
      `/game/${game}/domain/${domain}/leaderboard/${leaderboard}`
    );
    if (res.status === 200) {
      toast.success("Leaderboard deleted successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting leaderboard. See console for more details")
    console.log(err);
  }
};