import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/app-context";
import { getUserProfile } from "../services/user";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Container } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import "./../styles/gamer.scss";
import Storage from "../components/gamer/Storage";
import Profile from "../components/gamer/Profile";
import Raw from "../components/gamer/Raw";
import TxHistory from "../components/gamer/TxHistory";
import Score from "../components/gamer/Score";
import Balance from "../components/gamer/Balance";
import Properties from "../components/gamer/Properties";
import KVStorage from "../components/gamer/KVStorage";

const Gamer = () => {
  const { game } = useAppContext();
  const [gamer, setGamer] = useState();
  const { userId } = useParams();

  useEffect(() => {
    const getSelectedUser = async () => {
      const user = await getUserProfile(game.name, userId);
      setGamer(user);
    };
    getSelectedUser();
  }, [game, userId]);

  return (
    <Container className="d-flex flex-column">
      {gamer && (
        <div className="d-flex align-items-center justify-content-center mt-4">
          <Person className="mx-1" size={40} />
          <h2 className="m-0 mx-1">{gamer.displayName}</h2>
        </div>
      )}
      <Tabs
        defaultActiveKey="profile"
        id="gamer-tab"
        className="mt-4 mb-4 d-flex justify-content-center"
        variant="pills"
      >
        <Tab eventKey="profile" title="Profile">
          <Profile gamer={gamer} setGamer={setGamer} />
        </Tab>
        <Tab eventKey="contact" title="Properties">
          <Properties />
        </Tab>
        <Tab eventKey="storage" title="Storage">
          <Storage />
        </Tab>
        <Tab eventKey="kvstorage" title="KV Storage">
          <KVStorage />
        </Tab>
        <Tab eventKey="balance" title="Balance">
          <Balance />
        </Tab>
        <Tab eventKey="txhistory" title="Tx History">
          <TxHistory />
        </Tab>
        <Tab eventKey="scores" title="Scores">
          <Score />
        </Tab>
        <Tab eventKey="friends" title="Friends">
          Friends
        </Tab>
        <Tab eventKey="godchildren" title="Godchildren">
          Godchildren
        </Tab>
        <Tab eventKey="raw" title="Raw">
          <Raw />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Gamer;
