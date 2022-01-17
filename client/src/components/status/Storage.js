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
  FormCheck,
} from "react-bootstrap";
import { Trash, PencilSquare, Plus } from "react-bootstrap-icons";
import { useAppContext } from "./../../context/app-context.js";
import { getGameStorage, updateGameStorage } from "../../services/status";
import { exportJson } from "./../../utils/exportJson";
import { JsonEditor } from "jsoneditor-react";
import ImportButton from "./../../components/ImportButton";
import "jsoneditor-react/es/editor.min.css";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { toast } from "react-toastify";

const Storage = () => {
  const { game, domain, env } = useAppContext();

  const [storage, setStorage] = useState([]);
  const [tempValue, setTempValue] = useState(null);
  const [selectedKV, setSelectedKV] = useState(null);
  const [selectedKVs, setSelectedKVs] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [toggleKV, setToggleKV] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [modalKV, setModalKV] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    (async () => {
      if (game.name && domain) {
        setLoadingStorage(true);
        const storage = await getGameStorage(game.name, domain);
        if(storage) setStorage(storage);
        setLoadingStorage(false);
      }
    })();
  }, [game, domain]);

  useEffect(() => {
    if (selectedKVs.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selectedKVs]);

  const handleSelection = (e, index) => {
    if (e.target.checked) {
      setSelectedKVs((selectedKVs) => [...selectedKVs, index]);
    } else {
      setSelectedKVs(selectedKVs.filter((i) => i !== index));
    }
  };

  const bulkDeleteKVs = () => {
    setConfirmation(false);
    let tempStorage = storage.filter((_, i) => !selectedKVs.includes(i));
    setStorage(tempStorage);
    setSelectedKV(null);
    setSelectedKVs([]);
    updateGameStorage(game.name, domain, tempStorage);
  };

  const addKV = () => {
    for (const e of storage) {
      if (Object.values(e).includes(newKey)) {
        toast.warning(`Duplicate key: "${newKey}"`);
        return;
      }
    }

    if(newKey === "" || newKey === null){
      toast.warning(`Cannot add empty key`);
      return;
    }

    setStorage((previousStorage) => [
      ...previousStorage,
      {
        fskey: newKey,
        fsvalue: JSON.stringify({ edit: "me" }),
      },
    ]);
  };

  const saveKV = () => {
    if (tempValue === null) {
      toast.warning("Invalid JSON");
    } else {
      setModalKV(false);
      setSelectedKV(null);
      if(storage[selectedKV].fsvalue !== tempValue){
        storage[selectedKV].fsvalue = JSON.stringify(tempValue);
      }
      setStorage([...storage]);
      setTempValue(null);
      updateGameStorage(game.name, domain, storage, setStorage);
    }
  };

  return (
    <Container>
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
                <div className="d-flex justify-content-end align-items-center">
                  <Button
                    onClick={() => setToggleKV(!toggleKV)}
                    variant="secondary"
                  >
                    Edit
                  </Button>
                  {storage.length !== 0 && (
                    <Button
                      onClick={() => exportJson(env, domain, storage, "gamekv")}
                      variant="primary"
                    >
                      Export
                    </Button>
                  )}
                </div>
                <ImportButton
                  expectedDomain={domain}
                  expectedType="gamekv"
                  gameName={game.name}
                  cb={setStorage}
                />
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
                <Button
                  variant="success"
                  onClick={() => addKV()}
                  className="d-flex align-items-center"
                >
                  <Plus size={25} className="mr-2" /> Add new key
                </Button>
              </div>
            </div>

            <Collapse in={toggleKV}>
              <div className="table-wrapper">
                <Table
                  size="sm"
                  bordered
                  striped
                  hover
                  borderless
                  responsive
                  className="table-fixed-storage"
                >
                  <thead>
                    <tr>
                      <th style={{ width: "3%" }}></th>
                      <th style={{ width: "34%" }}>Key</th>
                      <th style={{ width: "60%" }}>Value</th>
                      <th style={{ width: "3%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {storage.map((item, i) => {
                      return (
                        <tr key={`tr-${item.fskey}`}>
                          <td style={{ width: "3%" }}>
                            <div className="d-flex align-items-center justify-content-center">
                              <FormCheck.Input
                                type="checkbox"
                                name="keyValueCheckBox"
                                onClick={(e) => handleSelection(e, i)}
                              />
                            </div>
                          </td>
                          <td
                            style={{ width: "34%" }}
                            key={`key-${item.fskey}`}
                          >
                            {item.fskey}
                          </td>
                          <td
                            className="td-overflow"
                            style={{ width: "60%" }}
                            key={`value-${item.fskey}`}
                          >
                            {item.fsvalue}
                          </td>
                          <td style={{ width: "3%" }}>
                            <button
                              onClick={() => {
                                setSelectedKV(i);
                                setTempValue(item.fsvalue)
                                setModalKV(true);
                              }}
                              className="remove-btn-css mr-2 d-flex algin-items-center"
                            >
                              <PencilSquare size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Collapse>
            <Button
              variant="danger"
              disabled={buttonDisabled}
              onClick={() => setConfirmation(true)}
              className="d-flex align-items-center mt-2"
            >
              <Trash size={20} className="mr-2" /> Delete {selectedKVs.length}{" "}
              key/value
            </Button>
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
              saveKV();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmationModal
        show={confirmation}
        onHide={() => setConfirmation(false)}
        action={bulkDeleteKVs}
        body={`Are you sure you want to delete ${selectedKVs.length} key/value ?`}
        title="Key/Value deletion"
      />
    </Container>
  );
};

export default Storage;
