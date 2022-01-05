import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Spinner,
  Table,
  Button,
  Row,
  Col,
  Collapse,
} from "react-bootstrap";
import { useAppContext } from "./../../context/app-context";
import {
  getGameAchievement,
} from "./../../services/status";
import { exportJson } from "./../../utils/exportJson";
import ImportButton from "./../ImportButton";
import "jsoneditor-react/es/editor.min.css";

const Achievements = () => {
  const { game, domain, env } = useAppContext();

  const [loadingAchievement, setLoadingAchievement] = useState(true);
  const [achievement, setAchievement] = useState([]);
  const [toggleAchievement, setToggleAchievement] = useState(false);

  useEffect(() => {
    const getDataAchievement = async () => {
      if (game.name && domain) {
        setLoadingAchievement(true);
        const achievement = await getGameAchievement(game.name, domain);
        setAchievement(achievement);
        setLoadingAchievement(false);
      }
    };

    getDataAchievement();
  }, [game, domain]);

  return (
    <Container>
      <Card className="my-5">
        <Card.Header>
          <Row>
            <Col md={9}>
              <Card.Title>Achievements definition</Card.Title>
              {achievement.length === 0
                ? !loadingAchievement && (
                    <Card.Text>
                      You have not defined achievements in domain {domain} yet
                    </Card.Text>
                  )
                : !loadingAchievement && (
                    <Card.Text>
                      You have {achievement.length} achievements defined in
                      domain {domain}
                    </Card.Text>
                  )}
            </Col>
            {!loadingAchievement ? (
              <Col className="d-flex justify-content-end align-items-center">
                {achievement.length !== 0 && (
                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setToggleAchievement(!toggleAchievement)}
                    >
                      Show
                    </Button>
                    <Button
                      className="mx-2"
                      onClick={() => exportJson(env, domain, achievement)}
                      variant="outline-primary"
                    >
                      Export
                    </Button>
                  </div>
                )}
                <ImportButton expectedDomain={domain} expectedType="achievements"/>
              </Col>
            ) : (
              <Col className="d-flex justify-content-end align-items-center">
                <Spinner animation="border" variant="outline-primary" />
              </Col>
            )}
          </Row>
        </Card.Header>
        {achievement && toggleAchievement && (
          <Card.Body>
            <Collapse in={toggleAchievement}>
              <Table striped bordered hover size="sm" className="table-fixed">
                <thead>
                  <tr>
                    <th className="col-3">Key</th>
                    <th className="col-7">Value</th>
                    <th className="col-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {achievement.map((item, i) => {
                    return (
                      <tr key={`tr-${i}`}>
                        <td key={`key-${i}`}>{item.fskey}</td>
                        <td className="td-overflow" key={`value-${i}`}>
                          {item.fsvalue}
                        </td>
                        <td
                          className="d-flex justify-content-around"
                          key={`buttons-${i}`}
                        >
                          <Button
                            key={`edit-${i}`}
                            style={{ width: "30%" }}
                            size="sm"
                            variant="outline-primary"
                          >
                            Edit
                          </Button>
                          <Button
                            key={`delete-${i}`}
                            style={{ width: "30%" }}
                            variant="outline-danger"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Collapse>
          </Card.Body>
        )}
      </Card>
    </Container>
  );
};

export default Achievements;
