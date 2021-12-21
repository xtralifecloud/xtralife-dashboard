import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../views/Home";
import Login from "../views/Login";
import Status from "../views/Status";
import Store from "../views/Store";
import Users from "../views/Users";
import Leaderboards from "../views/Leaderboards";
import Matches from "../views/Matches";
import Gamer from "../views/Gamer";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/status" element={<Status />} />
      <Route path="/store" element={<Store />} />
      <Route path="/users" element={<Users />} />
      <Route path="/gamer/:userId" element={<Gamer />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/matches" element={<Matches />} />
      <Route
        path="*"
        element={
          <main style={{ padding: "1rem" }}>
            <p>There's nothing here!</p>
          </main>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
