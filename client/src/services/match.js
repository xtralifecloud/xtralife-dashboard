import axios from "axios";
import { toast } from "react-toastify";

export const getMatches = async (game, domain, skip, limit, hideFinished, gamer_id, customProperties) => {
  try {
    let url = `/game/${game}/matches/domain/${domain}?skip=${skip}&limit=${limit}&hideFinished=${hideFinished}`;
    if (gamer_id) url += `&gamerId=${gamer_id}`;
    if (customProperties && customProperties.length > 0) url += "&customProperties=" + encodeURIComponent(customProperties);
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    toast.error("Error while loading matches. See console for more details");
    console.log(err);
  }
};

export const deleteMatch = async (game, matchId) => {
  try {
    const res = await axios.delete(`/game/${game}/matches/${matchId}`);
    if (res.status === 200) {
      toast.success("Match deleted successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting match. See console for more details");
    console.log(err);
  }
};

export const getMatchesCount = async (game, domain, hideFinished, gamer_id, customProperties) => {
  try {
    let url = `/game/${game}/matches/domain/${domain}/count?hideFinished=${hideFinished}`;
    if (gamer_id) url += `&gamerId=${gamer_id}`;
    if (customProperties && customProperties.length > 0) url += "&customProperties=" + encodeURIComponent(customProperties);
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    toast.error("Error while loading matches count. See console for more details");
    console.log(err);
  }
};

export const getMatch = async (game, matchId) => {
  try {
    const res = await axios.get(`/game/${game}/matches/${matchId}`);
    return res.data;
  } catch (err) {
    toast.error("Error while deleting match. See console for more details");
    console.log(err);
  }
};

export const putMatch = async (game, matchId, match) => {
  try {
    const res = await axios.put(`/game/${game}/matches/${matchId}`, match);
    if (res.status === 200) {
      toast.success("Match updated successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating match. See console for more details");
    console.log(err);
  }
};
