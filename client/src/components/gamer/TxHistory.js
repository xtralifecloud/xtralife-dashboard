import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getTxHistory } from "../../services/user";
import Paginate from "../Paginate";

const TxHistory = () => {
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);
  const [tx, setTx] = useState(null);
  const { game, domain } = useAppContext();
  const { userId } = useParams();

  useEffect(() => {
    const getRangeTx = async (skip, limit) => {
      if (game.name) {
        const txs = await getTxHistory(game.name, domain, userId, skip, limit);
        setTx(txs);
      }
    };
    const skip = (page - 1) * itemsNumber;
    getRangeTx(skip, itemsNumber);
  }, [game, itemsNumber, page, domain, userId]);

  return (
    <Container>
      {tx && (
        <div>
          <Table size="sm" bordered hover borderless responsive>
            <thead>
              <tr>
                <th className="col-2">Date</th>
                <th className="col-2">Transactions</th>
                <th className="col-8">Description</th>
              </tr>
            </thead>
            <tbody>
              {tx.transactions.map((e) => {
                return (
                  <tr key={`line-${e.ts}`}>
                    <td key={`date-${e.ts}`}>{e.ts}</td>
                    <td key={`tx-${e.ts}`}>{JSON.stringify(e.tx)}</td>
                    <td key={`desc-${e.ts}`}>{e.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Paginate
            page={page}
            setPage={setPage}
            itemsNumber={itemsNumber}
            setItemsNumber={setItemsNumber}
            totalItems={tx.count}
          />
        </div>
      )}
    </Container>
  );
};

export default TxHistory;
