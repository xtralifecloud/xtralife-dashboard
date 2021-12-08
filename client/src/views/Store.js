import React, { useState, useEffect } from "react";
import {
  Container,
  ButtonGroup,
  Button,
  Table,
  Spinner,
} from "react-bootstrap";
import { Shop } from "react-bootstrap-icons";
import { AddProductModal } from "../components/modals/store/AddProductModal";
import { useAppContext } from "../context/app-context";
import { getProducts } from "../services/store";
import { isPresent } from "../utils/isPresent";

const Store = () => {
  const { game, domain } = useAppContext();
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null)
  console.log('selected:', selected)
  const [editDisabled, setEditDisabled] = useState(true)
  const [deleteDisabled, setDeleteDisabled] = useState(true)

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
    if(selected !== null){
      setEditDisabled(false)
      setDeleteDisabled(false)
    }else{
      setEditDisabled(true)
      setDeleteDisabled(true)
    }
  }, [selected])

  const handleSelect = (i) => {
    setSelected(i)
    document.getElementById(`line-${i}`).style.backgroundColor = "#ced4da"
  }

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <Shop className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Store</h1>
      </div>

      <div className="d-flex justify-content-between my-5">
        <ButtonGroup aria-label="actions">
          <Button variant="success" onClick={() => setShowAddProduct(true)}>
            Add product
          </Button>
          <Button variant="secondary" disabled={editDisabled}>Edit product</Button>
          <Button variant="danger" disabled={deleteDisabled}>Delete product</Button>
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
          <Table size="sm" striped bordered hover borderless>
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
                  <tr id={`line-${i}`} key={`line-${i}`} onClick={() => handleSelect(i)}>
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

      <AddProductModal
        show={showAddProduct}
        setShow={setShowAddProduct}
        action="add"
        txDomain="private"
        setProducts={setProducts}
      />
    </Container>
  );
};

export default Store;
