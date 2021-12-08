import axios from "axios";

//Storage
export const getGameStorage = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/storage/${domain}`);
    if (res.status === 200 && res.data === "") {
      return [];
    }
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateGameStorage = async (game, domain, storage) => {
  try {
    const res = await axios.post(`/game/${game}/storage/${domain}`, storage);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

//Achievement
export const getGameAchievement = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/achievements/${domain}`);
    if (res.status === 200 && res.data === "") {
      return [];
    }
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
