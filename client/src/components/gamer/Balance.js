import React, { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { Plus, CaretUpFill, CaretDownFill } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getBalance, newTransaction } from "../../services/user";
import { parseTx } from "../../utils/tx";
import { sortObjectByKeys, sortObjectByValues } from "../../utils/sort";

const Balance = ({refresh}) => {
  const { game, domain } = useAppContext();
  const [balance, setBalance] = useState({});
  const { userId } = useParams();
  const [newTx, setNewTx] = useState(null);
  const [disabledNewTx, setDisabledNewTx] = useState(true);
  const [amountOrder, setAmountOrder] = useState(null);
  const [currencyOrder, setCurrencyOrder] = useState("asc");

  useEffect(() => {
    getBalanceData(game, domain, userId);
  }, [game, domain, userId, refresh]);

  const getBalanceData = async (game, domain, userId) => {
    if (game && domain) {
      const balance = await getBalance(game.name, domain, userId);
      if (balance) setBalance(sortObjectByKeys(balance, "asc"));
    }
  };

  const handleChange = (value) => {
    const tx = parseTx(value);
    if (tx !== null) {
      setDisabledNewTx(false);
      setNewTx(tx);
    } else {
      setDisabledNewTx(true);
    }
  };
  const addTx = async (e) => {
    e.preventDefault()
    await newTransaction(game.name, domain, userId, newTx);
    getBalanceData(game, domain, userId);
  };

  const handleCurrencyOrder = () => {
    setAmountOrder(null)
    if(currencyOrder === "asc"){
      setCurrencyOrder("desc")
      setBalance(sortObjectByKeys(balance, "desc"))
    }else{
      setCurrencyOrder("asc")
      setBalance(sortObjectByKeys(balance, "asc"))
    }
  };


  const handleAmountOrder = () => {
    setCurrencyOrder(null)
    if(amountOrder === "asc"){
      setAmountOrder("desc")
      setBalance(sortObjectByValues(balance, "desc"))
    }else{
      setAmountOrder("asc")
      setBalance(sortObjectByValues(balance, "asc"))
    }
  };
  return (
    <Container>
      <div>
        <p>
          Use &lt;currency&gt;:&lt;+/- delta&gt; for each currency, separated by
          commas.
        </p>
        <form className="input-group mb-3 w-70">
          <input
            type="text"
            className="form-control"
            placeholder="Example: Gold: 100, Silver: -2.5, Arrow: 3"
            onChange={(e) => handleChange(e.target.value)}
          />
          <div className="input-group-append">
            <Button
              variant="success"
              type="submit"
              onClick={(e) => addTx(e)}
              disabled={disabledNewTx}
              className="d-flex align-items-center"
            >
              <Plus size={25} className="mr-2" /> Create new Transaction
            </Button>
          </div>
        </form>
        {balance && (
          <div className="table-wrapper">
            <Table
              size="sm"
              className="table-fixed-balance"
              bordered
              hover
              borderless
              responsive
            >
              <thead>
                <tr>
                  <th style={{ width: "50%", cursor: "pointer" }} onClick={() => handleCurrencyOrder()}>
                    <div className="d-flex justify-content-between w-100">
                      Currency
                      {currencyOrder === "asc" ? <CaretUpFill /> : null}
                      {currencyOrder === "desc" ? <CaretDownFill /> : null}
                    </div>
                  </th>
                  <th style={{ width: "50%", cursor: "pointer" }} onClick={() => handleAmountOrder()}>
                    <div className="d-flex justify-content-between w-100">
                      Amount {amountOrder === "asc" ? <CaretUpFill /> : null}
                      {amountOrder === "desc" ? <CaretDownFill /> : null}{" "}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(balance).map((key) => {
                  return (
                    <tr key={`line-${key}`}>
                      <td
                        key={`currency-${key}`}
                        className="td-overflow"
                        style={{ width: "50%" }}
                      >
                        {key}
                      </td>
                      <td
                        key={`fsvalue-${key}`}
                        className="td-overflow"
                        style={{ width: "50%" }}
                      >
                        {balance[key]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Balance;
