import React from "react";
import { Link } from "react-router-dom";
import { House } from "react-bootstrap-icons";
import { Container, Button } from "react-bootstrap";

const Home = () => {
  return (
    <Container>
      <div className="d-flex flex-column align-items-center justify-content-center my-5">
        <House size={40} />
        <h1 style={{ fontSize: "30px" }} className="mt-2">
          Welcome to Xtralife Dashboard!
        </h1>
        <p className="mt-4">
          <strong>CloudBuilder</strong> , Xtralife.cloud's framework, is a one
          stop shop tool to let you manage dematerialized players’ data and
          information, as well as interactions with other players, in a
          completely cross-platform way. As long as the player engages in a game
          or application which is connected, notwithstanding which platform is
          used, he will retrieve all his history and accumulated progress. It is
          designed in a modular way, organized in several layers in order to
          benefit from automated load-balancing, and absorb any peak of usage
          very quickly.
        </p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
      <p>We'll empower your games :</p>
      <ul>
        <li>Profile management</li>
        <li>Friends and connections</li>
        <li>Downloadable Content Manager</li>
        <li>Leaderboards</li>
        <li>Challenges</li>
        <li>Cross-platform push notifications</li>
        <li>Facebook, Google+ and GameCenter integration</li>
        <li>Cross-platform data persistence</li>
        <li>Turn by turn multiplayer</li>
        <li>Synchronous multiplayer</li>
        <li>Cross-application messenger module</li>
        <li>Cross-application data storage</li>
        <li>And much more...</li>
      </ul>
    </Container>
  );
};

export default Home;
