import React from "react";
import { Form, Container, Row, Col, Card } from "react-bootstrap";
import { useAppContext } from "../context/app-context";
import { isPresent } from "../utils/isPresent";

const GameAndDomainSelector = () => {
  const { user, game, domain, setGame, setDomain } = useAppContext();

  const handleChangeGame = (e) => {
    const newGame = JSON.parse(e.target.value);
    if (!newGame.domains.includes(domain)) {
      setDomain(newGame.domains[0]);
    }
    setGame(newGame);
  };

  return (
    isPresent([game]) && (
      <Container className="mt-3">
        <Card style={{borderRadius: "10px"}}>
          <Form className="my-3">
            <Container fluid>
              <Row>
                <Col md={6} xs={12} className="d-flex align-items-center my-1">
                  <Form.Label className="my-0 mx-3">Game:</Form.Label>
                  <Form.Select
                    defaultValue={JSON.stringify(game)}
                    onChange={(e) => handleChangeGame(e)}
                  >
                    {user.games.map((game, i) => {
                      return (
                        <option value={JSON.stringify(game)} key={i}>
                          {game.name}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>

                <Col md={6} xs={12} className="d-flex align-items-center my-1">
                  <Form.Label className="my-0 mx-3">Domain:</Form.Label>
                  <Form.Select
                    defaultValue={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    {game.domains.map((domain, i) => {
                      return (
                        <option value={domain} key={i}>
                          {domain}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
              </Row>
            </Container>
          </Form>
        </Card>
      </Container>
    )
  );
};

export default GameAndDomainSelector;
