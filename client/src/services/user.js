import axios from "axios";

export const getUsers = async (game, skip, limit) => {
  try {
    const res = await axios.get(
      `/game/${game}/users?skip=${skip}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const sendMessage = async (game, domain, user_id, eventObject) => {
  try {
    const res = await axios.post(
      `/game/${game}/user/${user_id}/message/${domain}`,
      JSON.stringify(eventObject)
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteUser = async (game, user_id) => {
  try {
    const res = await axios.delete(`/game/${game}/user/${user_id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Profile
export const getUserProfile = async (game, userId) => {
  try {
    const res = await axios.get(`/game/${game}/user/${userId}/profile`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProfile = async (game, userId, profile) => {
  try {
    const res = await axios.post(
      `/game/${game}/user/${userId}/profile`,
      profile
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// User Storage
export const getUserStorage = async (game, domain, user_id) => {
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/storage/${domain}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserStorage = async (game, domain, user_id, storage) => {
  try {
    const res = await axios.post(
      `/game/${game}/user/${user_id}/storage/${domain}`,
      storage
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// User Raw
export const getUserOutline = async (game, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/outline`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// TX History

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
    const res = await axios.get(
      `/game/${game}/user/${user_id}/txHistory/${domain}?skip=${skip}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Scores

export const getBestScores = async (game, domain, user_id) => {
  try {
    const res = await axios.get(`/game/${game}/user/${user_id}/domain/${domain}/bestscores`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};