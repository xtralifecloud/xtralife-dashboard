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

export const searchUsers = async (game, skip, limit, q) => {
  try {
    const res = await axios.get(
      `/game/${game}/users/search?q=${q}&skip=${skip}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const findUser = async (game, user_id) => {
  try {
    const res = await axios.get(
      `/game/${game}/users/find/${user_id}?skip=${0}&limit=${0}`
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

//KV Storage

export const getUserKVStore = async (game, domain, user_id) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/kvstore/${domain}`
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
    const res = await axios.get(
      `/game/${game}/user/${user_id}/txHistory/${domain}?skip=${skip}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const searchTxHistory = async (
  game,
  domain,
  user_id,
  ts1,
  ts2,
  q,
  skip,
  limit
) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/txHistory/${domain}/search?ts1=${ts1}&ts2=${ts2}&q=${q}&skip=${skip}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getBalance = async (game, domain, user_id) => {
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/balance/${domain}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const newTransaction = async (game, domain, user_id, tx) => {
  if (domain == null) {
    domain = "private";
  }
  try {
    const res = await axios.post(
      `/game/${game}/user/${user_id}/transaction/${domain}`,
      { tx, description: "Dashboard transaction" }
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Scores
export const getBestScores = async (game, domain, user_id) => {
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/domain/${domain}/bestscores`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteScore = async (game, domain, user_id, lb) => {
  try {
    const res = await axios.delete(
      `/${game}/user/${user_id}/domain/${domain}/${lb}`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Properties

export const getUserProperties = async (game, domain, user_id) => {
  try {
    const res = await axios.get(
      `/game/${game}/user/${user_id}/domain/${domain}/properties`
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProperties = async (
  game,
  domain,
  user_id,
  properties
) => {
  try {
    const res = await axios.post(
      `/game/${game}/user/${user_id}/domain/${domain}/properties`,
      properties
    );
    return res;
  } catch (err) {
    console.log(err);
  }
};
