import React from "react";
import {
  Container,
} from "react-bootstrap";
import {Speedometer } from "react-bootstrap-icons";

import Storage from "../components/status/Storage";
import Achievements from "../components/status/Achievements";

const Status = () => {
  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <Speedometer className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Status</h1>
      </div>
      <Storage/>
      <Achievements/>
    </Container>
  );
};

export default Status;
