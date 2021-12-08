import React, { useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { parseTx } from "./../../../utils/tx";
import { getProducts, postProduct } from "../../../services/store";
import { useAppContext } from "../../../context/app-context";
import { isPresent } from "../../../utils/isPresent";

export const AddProductModal = (props) => {
  const {game} = useAppContext()
  const [productId, setProductId] = useState(props.productId);
  const [appStoreId, setAppStoreId] = useState(props.appStoreId);
  const [macStoreId, setMacStoreId] = useState(props.macStoreId);
  const [googlePlayId, setGooglePlayId] = useState(props.googlePlayId);
  const [tx, setTx] = useState(props.tx);
  const [description, setDescription] = useState(props.description);
  const [txDomain, setTxDomain] = useState(props.txDomain);
  const [disableSave, setDisableSave] = useState(true);

  const handleSave = async () => {
    const product = {
      productId: productId,
      appStoreId: appStoreId,
      macStoreId: macStoreId,
      googlePlayId: googlePlayId,
      reward: {
        domain: txDomain,
        description: description,
        tx: tx,
      },
    };

    await postProduct(game.name, product);
    props.setProducts(await getProducts(game.name))
    props.setShow(false);
  };

  return (
    <Modal
      show={props.show}
      size="lg"
      onHide={() => {
        props.setShow(false);
      }}
      aria-labelledby="add-product-modal"
      centered
    >
      <Modal.Header>
        <Modal.Title>Add product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row}>
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Product ID
            </Form.Label>
            <Col
              sm={10}
              className="d-flex flex-column justify-content-center align-items-start"
            >
              <Form.Control
                type="text"
                placeholder="Used to identify the product in your app"
                onChange={(e) => {
                  const textRequired = document.getElementById("text-required");
                  if (e.target.value) {
                    setDisableSave(false);
                    textRequired.classList.add("opacity-0");
                  } else {
                    setDisableSave(true);
                    textRequired.classList.remove("opacity-0");
                  }
                  setProductId(e.target.value);
                }}
              />
              <p id="text-required" className="text-danger m-0">
                required
              </p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Product ID on the AppStore
            </Form.Label>
            <Col
              sm={10}
              className="d-flex justify-content-center align-items-center"
            >
              <Form.Control
                type="text"
                placeholder="Equivalent product on the AppStore"
                onChange={(e) => {
                  setAppStoreId(e.target.value);
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Product ID on the Mac AppStore
            </Form.Label>
            <Col
              sm={10}
              className="d-flex justify-content-center align-items-center"
            >
              <Form.Control
                type="text"
                placeholder="Equivalent product on the Mac AppStore"
                onChange={(e) => {
                  setMacStoreId(e.target.value);
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              SKU on Google Play
            </Form.Label>
            <Col
              sm={10}
              className="d-flex justify-content-center align-items-center"
            >
              <Form.Control
                type="text"
                placeholder="Equivalent product on Google play"
                onChange={(e) => {
                  setGooglePlayId(e.target.value);
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Transaction on success
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                placeholder="Example: gold: +50, silver: +100"
                onChange={(e) => {
                  setTx(parseTx(e.target.value));
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Transaction on success
            </Form.Label>
            <Col sm={10}>
              {isPresent([game]) && <Form.Select
                defaultValue={txDomain}
                onChange={(e) => setTxDomain(e.target.value)}
              >
                {game.domains.map((domain, i) => {
                  return (
                    <option value={domain} key={i}>
                      {domain}
                    </option>
                  );
                })}
              </Form.Select>}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Description
            </Form.Label>
            <Col
              sm={10}
              className="d-flex justify-content-center align-items-center"
            >
              <Form.Control
                type="text"
                placeholder="Description for transaction executed upon purchase"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Col>
          </Form.Group>

          <Modal.Footer className="pb-0">
            <Button variant="secondary" onClick={() => props.setShow(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              id="save-add-product"
              disabled={disableSave}
              onClick={() => handleSave()}
            >
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
