import React, { useState, useEffect } from "react";
import { ButtonGroup, Button, Pagination } from "react-bootstrap";

const Paginate = ({
  page,
  setPage,
  totalItems,
  itemsNumber,
  setItemsNumber,
  maxPage,
}) => {
  const itemsNumberButtons = ["10", "25", "50", "100"];
  const [pageArray, setPageArray] = useState([]);

  useEffect(() => {
    let totPages = 0;
    if (totalItems) {
      totPages = Math.ceil(totalItems / itemsNumber);
    } else {
      totPages = maxPage;
    }

    let pageArr = [];
    if (totPages > 1) {
      if (totPages <= 9) {
        let i = 1;
        while (i <= totPages) {
          pageArr.push(i);
          i++;
        }
      } else {
        if (page <= 5) pageArr = [1, 2, 3, 4, 5, 6, 7, 8, "", totPages];
        else if (totPages - page <= 4)
          pageArr = [
            1,
            "",
            totPages - 7,
            totPages - 6,
            totPages - 5,
            totPages - 4,
            totPages - 3,
            totPages - 2,
            totPages - 1,
            totPages,
          ];
        else
          pageArr = [
            1,
            "",
            page - 3,
            page - 2,
            page - 1,
            page,
            page + 1,
            page + 2,
            page + 3,
            "",
            totPages,
          ];
      }
    }
    setPageArray(pageArr);
  }, [page, itemsNumber, totalItems, maxPage]);

  return (
    <div className="d-flex justify-content-between align-items-top">
      <Pagination size="sm">
        {page !== 1 && <Pagination.Prev onClick={() => setPage(page - 1)} />}
        {pageArray.map((n, i) => {
          if (n === "") {
            return <Pagination.Ellipsis key={i} disabled />;
          } else if (n === page) {
            return (
              <Pagination.Item key={i} active>
                {n}
              </Pagination.Item>
            );
          } else {
            return (
              <Pagination.Item
                variant="danger"
                key={i}
                onClick={() => setPage(n)}
              >
                {n}
              </Pagination.Item>
            );
          }
        })}
        {page !== Math.ceil(totalItems / itemsNumber) && (
          <Pagination.Next onClick={() => setPage(page + 1)} />
        )}
      </Pagination>

      <ButtonGroup size="sm" className="d-block">
        {itemsNumberButtons.map((n) => {
          return (
            <Button
              key={n}
              active={itemsNumber.toString() === n}
              variant="outline-secondary"
              onClick={() => {
                setItemsNumber(parseInt(n));
                setPage(1);
              }}
            >
              {n}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
};

export default Paginate;
