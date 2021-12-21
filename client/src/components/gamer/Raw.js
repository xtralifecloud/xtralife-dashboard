import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getUserOutline } from "./../../services/user";

const Raw = () => {
  const [raw, setRaw] = useState(null);
  const { game } = useAppContext();
  const { userId } = useParams();

  useEffect(() => {
    const getRawData = async () => {
      if (game.name) {
        let rawData = await getUserOutline(game.name, userId);
        delete rawData.profile;
		delete rawData.domains;
		delete rawData.servertime;
        setRaw(rawData);
      }
    };
    getRawData();
  }, [game, userId]);

  return (
    <Container>
      <div>
        <pre style={{color:"#a11"}}>{JSON.stringify(raw, null, 2)}</pre>
      </div>
    </Container>
  );
};

export default Raw;
