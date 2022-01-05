import React, { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getBalance, newTransaction } from "../../services/user";
import { parseTx } from "../../utils/tx";

const Balance = () => {
  const { game, domain } = useAppContext();
  const [balance, setBalance] = useState({});
  const { userId } = useParams();
  const [newTx, setNewTx] = useState(null);
  const [disabledNewTx, setDisabledNewTx] = useState(true);

  useEffect(() => {
    getBalanceData(game, domain, userId);
  }, [game, domain, userId]);

  const getBalanceData = async (game, domain, userId) => {
    if (game && domain) {
      const balance = await getBalance(game.name, domain, userId);
      setBalance(balance);
    }
  };

  const handleChange = (value) => {
    const tx = parseTx(value)
    if(tx !== null){
        setDisabledNewTx(false)
        setNewTx(tx)
    }else{
        setDisabledNewTx(true)
    }
  }
  const addTx = async () => {
    await newTransaction(game.name, domain, userId, newTx)
    getBalanceData(game, domain, userId)
  };

  return (
    <Container>
      <div>
        <p>
          Use &lt;currency&gt;:&lt;+/- delta&gt; for each currency, separated by
          commas.
        </p>
        <div className="input-group mb-3 w-70">
          <input
            type="text"
            className="form-control"
            placeholder="Example: Gold: 100, Silver: -2.5, Arrow: 3"
            onChange={(e) => handleChange(e.target.value)}
          />
          <div className="input-group-append">
            <Button variant="success" onClick={() => addTx()} disabled={disabledNewTx}>
              <Plus size={25} /> Create new Transaction
            </Button>
          </div>
        </div>
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
                  <th style={{ width: "50%" }}>Currency</th>
                  <th style={{ width: "50%" }}>Amount</th>
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
