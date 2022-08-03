import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { parseTx, printTx } from "../../../utils/tx";
import { getProducts, postProduct, updateProduct } from "../../../services/store";
import { useAppContext } from "../../../context/app-context";
import { isPresent } from "../../../utils/isPresent";

export const AddEditProductModal = (props) => {
  const { game } = useAppContext();
  const [productId, setProductId] = useState("");
  const [appStoreId, setAppStoreId] = useState("");
  const [macStoreId, setMacStoreId] = useState("");
  const [googlePlayId, setGooglePlayId] = useState("");
  const [tx, setTx] = useState("");
  const [description, setDescription] = useState("");
  const [txDomain, setTxDomain] = useState("");
  const [disableSave, setDisableSave] = useState(true);
  const [disableProductId, setDisableProductId] = useState(false);

  useEffect(() => {
    if (props.product) {
      setProductId(props.product.productId);
      setAppStoreId(props.product.appStoreId);
      setMacStoreId(props.product.macStoreId);
      setGooglePlayId(props.product.googlePlayId);
      setTx(props.product.reward.tx);
      setDescription(props.product.reward.description);
      setTxDomain(props.product.reward.domain);
      setDisableSave(false);
      setDisableProductId(true)
    }
    if(props.action === "add"){
      setDisableSave(true);
      setDisableProductId(false)
    }
  }, [props]);

  const clearStates = () => {
    props.setSelectedProduct({reward: {}})
    setProductId(null);
    setAppStoreId(null);
    setMacStoreId(null);
    setGooglePlayId(null);
    setTx(null);
    setDescription(null);
    setTxDomain(null);
    setDisableSave(true);
  };

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
    if (!product.reward.domain){
      product.reward.domain = game.domains[0];
    }
    if (props.action === "add") {
      await postProduct(game.name, product);
    } else if (props.action === "edit") {
      await updateProduct(game.name, product)
    }
    props.setProducts(await getProducts(game.name));
    props.setShow(false);
    clearStates();
  };

  const title = props.action === "add" ? 'Add product' : "Edit product";

  return (
    <Modal
      show={props.show}
      size="lg"
      onHide={() => {
        clearStates();
        props.setShow(false);
      }}
      aria-labelledby="add-product-modal"
      centered
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
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
                defaultValue={props.product.productId}
                disabled={disableProductId}
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
                defaultValue={props.product.appStoreId}
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
                defaultValue={props.product.macStoreId}
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
                defaultValue={props.product.googlePlayId}
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
                defaultValue={printTx(props.product.reward.tx)}
                placeholder="Example: gold: +50, silver: +100"
                onChange={(e) => {
                  setTx(parseTx(e.target.value));
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2} style={{ fontWeight: "600" }}>
              Domain
            </Form.Label>
            <Col sm={10}>
              {isPresent([game]) && (
                <Form.Select
                  defaultValue={props.product.reward.domain? props.product.reward.domain : game.domains[0]}
                  onChange={(e) => setTxDomain(e.target.value)}
                >
                  {game.domains.map((domain, i) => {
                    return (
                      <option value={domain} key={i}>
                        {domain}
                      </option>
                    );
                  })}
                </Form.Select>
              )}
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
                defaultValue={props.product.reward.description}
                placeholder="Description for transaction executed upon purchase"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Col>
          </Form.Group>

          <div className="mt-4 text-end">
            <Button variant="dark" onClick={() => {clearStates(); props.setShow(false)}}>
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
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
