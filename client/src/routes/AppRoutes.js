import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../views/Home";
import Status from "../views/Status";
import Store from "../views/Store";
import Users from "../views/Users";
import Leaderboards from "../views/Leaderboards";
import Matches from "../views/Matches";
import Gamer from "../views/Gamer";
import Match from "../views/Match";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/status" element={<PrivateRoute><Status /></PrivateRoute>} />
      <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      <Route path="/gamer/:userId" element={<PrivateRoute><Gamer /></PrivateRoute>} />
      <Route path="/leaderboards" element={<PrivateRoute><Leaderboards /></PrivateRoute>} />
      <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
      <Route path="/matches/:matchId" element={<PrivateRoute><Match /></PrivateRoute>} />
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
