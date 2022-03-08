import React from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmationModal = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      aria-labelledby="confirmation-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="confirmation-modal">
          {props.title} 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.body}
      </Modal.Body>
      <Modal.Footer>
        <Button className="secondary" onClick={() => props.onHide()}>Cancel</Button>
        <Button className="danger" onClick={() => props.action()}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
