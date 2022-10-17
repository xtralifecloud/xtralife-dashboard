import axios from "axios";
import { toast } from "react-toastify";
const _ = require("underscore");

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

export const editGameStorage = async (game, domain, storage, cb = null) => {
  try {
    const from_string = function (value) {
      if (_.indexOf(value, '"') === 0) {
        return (value = value.substring(1, value.lastIndexOf('"')));
      } else {
        return JSON.parse(value);
      }
    };
    const res = await axios.put(`/game/${game}/storage/${domain}/${storage.fskey}`, from_string(storage.fsvalue));
    if (res.status === 200) {
      toast.success(`Key ${storage.fskey} has been edited successfully`);
    }
    if (cb){
      const updatedStorage = await getGameStorage(game, domain)
      return cb(updatedStorage)
    }
    return res.data;
  } catch (err) {
    toast.error("Error while editing key. See console for more details")
    return console.log(err);
  }
};

export const deleteGameStorage = async (game, domain, key, cb = null) => {
  try {
    const res = await axios.delete(`/game/${game}/storage/${domain}/${key}`);
    if (res.status === 200) {
      toast.success(`Key ${key} deleted successfully`);
    }
    if (cb){
      const updatedStorage = await getGameStorage(game, domain)
      return cb(updatedStorage)
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting key. See console for more details")
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
