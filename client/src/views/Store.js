/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { Container, ButtonGroup, Button, Spinner, Table, FormCheck } from "react-bootstrap";
import { Shop } from "react-bootstrap-icons";
import { AddEditProductModal } from "../components/modals/store/AddEditProductModal";
import { Trash } from "react-bootstrap-icons";
import { useAppContext } from "../context/app-context";
import { getProducts, deleteProduct } from "../services/store";
import { isPresent } from "../utils/isPresent";
import { exportJson } from "../utils/exportJson";
import ImportButton from "../components/ImportButton";
import Paginate from "../components/Paginate";

const Store = () => {
  const { env, game, domain, page, setPage, itemsNumber, setItemsNumber } = useAppContext();
  const [products, setProducts] = useState({ list: [] });
  const [count, setCount] = useState(0);
  const [showAddEditProduct, setShowAddEditProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState({ reward: {} });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalAction, setModalAction] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const paginateRef = useRef();

  useEffect(() => {
    setPage(1);
    setItemsNumber(10);
  }, [game]);

  useEffect(() => {
    const skip = (page - 1) * itemsNumber;
    (async (skip, itemsNumber) => {
      await getStoreAsync(game.name, domain, skip, itemsNumber);
    })(skip, itemsNumber);
    setSelectedProducts([]);
  }, [game, domain, itemsNumber, page]);


  const getStoreAsync = async (game, domain, skip, limit) => {
    if (game && domain) {
      setLoading(true);
      const products = await getProducts(game, skip, limit);
      const count = (products.total);
      if (products) setProducts(products);
      if (count) setCount(count);
      setLoading(false);
    }
  }

  const exportStoreAsync = async (game, domain) => {
    if (game && domain) {
      const products = await getProducts(game.name, 0, 0);
      exportJson(env, game.name, products, "inapp");
  }
}

  const cbSetStore = async (products) => {
    setProducts(products);
    await getStoreAsync(game.name, domain, 0, itemsNumber);
    setPage(1);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selectedProducts]);


  const handleSelection = (e, productId) => {
    if (e.target.checked) {
      setSelectedProducts((selectedProducts) => [...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const bulkDeleteProducts = async () => {
    for (const productId of selectedProducts) {
      await deleteProduct(game.name, productId);
    }
    setSelectedProducts([]);
    setRefresh((refresh) => refresh + 1);
  };

  const handleAddProduct = () => {
    setModalAction("add");
    setShowAddEditProduct(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalAction("edit");
    setShowAddEditProduct(true);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {

      setSelectedProducts(products.list.map((product) => product.productId));
      products.list.map(product => {
        const checkbox = document.getElementById(product.productId);
        checkbox.checked = true;
      });
    } else {
      setSelectedProducts([]);
      products.list.map(product => {
        const checkbox = document.getElementById(product.productId);
        checkbox.checked = false;
      });
    }
  }

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
          <Button variant="danger" disabled={buttonDisabled} onClick={() => bulkDeleteProducts()} className="d-flex align-items-center">
            <Trash size={20} className="mr-2" /> Delete {selectedProducts.length} {selectedProducts.length <= 1 ? "product" : "products"}
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="import-export">
          <Button
            variant="primary"
            onClick={() => {
              exportStoreAsync(game, domain);
            }}
          >
            Export
          </Button>
          <ImportButton
            expectedDomain={game.name}
            expectedType="inapp"
            expectedEnv={env}
            gameName={game.name}
            loading={setLoading}
            cb={cbSetStore}
          />
        </ButtonGroup>
      </div>
      {isPresent([products]) &&
        (loading ? (
          <Spinner animation="border" variant="outline-primary" />
        ) : products.total === 0 ? (
          <p>You don't have any product yet</p>
        ) : (
          <div>
            <p className="m-1">Note : click on a product's cell to edit his data</p>
            <div ref={paginateRef}>
              {itemsNumber !== 10 && (
                <Paginate page={page} setPage={setPage} itemsNumber={itemsNumber} setItemsNumber={setItemsNumber} totalItems={count} />
              )}
            </div>
            <Table size="sm" bordered hover borderless>
              <thead>
                <tr>
                  <th className="align-middle">
                    <div className="d-flex align-items-center justify-content-center">
                      <FormCheck.Input id="main-checkbox" type="checkbox" className="m-0" onClick={(e) => handleSelectAll(e)} />
                    </div>
                  </th>
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
                      key={`line-${product.productId}`}
                      onClick={() => handleEditProduct(product)}
                    >
                      <td className="align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-center">
                          <FormCheck.Input id={`${product.productId}`} type="checkbox" className="m-0" onClick={(e) =>
                            handleSelection(e, product.productId)} />
                        </div>
                      </td>
                      <td key={`productId-${i}`}
                        onClick={() => handleEditProduct(product)}>{product.productId}</td>
                      <td key={`appStoreId-${i}`}>{product.appStoreId}</td>
                      <td key={`macStoreId-${i}`}>{product.macStoreId}</td>
                      <td key={`googlePlayId-${i}`}>{product.googlePlayId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div ref={paginateRef}>
              <Paginate page={page} setPage={setPage} itemsNumber={itemsNumber} setItemsNumber={setItemsNumber} totalItems={count} />
            </div>
          </div>
        ))}

      <AddEditProductModal
        show={showAddEditProduct}
        setShow={setShowAddEditProduct}
        setProducts={setProducts}
        setCount={setCount}
        setSelectedProduct={setSelectedProduct}
        product={selectedProduct}
        action={modalAction}
        key={selectedProduct}
      />
    </Container>
  );
};

export default Store;
