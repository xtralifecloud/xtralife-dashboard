import axios from "axios";

export const getGame = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/domain/${domain}`);
    return res.data;
  } catch (err) {
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
    console.log(err);
  }
};
