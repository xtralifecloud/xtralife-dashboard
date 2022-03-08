import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getUserOutline } from "./../../services/user";

const Raw = ({refresh}) => {
  const [raw, setRaw] = useState(null);
  const { game } = useAppContext();
  const { userId } = useParams();

  useEffect(() => {
    (async () => {
      if (game.name) {
        let rawData = await getUserOutline(game.name, userId);
        if (rawData) {
          delete rawData.profile;
          delete rawData.domains;
          delete rawData.servertime;
          setRaw(rawData);
        }
      }
    })();
  }, [game, userId, refresh]);

  return (
    <Container>
      <div>
        <pre>{JSON.stringify(raw, null, 2)}</pre>
      </div>
    </Container>
  );
};

export default Raw;
