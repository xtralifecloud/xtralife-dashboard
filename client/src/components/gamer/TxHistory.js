import React, { useState, useEffect } from "react";
import { Table, Button, Container, Form, Row, Col } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { searchTxHistory } from "../../services/user";
import Paginate from "../Paginate";

const TxHistory = () => {
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);
  const [tx, setTx] = useState(null);
  const [ts1, setTs1] = useState(null);
  const [ts2, setTs2] = useState(null);
  const [descQuery, setDescQuery] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const { game, domain } = useAppContext();
  const { userId } = useParams();

  useEffect(() => {
    if (game.name) {
      const skip = (page - 1) * itemsNumber;
      (async (skip, limit) => {
        const txs = await searchTxHistory(
          game.name,
          domain,
          userId,
          ts1,
          ts2,
          descQuery,
          skip,
          limit
        );
        if(txs) setTx(txs);
      })(skip, itemsNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, domain, userId, itemsNumber, page, searchTrigger]);

  return (
    <Container>
      {tx && (
        <div>
          <Row className="mb-4">
            <Col md={3} xs={6} className="d-flex align-items-center">
              <Form.Label className="my-0 mx-3">Start:</Form.Label>
              <Form.Control
                type="date"
                id="datepicker1"
                onChange={(e) =>
                  setTs1(new Date(e.target.valueAsDate).setHours(0, 0, 0))
                }
              />
            </Col>
            <Col md={3} xs={6} className="d-flex align-items-center my-1">
              <Form.Label className="my-0 mx-3">End:</Form.Label>
              <Form.Control
                type="date"
                id="datepicker2"
                onChange={(e) =>
                  setTs2(new Date(e.target.valueAsDate).setHours(23, 59, 59))
                }
              />
            </Col>
            <Col md={1} xs={6}></Col>
            <Col md={5} xs={12} className="d-flex align-items-center">
              <Form.Control
                placeholder="Search"
                id="descInput"
                onChange={(e) => setDescQuery(e.target.value)}
              />
              <Button
                variant="success"
                onClick={() => setSearchTrigger(searchTrigger + 1)}
              >
                <Search size={15} />
              </Button>
              <Button
                variant="secondary"
                className="d-flex align-items-center mx-3"
                onClick={() => {
                  document.getElementById("datepicker1").value = null;
                  document.getElementById("datepicker2").value = null;
                  document.getElementById("descInput").value = null;
                  setTs1(null);
                  setTs2(null);
                  setDescQuery(null);
                  setSearchTrigger(searchTrigger + 1);
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
          {itemsNumber !== 10 && (
            <Paginate
              page={page}
              setPage={setPage}
              itemsNumber={itemsNumber}
              setItemsNumber={setItemsNumber}
              totalItems={tx.count}
            />
          )}
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
                    <td key={`date-${e.ts}`}>{new Date(e.ts).toUTCString()}</td>
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
