import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/app-context";
import { getUserProfile } from "../services/user";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Container } from "react-bootstrap";
import { Person, ArrowLeft } from "react-bootstrap-icons";
import "./../styles/gamer.scss";
import Storage from "../components/gamer/Storage";
import Profile from "../components/gamer/Profile";
import Raw from "../components/gamer/Raw";
import TxHistory from "../components/gamer/TxHistory";
import Score from "../components/gamer/Score";
import Balance from "../components/gamer/Balance";
import Properties from "../components/gamer/Properties";
import KVStorage from "../components/gamer/KVStorage";
import RefreshButton from "../components/RefreshButton";
import { useNavigate } from "react-router-dom";
import Friend from "../components/gamer/Friends";
import Sponsorship from "../components/gamer/Sponsorship";

const Gamer = () => {
  const { game } = useAppContext();
  const [gamer, setGamer] = useState();
  const [refresh, setRefresh] = useState(0);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = await getUserProfile(game.name, userId);
      setGamer(user);
    })();
  }, [game, userId, refresh]);

  return (
    <Container className="d-flex flex-column">
      {gamer && (
        <div className="position-relative">
          <div className="d-flex align-items-center justify-content-around mt-4">
            <div
              style={{ position: "absolute", left: "0" }}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={30} className="arrow-back clickable" />
            </div>
            <div className="d-flex align-items-center">
              <Person className="mx-1" size={40} />
              <h2 className="m-0 mx-1">{gamer.displayName}</h2>
            </div>
            <RefreshButton setRefresh={setRefresh} />
          </div>
        </div>
      )}
      <Tabs
        defaultActiveKey="profile"
        id="gamer-tab"
        className="mt-5 mb-4 d-flex justify-content-center"
        variant="pills"
      >
        <Tab eventKey="profile" title="Profile">
          <Profile gamer={gamer} setGamer={setGamer} />
        </Tab>
        <Tab eventKey="contact" title="Properties">
          <Properties refresh={refresh} />
        </Tab>
        <Tab eventKey="storage" title="Storage">
          <Storage refresh={refresh} />
        </Tab>
        <Tab eventKey="kvstorage" title="KV Storage">
          <KVStorage refresh={refresh} />
        </Tab>
        <Tab eventKey="balance" title="Balance">
          <Balance refresh={refresh} />
        </Tab>
        <Tab eventKey="txhistory" title="Tx History">
          <TxHistory refresh={refresh} />
        </Tab>
        <Tab eventKey="scores" title="Scores">
          <Score refresh={refresh} />
        </Tab>
        <Tab eventKey="friends" title="Friends">
          <Friend refresh={refresh} />
        </Tab>
        <Tab eventKey="sponsorship" title="Sponsorship">
          <Sponsorship refresh={refresh}/>
        </Tab>
        <Tab eventKey="raw" title="Raw">
          <Raw refresh={refresh} />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Gamer;
