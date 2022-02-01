import React from "react";
import { House, BoxArrowInRight } from "react-bootstrap-icons";
import { Container, Row, Col, Button } from "react-bootstrap";
import Login from "../components/Login";
import { useAppContext } from "../context/app-context";
import { isPresent } from "../utils/isPresent";
import useSession from "../hooks/useSession";

const Home = () => {
  const { user } = useAppContext();
  const {logout} = useSession()

  return (
    <Container>
      <div className="d-flex flex-column align-items-center justify-content-center my-5">
        <House size={40} />
        <h1 style={{ fontSize: "35px" }} className="mt-2">
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
      </div>
      <Row>
        <Col className="d-flex justify-content-center align-items-center">
          {isPresent([user]) ? (
            <div>
              <p>You are already logged in</p>
              <div className="d-flex align-items-center justify-content-center">
                <Button className="d-flex align-items-center" onClick={() => logout()}>
                  <BoxArrowInRight  size={20}  className="mr-2" color="rgba(255, 255, 255, 0.55)" /> Logout
                </Button>
              </div>
            </div>
          ) : (
            <Login />
          )}
        </Col>
        <Col>
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
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
