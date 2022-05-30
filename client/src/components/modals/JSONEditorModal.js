import React, {useState} from "react";
import {Modal, Button} from "react-bootstrap";
import ace from "brace";
import "brace/mode/json";
import "brace/theme/dracula";
import "jsoneditor-react/es/editor.min.css";
import {JsonEditor} from "jsoneditor-react";

const JSONEditorModal = (props) => {
  const [modifiedValue, setModifiedValue] = useState(null);

  return (
    <Modal
      size="lg"
      show={props.show}
      onHide={() => {
        props.setShow(false);
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="kv-modal">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <JsonEditor
          language="en"
          value={props.value}
          mode="code"
          onChange={(json) => {
            setModifiedValue(json);
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShow(false);
          }}
          color="white"
        >
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={() => {
            props.setShow(false);
            if (modifiedValue) props.setValue(modifiedValue);
            if (props.onSave) props.onSave(modifiedValue);
          }}
        >
          {props.customSaveString ? props.customSaveString : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JSONEditorModal;
