import axios from "axios";
import { toast } from "react-toastify";

export const getUsers = async (game, skip, limit) => {
  try {
    const res = await axios.get(`/game/${game}/users?skip=${skip}&limit=${limit}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading users. See console for more details");
    return console.log(err);
  }
};

export const getUsersCount = async (game) => {
  try {
    const res = await axios.get(`/game/${game}/users/count`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading users count. See console for more details");
    return console.log(err);
  }
};

export const searchUsers = async (game, skip, limit, q) => {
  try {
    const res = await axios.get(`/game/${game}/users/search?q=${q}&skip=${skip}&limit=${limit}`);
    return res.data;
  } catch (err) {
    toast.error("Error while searching users. See console for more details");
    return console.log(err);
  }
};

export const searchUsersCount = async (game, q) => {
  try {
    const res = await axios.get(`/game/${game}/users/search/count?q=${q}`);
    return res.data;
  } catch (err) {
    toast.error("Error while searching users count. See console for more details");
    return console.log(err);
  }
};

export const findUser = async (game, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/users/find/${user_id}?skip=${0}&limit=${0}`);
    if (res.data.errorName === "InvalidUserId") {
      toast.error(res.data.message);
      return null;
    }
    return res.data;
  } catch (err) {
    toast.error("Error while searching user. See console for more details");
    return console.log(err);
  }
};

export const sendMessage = async (game, domain, user_id, eventObject) => {
  try {
    const res = await axios.post(`/game/${game}/user/${user_id}/message/${domain}`, JSON.stringify(eventObject));
    if (res.status === 200) {
      toast.success("Message sent successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while sending messages. See console for more details");
    return console.log(err);
  }
};

export const deleteUser = async (game, user_id) => {
  try {
    const res = await axios.delete(`/game/${game}/user/${user_id}`);
    if (res.status === 200) {
      toast.success("User deleted successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting users. See console for more details");
    return console.log(err);
  }
};

// Profile
export const getUserProfile = async (game, userId) => {
  try {
    const res = await axios.get(`/game/${game}/user/${userId}/profile`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user profile. See console for more details");
    return console.log(err);
  }
};

export const updateUserProfile = async (game, userId, profile) => {
  try {
    const res = await axios.post(`/game/${game}/user/${userId}/profile`, profile);
    if (res.status === 200) {
      toast.success("Profile updated successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating user profile. See console for more details");
    return console.log(err);
  }
};

// User Storage
export const getUserStorage = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/storage/${domain}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user storage. See console for more details");
    return console.log(err);
  }
};

export const updateUserStorage = async (game, domain, user_id, storage, cb = null) => {
  try {
    const res = await axios.post(`/game/${game}/user/${user_id}/storage/${domain}`, storage);
    if (res.status === 200) {
      toast.success("User storage updated successfully");
    }
    if (cb) {
      const updatedStorage = await getUserStorage(game, domain, user_id);
      return cb(updatedStorage);
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating user storage. See console for more details");
    return console.log(err);
  }
};

//KV Storage

export const getUserKVStore = async (game, domain, user_id) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/kvstore/${domain}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user kv store. See console for more details");
    return console.log(err);
  }
};

// User Raw
export const getUserOutline = async (game, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/outline`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user outline. See console for more details");
    return console.log(err);
  }
};

// Transactions

export const getTxHistory = async (game, domain, user_id, skip, limit) => {
  if (domain == null) {
    domain = "private";
  }
  if (skip == null) {
    skip = 0;
  }
  if (limit == null) {
    limit = 0;
  }

  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/txHistory/${domain}?skip=${skip}&limit=${limit}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading tx history. See console for more details");
    return console.log(err);
  }
};

export const searchTxHistory = async (game, domain, user_id, ts1, ts2, q, skip, limit) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/txHistory/${domain}/search?ts1=${ts1}&ts2=${ts2}&q=${q}&skip=${skip}&limit=${limit}`);
    return res.data;
  } catch (err) {
    toast.error("Error while searching in tx history. See console for more details");
    return console.log(err);
  }
};

export const getBalance = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/balance/${domain}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user balance. See console for more details");
    return console.log(err);
  }
};

export const newTransaction = async (game, domain, user_id, tx) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.post(`/game/${game}/user/${user_id}/transaction/${domain}`, { tx, description: "Dashboard transaction" });
    if (res.status === 200) {
      toast.success("Transaction created successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while creating transaction. See console for more details");
    return console.log(err);
  }
};

// Scores
export const getBestScores = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/domain/${domain}/bestscores`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading best scores. See console for more details");
    return console.log(err);
  }
};

export const deleteScore = async (game, domain, user_id, lb) => {
  try {
    const res = await axios.delete(`/${game}/user/${user_id}/domain/${domain}/${lb}`);
    if (res.status === 200) {
      toast.success("Score delete successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting score. See console for more details");
    return console.log(err);
  }
};

// Properties

export const getUserProperties = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/domain/${domain}/properties`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user properties. See console for more details");
    return console.log(err);
  }
};

export const updateUserProperties = async (game, domain, user_id, properties) => {
  try {
    const res = await axios.post(`/game/${game}/user/${user_id}/domain/${domain}/properties`, properties);
    if (res.status === 200) {
      toast.success("Properties updated successfully");
    }
    return res;
  } catch (err) {
    toast.error("Error while updating user properties. See console for more details");
    return console.log(err);
  }
};

export const getSignedUrlGamer = async (game, user_id, domain, key) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/signedurl/${domain}/${key}`);
    return res.data;
  } catch (err) {
    if (err.response.status === 400) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Error while loading signed aws url. See console for more details");
    }
    return console.log(err);
  }
};

//Friends

export const getFriends = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/friends/${domain}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user friends. See console for more details");
    return console.log(err);
  }
};

export const deleteFriend = async (game, domain, user_id, friend_id) => {
  try {
    const res = await axios.delete(`/game/${game}/user/${user_id}/friend/${domain}/${friend_id}`);
    if (res.status === 200) {
      toast.success("Friend deleted successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting friend. See console for more details");
    return console.log(err);
  }
};

export const getSponsorship = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/friends/${domain}/sponsorship`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading user sponsorship. See console for more details");
    return console.log(err);
  }
};
