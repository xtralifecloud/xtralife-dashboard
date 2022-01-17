import React, { useState, useEffect } from "react";
import { Container, Modal, Button, Table, FormCheck } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getUserStorage, updateUserStorage } from "../../services/user";
import { JsonEditor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import { Plus, Trash } from "react-bootstrap-icons";

const Storage = () => {
  const { game, domain } = useAppContext();
  const [storage, setStorage] = useState([]);
  console.log("storage2:", storage);
  const { userId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedKV, setSelectedKV] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    (async () => {
      if (game && domain) {
        const storage = await getUserStorage(game.name, domain, userId);
        if (storage) setStorage(storage);
      }
    })();
  }, [game, domain, userId]);

  const addKV = () => {
    const updatedStorage = storage;
    updatedStorage.push({
      fskey: newKey,
      fsvalue: JSON.stringify({ edit: "me" }),
    });
    setStorage(updatedStorage);

    updateUserStorage(game.name, domain, userId, storage);
  };

  const handleSelection = (e, i) => {
    if (e.target.checked) {
      setSelectedKeys((selectedKeys) => [...selectedKeys, i]);
    } else {
      setSelectedKeys(selectedKeys.filter((index) => index !== i));
    }
  };

  const bulkDeleteUser = () => {
    const filteredStorage = storage.filter(
      (_, index) => !selectedKeys.includes(index)
    );
    setStorage(filteredStorage);
    setSelectedKeys([]);
    updateUserStorage(game.name, domain, userId, filteredStorage);
  };

  useEffect(() => {
    if (selectedKeys.length === 0) {
      setDeleteDisabled(true);
    } else {
      setDeleteDisabled(false);
    }
  }, [selectedKeys]);

  return (
    <Container className="p-0">
      {storage && (
        <div>
          <div className="input-group mb-3 w-70">
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

          <div className="table-wrapper">
            <Table
              size="sm"
              className="table-fixed-storage"
              bordered
              hover
              borderless
              responsive
            >
              <thead>
                <tr>
                  <th style={{ width: "3%" }}></th>
                  <th style={{ width: "22%" }}>Key</th>
                  <th style={{ width: "75%" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {storage.map((e, i) => {
                  return (
                    <tr key={`line-${e.fskey}`}>
                      <td key={`checkbox-${e.fskey}`} style={{ width: "3%" }}>
                        <div className="d-flex align-items-center justify-content-center">
                          <FormCheck.Input
                            type="checkbox"
                            onClick={(e) => handleSelection(e, i)}
                          />
                        </div>
                      </td>
                      <td
                        key={`fskey-${e.fskey}`}
                        className="td-overflow"
                        style={{ width: "22%" }}
                        onClick={() => {
                          setSelectedKV(i);
                          setShowModal(true);
                        }}
                      >
                        {e.fskey}
                      </td>
                      <td
                        key={`fsvalue-${e.fskey}`}
                        className="td-overflow"
                        style={{ width: "75%" }}
                        onClick={() => {
                          setSelectedKV(i);
                          setShowModal(true);
                        }}
                      >
                        {e.fsvalue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <Button
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => bulkDeleteUser()}
            className="mt-3"
          >
            <Trash size={20} /> Delete {selectedKeys.length}{" "}
            {selectedKeys.length === 1 ? "key" : "keys"}
          </Button>

          <Modal
            size="lg"
            show={showModal}
            onHide={() => {
              setShowModal(false);
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
                    storage[selectedKV].fsvalue = JSON.stringify(json);
                  }}
                  enableTransform={false}
                  enableSort={false}
                  history={true}
                  allowedModes={["form", "code"]}
                  search={true}
                  htmlElementProps={{ style: { height: 600, border: "none" } }}
                />
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedKV(null);
                }}
                color="white"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setShowModal(false);
                  setSelectedKV(null);
                  setStorage(storage);
                  updateUserStorage(game.name, domain, userId, storage);
                }}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </Container>
  );
};

export default Storage;
