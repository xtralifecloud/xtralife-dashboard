import axios from "axios";
import { toast } from "react-toastify";

//Storage
export const getGameStorage = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/storage/${domain}`);
    if (res.status === 200 && res.data === "") {
      return [];
    }
    return res.data;
  } catch (err) {
    toast.error("Error while loading storage. See console for more details")
    return console.log(err);
  }
};

export const updateGameStorage = async (game, domain, storage, cb = null) => {
  try {
    const res = await axios.post(`/game/${game}/storage/${domain}`, storage);
    if (res.status === 200) {
      toast.success("Storage updated successfully");
    }
    if (cb){
      const updatedStorage = await getGameStorage(game, domain)
      return cb(updatedStorage)
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating storage. See console for more details")
    return console.log(err);
  }
};

//Achievement
export const getGameAchievements = async (game, domain) => {
  try {
    const res = await axios.get(`/game/${game}/achievements/${domain}`);
    if (res.status === 200 && res.data === "") {
      return [];
    }
    return res.data;
  } catch (err) {
    toast.error("Error while loading achievements. See console for more details")
    return console.log(err);
  }
};

export const updateGameAchievements = async (game, domain, achievements, cb = null) => {
  try {
    const res = await axios.post(`/game/${game}/achievements/${domain}`, achievements);
    if (res.status === 200) {
      toast.success("Achievements updated successfully");
    }
    if (cb){
      const updatedAchievement = await getGameAchievements(game, domain)
      return cb(updatedAchievement)
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating achievements. See console for more details")
    return console.log(err);
  }
};


export const getSignedUrl = async (game, domain, key) => {
  try {
    const res = await axios.get(`/game/${game}/signedurl/${domain}/${key}`);
    return res.data;
  } catch (err) {
    if(err.response.status === 400){
      toast.error(err.response.data.message)
    }else{
      toast.error("Error while loading signed aws url. See console for more details")
    }
    return console.log(err);
  }
};
