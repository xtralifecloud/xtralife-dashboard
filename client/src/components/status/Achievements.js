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
  FormCheck,
} from "react-bootstrap";
import { Plus, Trash } from "react-bootstrap-icons";
import { useAppContext } from "./../../context/app-context";
import {
  getGameAchievements,
  updateGameAchievements,
} from "./../../services/status";
import { exportJson } from "./../../utils/exportJson";
import ImportButton from "./../ImportButton";
import "jsoneditor-react/es/editor.min.css";
import ContentEditable from "react-contenteditable";
import { toast } from "react-toastify";

const Achievements = () => {
  const { game, domain, env } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState({});
  const [toggle, setToggle] = useState(false);
  const [selected, setSelected] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      if (game.name && domain) {
        setLoading(true);
        const achievements = await getGameAchievements(game.name, domain);
        if (achievements) setAchievements(achievements);
        setLoading(false);
      }
    })();
  }, [game, domain]);

  useEffect(() => {
    if (selected.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selected]);

  const save = () => {
    updateGameAchievements(game.name, domain, achievements);
  };

  const add = () => {
    for (const ach in achievements) {
      if (ach === newKey) {
        toast.warning(`Duplicate key: "${newKey}"`);
        return;
      }
    }

    if(newKey === "" || newKey === null){
      toast.warning(`Cannot add empty key`);
      return;
    }

    setAchievements({
      ...Object.assign(achievements, {
        [newKey]: {
          type: "limit",
          config: {
            unit: "default",
            maxValue: 0,
          },
        },
      }),
    });
  };

  const bulkDelete = () => {
    for (const ach of selected) {
      delete achievements[ach];
    }

    setAchievements({ ...achievements });
    setSelected([]);
    updateGameAchievements(game.name, domain, achievements);
  };

  const handleSelection = (e, key) => {
    if (e.target.checked) {
      setSelected((selected) => [...selected, key]);
    } else {
      setSelected(selected.filter((k) => k !== key));
    }
  };

  return (
    <Container>
      <Card className="my-5">
        <Card.Header>
          <Row>
            <Col>
              <Card.Title>Achievements definition</Card.Title>
              {Object.keys(achievements).length === 0
                ? !loading && (
                    <Card.Text>
                      You have not defined achievements in domain {domain} yet
                    </Card.Text>
                  )
                : !loading && (
                    <Card.Text>
                      You have {Object.keys(achievements).length} achievements
                      defined in domain {domain}
                    </Card.Text>
                  )}
            </Col>
            {!loading ? (
              <Col className="d-flex justify-content-end align-items-center">
                <div className="d-flex justify-content-end align-items-center">
                  <Button
                    variant="secondary"
                    onClick={() => setToggle(!toggle)}
                  >
                    Edit
                  </Button>
                  {Object.keys(achievements).length !== 0 && (
                    <Button
                      onClick={() => exportJson(env, domain, achievements, "achievements")}
                      variant="primary"
                    >
                      Export
                    </Button>
                  )}
                </div>
                <ImportButton
                  expectedDomain={domain}
                  expectedType="achievements"
                  gameName={game.name}
                  cb={setAchievements}
                />
              </Col>
            ) : (
              <Col className="d-flex justify-content-end align-items-center">
                <Spinner animation="border" variant="outline-primary" />
              </Col>
            )}
          </Row>
        </Card.Header>
        {achievements && toggle && (
          <Card.Body>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter achievement name and press 'Add new'"
                aria-label="Enter achievement name and press 'Add new'"
                onChange={(e) => setNewKey(e.target.value)}
              />
              <div className="input-group-append">
                <Button
                  variant="success"
                  onClick={() => add()}
                  className="d-flex align-items-center"
                >
                  <Plus size={25} className="mr-2" /> Add new
                </Button>
              </div>
            </div>
            <Collapse in={toggle}>
              <Table striped bordered hover size="sm" className="table-fixed">
                <thead>
                  <tr>
                    <th style={{ width: "3%" }}></th>
                    <th style={{ width: "32%" }}>Name</th>
                    <th style={{ width: "32%" }}>Unit</th>
                    <th style={{ width: "32%" }}>Trigger value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(achievements).map((key) => {
                    return (
                      <tr key={`tr-${key}`}>
                        <td style={{ width: "3%" }}>
                          <div className="d-flex align-items-center justify-content-center">
                            <FormCheck.Input
                              type="checkbox"
                              name="keyValueCheckBox"
                              onClick={(e) => handleSelection(e, key)}
                            />
                          </div>
                        </td>
                        <td key={`key-${key}`}>{key}</td>
                        <td key={`unit-${key}`}>
                          <ContentEditable
                            html={achievements[key].config.unit}
                            onChange={(e) => {
                              setAchievements(
                                Object.assign(achievements, {
                                  [key]: {
                                    type: achievements[key].type,
                                    config: {
                                      unit: e.target.value,
                                      maxValue:
                                        achievements[key].config.maxValue,
                                    },
                                  },
                                })
                              );
                            }}
                          />
                        </td>
                        <td key={`maxValue-${key}`}>
                          <ContentEditable
                            html={achievements[key].config.maxValue}
                            onChange={(e) => {
                              setAchievements(
                                Object.assign(achievements, {
                                  [key]: {
                                    config: {
                                      unit: achievements[key].config.unit,
                                      maxValue: e.target.value,
                                    },
                                  },
                                })
                              );
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Collapse>
            <div className="w-100 d-flex justify-content-between">
              <Button
                variant="danger"
                disabled={buttonDisabled}
                onClick={() => bulkDelete()}
                className="d-flex align-items-center my-2"
              >
                <Trash size={20} className="mr-2" /> Delete {selected.length}{" "}
                {selected.length=== 1 ? "achievement": "achievements"}

              </Button>
              <Button variant="success" className="my-2" onClick={() => save()}>
                Save
              </Button>
            </div>
          </Card.Body>
        )}
      </Card>
    </Container>
  );
};

export default Achievements;
