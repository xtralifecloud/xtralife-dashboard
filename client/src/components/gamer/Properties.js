import React, { useState, useEffect } from "react";
import { Container, Button, Table, FormCheck } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getUserProperties, updateUserProperties } from "../../services/user";
import ContentEditable from "react-contenteditable";
import "jsoneditor-react/es/editor.min.css";
import { Plus, Trash } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const Properties = () => {
  const { game, domain } = useAppContext();
  const [properties, setProperties] = useState({});
  const { userId } = useParams();
  const [newProperty, setNewProperty] = useState(null);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState([]);

  useEffect(() => {
    (async () => {
      if (game && domain) {
        const properties = await getUserProperties(game.name, domain, userId);
        if (properties) setProperties(properties);
      }
    })();
  }, [game, domain, userId]);

  const saveProperties = async () => {
    const res = await updateUserProperties(
      game.name,
      domain,
      userId,
      properties
    );
    if (res.status === 200) {
      toast.success("Properties updated successfully");
    }
  };

  const addProperty = () => {
    if (newProperty === null || newProperty === "") {
      toast.warn("Cannot add property with null key");
    } else if (newProperty in properties) {
      toast.warn(`Duplicate key: "${newProperty}"`);
    } else {
      setProperties(
        Object.assign(properties, { [newProperty]: "default value, update me" })
      );
      setNewProperty(null);
    }
  };

  const handleSelection = (e, key) => {
    if (e.target.checked) {
      setSelectedProperties((selectedProperties) => [
        ...selectedProperties,
        key,
      ]);
    } else {
      setSelectedProperties(
        selectedProperties.filter((property) => property !== key)
      );
    }
  };

  const bulkDeleteProperties = () => {
    for (const property of selectedProperties) {
      delete properties[property];
    }
    setProperties(properties);
    setSelectedProperties([]);
  };

  useEffect(() => {
    if (selectedProperties.length === 0) {
      setDeleteDisabled(true);
    } else {
      setDeleteDisabled(false);
    }
  }, [selectedProperties]);

  return (
    <Container className="p-0">
      {properties && (
        <div>
          <div className="input-group mb-3 w-70">
            <input
              type="text"
              className="form-control"
              placeholder="Enter property name and press 'Add new property'"
              aria-label="Enter property name and press 'Add new property'"
              onChange={(e) => setNewProperty(e.target.value)}
            />
            <div className="input-group-append">
              <Button
                variant="success"
                onClick={() => addProperty()}
                className="d-flex align-items-center"
              >
                <Plus size={25} className="mr-2" /> Add new property
              </Button>
            </div>
          </div>

          <div className="table-wrapper">
            <Table
              size="sm"
              className="table-fixed-properties"
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
                {Object.keys(properties).map((key) => {
                  return (
                    <tr key={`line-${key}`}>
                      <td key={`checkbox-${key}`} style={{ width: "3%" }}>
                        <div className="d-flex align-items-center justify-content-center">
                          <FormCheck.Input
                            type="checkbox"
                            onClick={(e) => handleSelection(e, key)}
                          />
                        </div>
                      </td>
                      <td
                        key={`fskey-${key}`}
                        className="td-overflow"
                        style={{ width: "22%" }}
                      >
                        {key}
                      </td>
                      <td
                        key={`fsvalue-${key}`}
                        className="td-overflow"
                        style={{ width: "75%" }}
                      >
                        <ContentEditable
                          html={properties[key]}
                          onChange={(e) => {
                            setProperties(
                              Object.assign(properties, {
                                [key]: e.target.value,
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
          </div>
          <div className="d-flex justify-content-between mt-3">
            <Button
              variant="danger"
              disabled={deleteDisabled}
              onClick={() => bulkDeleteProperties()}
              className="d-flex align-items-center"
            >
              <Trash size={20} className="mr-2" /> Delete{" "}
              {selectedProperties.length}{" "}
              {selectedProperties.length === 1 ? "property" : "properties"}
            </Button>

            <Button variant="success" onClick={() => saveProperties()}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Properties;
