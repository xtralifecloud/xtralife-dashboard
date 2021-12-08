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
  Modal,
} from "react-bootstrap";
import { Trash, PencilSquare, Plus, Speedometer } from "react-bootstrap-icons";
import { useAppContext } from "../context/app-context";
import {
  getGameStorage,
  getGameAchievement,
  updateGameStorage,
} from "../services/status";
import { exportJson } from "../utils/exportJson";
import { JsonEditor } from "jsoneditor-react";
import ImportButton from "./../components/ImportButton";
import "jsoneditor-react/es/editor.min.css";
import ConfirmationModal from "../components/modals/ConfirmationModal";

const Status = () => {
  const { game, domain, env } = useAppContext();

  const [storage, setStorage] = useState([]);
  const [tempValue, setTempValue] = useState(null);
  const [selectedKV, setSelectedKV] = useState(null);
  const [toggleKV, setToggleKV] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [modalKV, setModalKV] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [newKey, setNewKey] = useState("");

  const [loadingAchievement, setLoadingAchievement] = useState(true);
  const [achievement, setAchievement] = useState([]);
  const [toggleAchievement, setToggleAchievement] = useState(false);

  useEffect(() => {
    const getDataStorage = async () => {
      if (game.name && domain) {
        setLoadingStorage(true);
        const storage = await getGameStorage(game.name, domain);
        setStorage(storage);
        setLoadingStorage(false);
      }
    };
    const getDataAchievement = async () => {
      if (game.name && domain) {
        setLoadingAchievement(true);
        const achievement = await getGameAchievement(game.name, domain);
        setAchievement(achievement);
        setLoadingAchievement(false);
      }
    };

    getDataStorage();
    getDataAchievement();
  }, [game, domain]);

  useEffect(() => {
    if (modalKV) {
      const menu = document.getElementsByClassName("jsoneditor-menu")[0];
      const editor = document.getElementsByClassName("jsoneditor")[0];
      const textArea = document.getElementsByClassName("jsoneditor-text")[0];

      menu.style.backgroundColor = "#00284c";
      menu.style.border = "none";
      editor.style.border = "none";
      textArea.style.padding = "10px 5px";
    }
  }, [modalKV]);


  const deleteKV = () => {
    setConfirmation(false);
    let tempStorage = storage.filter((kv, i) => i !== selectedKV);
    setStorage(tempStorage);
    updateGameStorage(game.name, domain, tempStorage);
  };

  const addKV = () => {
    let tempStorage = storage;
    tempStorage.push({
      fskey: newKey,
      fsvalue: JSON.stringify({ edit: "me" }),
    });
    setStorage(tempStorage);
    updateGameStorage(game.name, domain, tempStorage);
  };
  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <Speedometer className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Status</h1>
      </div>
      <Card className="mt-5">
        <Card.Header>
          <Row>
            <Col>
              <Card.Title>Key/Value storage</Card.Title>
              {storage.length === 0
                ? !loadingStorage && (
                    <Card.Text>
                      Your game is not using Key/Value storage in domain{" "}
                      {domain}
                    </Card.Text>
                  )
                : !loadingStorage && (
                    <Card.Text>
                      Your game is using {storage.length} keys in domain{" "}
                      {domain}
                    </Card.Text>
                  )}
            </Col>
            {!loadingStorage ? (
              <Col className="d-flex justify-content-end align-items-center">
                {storage.length !== 0 && (
                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      onClick={() => setToggleKV(!toggleKV)}
                      variant="outline-secondary"
                    >
                      Show
                    </Button>
                    <Button
                      className="mx-2"
                      onClick={() => exportJson(env, domain, storage)}
                      variant="outline-primary"
                    >
                      Export
                    </Button>
                  </div>
                )}
                <ImportButton />
              </Col>
            ) : (
              <Col className="d-flex justify-content-end align-items-center">
                <Spinner animation="border" variant="outline-primary" />
              </Col>
            )}
          </Row>
        </Card.Header>

        {storage && toggleKV && (
          <Card.Body>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Key name and press 'Add new key'"
                aria-label="Enter Key name and press 'Add new key'"
                onChange={(e) => setNewKey(e.target.value)}
              />
              <div className="input-group-append">
                <Button variant="success" onClick={() => addKV()}>
                  <Plus size={25} /> Add new key
                </Button>
              </div>
            </div>

            <Collapse in={toggleKV}>
              <Table
                borderless
                striped
                hover
                size="sm"
                className="table-fixed-storage"
              >
                <thead>
                  <tr>
                    <th className="col-3">Key</th>
                    <th className="col-7">Value</th>
                    <th className="col-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {storage.map((item, i) => {
                    return (
                      <tr key={`tr-${i}`}>
                        <td className="col-3" key={`key-${i}`}>
                          {item.fskey}
                        </td>
                        <td className="td-overflow col-7" key={`value-${i}`}>
                          {item.fsvalue}
                        </td>
                        <td
                          className="d-flex justify-content-around w-100 col-2"
                          key={`buttons-${i}`}
                        >
                          <Button
                            key={`edit-${i}`}
                            style={{ width: "30%" }}
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedKV(i);
                              setModalKV(true);
                            }}
                          >
                            <PencilSquare size={20} />
                          </Button>
                          <Button
                            key={`delete-${i}`}
                            style={{ width: "30%" }}
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedKV(i);
                              setConfirmation(true);
                            }}
                          >
                            <Trash color="white" size={20} />
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
                <ImportButton />
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

      <Modal
        size="lg"
        show={modalKV}
        onHide={() => {
          setModalKV(false);
          setSelectedKV(null);
          setTempValue(null);
        }}
        aria-labelledby="kv-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="kv-modal">
            {selectedKV !== null && storage[selectedKV].fskey}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedKV !== null && (
            <JsonEditor
              language="en"
              value={JSON.parse(storage[selectedKV].fsvalue)}
              mode="code"
              onChange={(json) => {
                setTempValue(json);
              }}
              enableTransform={false}
              enableSort={false}
              history={true}
              allowedModes={["form", "code"]}
              StatusBar={true}
              search={true}
              htmlElementProps={{ style: { height: 600, border: "none" } }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setModalKV(false);
              setSelectedKV(null);
              setTempValue(null);
            }}
            color="white"
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setModalKV(false);
              setSelectedKV(null);
              let tempStorage = storage;
              tempStorage[selectedKV].fsvalue = JSON.stringify(tempValue);
              setStorage(tempStorage);
              setTempValue(null);
              updateGameStorage(game.name, domain, tempStorage);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmationModal
        show={confirmation}
        onHide={() => setConfirmation(false)}
        action={deleteKV}
        body={`Are you sure you want to delete ${
          storage[selectedKV] ? storage[selectedKV].fskey : null
        } ?`}
        title="Key/Value deletion"
      />
    </Container>
  );
};

export default Status;
