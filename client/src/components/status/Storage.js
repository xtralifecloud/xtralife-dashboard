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
import { Trash, Clipboard, Plus } from "react-bootstrap-icons";
import { useAppContext } from "./../../context/app-context.js";
import { getGameStorage, updateGameStorage } from "../../services/status";
import { exportJson } from "./../../utils/exportJson";
import { JsonEditor } from "jsoneditor-react";
import ImportButton from "./../ImportButton";
import UploadBinaryButton from "./../UploadBinaryButton";
import "jsoneditor-react/es/editor.min.css";
import ConfirmationModal from "../modals/ConfirmationModal";
import { toast } from "react-toastify";
import { copyToClipboard } from "../../utils/copyToClipboard.js";
import ace from "brace";
import "brace/mode/json";
import "brace/theme/dracula";

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
    let isCancelled = false;

    (async () => {
      if (game.name && domain) {
        setLoadingStorage(true);
        const storage = await getGameStorage(game.name, domain);
        if (!isCancelled) {
          if (storage) setStorage(storage);
          setLoadingStorage(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [game, domain]);

  useEffect(() => {
    if (selectedKVs.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selectedKVs]);

  const cbSetStorage = (value) => {
    setLoadingStorage(false);
    setStorage(value);
  };

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

    if (newKey === "" || newKey === null) {
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
      if (storage[selectedKV].fsvalue !== tempValue) {
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
                  loading={setLoadingStorage}
                  cb={cbSetStorage}
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
                      <th style={{ width: "35%" }}>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storage.map((item, i) => {
                      return (
                        <tr key={`tr-${item.fskey}`}>
                          <td style={{ width: "3%" }} className="align-middle">
                            <div className="d-flex align-items-center justify-content-center">
                              <FormCheck.Input
                                type="checkbox"
                                name="keyValueCheckBox"
                                onClick={(e) => handleSelection(e, i)}
                              />
                            </div>
                          </td>
                          <td
                            className="td-overflow align-middle"
                            style={{ width: "35%" }}
                            key={`key-${item.fskey}`}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <p
                                className="m-0"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.fskey}
                              </p>
                              <UploadBinaryButton
                                domain={domain}
                                fsKey={item.fskey}
                                gameName={game.name}
                                storage={storage}
                                selectedKV={i}
                                cb={cbSetStorage}
                                user_id={null}
                              />
                            </div>
                          </td>
                          <td
                            className="td-overflow clickable align-middle"
                            key={`value-${item.fskey}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedKV(i);
                              setTempValue(item.fsvalue);
                              setModalKV(true);
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between h-100">
                              <p
                                className="m-0"
                                style={{
                                  width: "95%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.fsvalue}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  copyToClipboard(item.fsvalue);
                                }}
                                className="remove-btn-css mr-2 d-flex algin-items-center"
                              >
                                <Clipboard size={20} color="#4c9be8" />
                              </button>
                            </div>
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
            Key: {selectedKV !== null && storage[selectedKV].fskey}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
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
              search={true}
              ace={ace}
              theme="ace/theme/dracula"
              htmlElementProps={{
                style: {
                  height: 600,
                  border: "none",
                },
              }}
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
