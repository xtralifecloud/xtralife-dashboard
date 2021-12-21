import React, { useState, useEffect } from "react";
import {
  Container,
  ButtonGroup,
  Button,
  Table,
  Spinner,
} from "react-bootstrap";
import { Shop } from "react-bootstrap-icons";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { AddEditProductModal } from "../components/modals/store/AddEditProductModal";
import { useAppContext } from "../context/app-context";
import { getProducts, deleteProduct } from "../services/store";
import { isPresent } from "../utils/isPresent";

const Store = () => {
  const { game, domain } = useAppContext();
  const [products, setProducts] = useState({});
  const [showAddEditProduct, setShowAddEditProduct] = useState(false);
  const [showDeleteProduct, setShowDeleteProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({reward: {}});
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [modalAction, setModalAction] = useState('');

  useEffect(() => {
    const getDataProducts = async () => {
      if (game.name && domain) {
        setLoading(true);
        const products = await getProducts(game.name);
        setProducts(products);
        setLoading(false);
      }
    };
    getDataProducts();
  }, [game, domain]);

  useEffect(() => {
    if (selectedProductIndex !== null) {
      setEditDisabled(false);
      setDeleteDisabled(false);
    } else {
      setEditDisabled(true);
      setDeleteDisabled(true);
    }
  }, [selectedProductIndex]);

  const handleSelect = (i) => {
    if (selectedProductIndex !== null)
      document
        .getElementById(`line-${selectedProductIndex}`)
        .classList.remove("active-row");
    setSelectedProductIndex(i);
    document.getElementById(`line-${i}`).classList.add("active-row");
  };

  const handleAddProduct = () => {
    setModalAction('add')
    setShowAddEditProduct(true);
  };

  const handleEditProduct = () => {
    setModalAction('edit')
    setSelectedProduct(products.list[selectedProductIndex])
    setShowAddEditProduct(true);
  };

  const handleDeleteProduct = () => {
    setShowDeleteProduct(false);
    const productId = products.list[selectedProductIndex].productId;
    products["list"] = products.list.filter((_, i) => i !== selectedProductIndex);
    setProducts(products);
    document
      .getElementById(`line-${selectedProductIndex}`)
      .classList.remove("active-row");
    setSelectedProductIndex(null);
    deleteProduct(game.name, productId);
  };

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <Shop className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Store</h1>
      </div>

      <div className="d-flex justify-content-between my-5">
        <ButtonGroup aria-label="actions">
          <Button variant="success" onClick={() => handleAddProduct()}>
            Add product
          </Button>
          <Button
            variant="secondary"
            disabled={editDisabled}
            onClick={() => handleEditProduct()}
          >
            Edit product
          </Button>
          <Button
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => setShowDeleteProduct(true)}
          >
            Delete product
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="import-export">
          <Button variant="outline-primary">Export</Button>
          <Button variant="outline-success">Import</Button>
        </ButtonGroup>
      </div>
      {isPresent([products]) &&
        (loading ? (
          <Spinner animation="border" variant="outline-primary" />
        ) : products.total === 0 ? (
          <p>You don't have any product yet</p>
        ) : (
          <Table size="sm" bordered hover borderless>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product ID (AppStore)</th>
                <th>Product ID (Mac AppStore)</th>
                <th>SKU (Google Play)</th>
              </tr>
            </thead>
            <tbody>
              {products.list.map((product, i) => {
                return (
                  <tr
                    id={`line-${i}`}
                    key={`line-${i}`}
                    onClick={() => handleSelect(i)}
                  >
                    <td key={`productId-${i}`}>{product.productId}</td>
                    <td key={`appStoreId-${i}`}>{product.appStoreId}</td>
                    <td key={`macStoreId-${i}`}>{product.macStoreId}</td>
                    <td key={`googlePlayId-${i}`}>{product.googlePlayId}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ))}

      <AddEditProductModal
        show={showAddEditProduct}
        setShow={setShowAddEditProduct}
        setProducts={setProducts}
        setSelectedProduct={setSelectedProduct}
        product={selectedProduct}
        action={modalAction}
        key={selectedProduct}
      />

      {showDeleteProduct && (
        <ConfirmationModal
          show={showDeleteProduct}
          onHide={() => setShowDeleteProduct(false)}
          action={handleDeleteProduct}
          body={`Are you sure you want to delete product ${
            selectedProductIndex !== null
              ? products.list[selectedProductIndex].productId
              : ""
          } ?`}
          title="Product deletion"
        />
      )}
    </Container>
  );
};

export default Store;
