import React, { useState, useEffect } from "react";
import { Container, Button, Table, FormCheck } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getUserStorage, deleteUserStorage, editUserStorage } from "../../services/user";
import { Plus, Trash, Clipboard } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import UploadBinaryButton from "../UploadBinaryButton";
import { copyToClipboard } from "../../utils/copyToClipboard";
import JSONEditorModal from "../modals/JSONEditorModal";

const Storage = ({ refresh }) => {
  const { game, domain } = useAppContext();
  const [storage, setStorage] = useState([]);
  const { userId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedKV, setSelectedKV] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [tempValue, setTempValue] = useState(null)

  useEffect(() => {
    getStorageData(game, domain, userId);
  }, [game, domain, userId, refresh]);

  const getStorageData = async (game, domain, userId) => {
    if (game && domain) {
      const storage = await getUserStorage(game.name, domain, userId);
      if (storage) setStorage(storage);
    }
  };

  const cbSetStorage = (value) => {
    setStorage(value);
  };

  const addKV = async (e) => {
    e.preventDefault();
    for (const el of storage) {
      if (Object.values(el).includes(newKey)) {
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

  const handleSelection = (e, i) => {
    if (e.target.checked) {
      setSelectedKeys((selectedKeys) => [...selectedKeys, i]);
    } else {
      setSelectedKeys(selectedKeys.filter((index) => index !== i));
    }
  };

  const bulkDeleteKV = async () => {
    setSelectedKV(null);
    let tempStorage = storage;
    for (const key of selectedKeys) {
      tempStorage = tempStorage.filter(function(tempStorage){
        return tempStorage.fskey !== key.toString();
        });
      await deleteUserStorage(game.name, domain, userId, key);
    }
    setStorage(tempStorage);
    setSelectedKeys([]);
  };

  useEffect(() => {
    if (selectedKeys.length === 0) {
      setDeleteDisabled(true);
    } else {
      setDeleteDisabled(false);
    }
  }, [selectedKeys]);

  const saveKV = async (modifiedValue) => {
    if (modifiedValue === null) {
      toast.warning("Invalid JSON");
    } else {
      setShowModal(false);
      setSelectedKV(null);
    if (storage[selectedKV].fsvalue !== modifiedValue) {
      storage[selectedKV].fsvalue = JSON.stringify(modifiedValue);
    }
    setStorage([...storage]);
    setTempValue(null);
    return await editUserStorage(game.name, domain, userId, storage[selectedKV], setStorage);
  }
  }

  return (
    <Container className="p-0">
      {storage && (
        <div>
          <form className="input-group mb-3 w-70">
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
                type="submit"
                onClick={(e) => addKV(e)}
                className="d-flex align-items-center"
              >
                <Plus size={25} className="mr-2" /> Add new key
              </Button>
            </div>
          </form>

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
                  <th style={{ width: "35%" }}>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {storage.map((item, i) => {
                  return (
                    <tr key={`line-${item.fskey}`}>
                      <td
                        key={`checkbox-${item.fskey}`}
                        style={{ width: "3%" }}
                        className="align-middle"
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <FormCheck.Input
                            type="checkbox"
                            onClick={(e) => handleSelection(e, item.fskey)}
                          />
                        </div>
                      </td>
                      <td
                        key={`fskey-${item.fskey}`}
                        className="td-overflow align-middle"
                        style={{ width: "35%" }}
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
                            user_id={userId}
                          />
                        </div>
                      </td>
                      <td
                        key={`fsvalue-${item.fskey}`}
                        className="td-overflow align-middle clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedKV(i);
                          setTempValue(JSON.parse(item.fsvalue))
                          setShowModal(true);
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
          <Button
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => bulkDeleteKV()}
            className="mt-3"
          >
            <Trash size={20} /> Delete {selectedKeys.length}{" "}
            {selectedKeys.length === 1 ? "key" : "keys"}
          </Button>

          <JSONEditorModal
            show={showModal}
            setShow={setShowModal}
            onHide={() => {
              setSelectedKV(null);
              setTempValue(null);
            }}
            value={tempValue}
            onSave={async (json) => {
              await saveKV(json);
              setSelectedKV(null);
            }}
            title={`Key: ${selectedKV !== null && storage[selectedKV].fskey}`}
          />
        </div>
      )}
    </Container>
  );
};

export default Storage;
