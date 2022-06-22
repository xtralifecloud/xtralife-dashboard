import React, {useEffect, useState} from "react";
import {Modal, Button} from "react-bootstrap";
import JSONEditor from "../JSONEditor";
import { toast } from "react-toastify";

const JSONEditorModal = (props) => {
  const [content, setContent] = useState({});
  const [saveDisabled, setSaveDisabled] = useState(true);

  useEffect(() => {
    setContent({ json: props.value })
  }, [props])

  return (
    <Modal
      size="xl"
      show={props.show}
      onHide={() => {
        props.setShow(false);
        setSaveDisabled(true)
        if(props.onHide) props.onHide();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="kv-modal">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <JSONEditor
          mode="code"
          content={content}
          onChange={(res) => {
            try {
              JSON.parse(res.text);
              setSaveDisabled(false);
            } catch (e) {
              setSaveDisabled(true);
            }
            setContent(res)
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShow(false);
            setSaveDisabled(true)
            if(props.onHide) props.onHide();
          }}
          color="white"
        >
          Cancel
        </Button>
        <Button
          disabled={saveDisabled}
          variant="success"
          onClick={() => {
            props.setShow(false);
            setSaveDisabled(true)
            try {
              const json = JSON.parse(content.text)
              if (json && props.setValue) props.setValue(json);
              if (props.onSave) props.onSave(json);
            } catch (e){
              console.log(e);
              toast.error("Error while saving json. See console for more details");
            }
          }}
        >
          {props.customSaveString ? props.customSaveString : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JSONEditorModal;
