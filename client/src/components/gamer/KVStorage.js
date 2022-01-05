import React, { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/app-context";
import { getUserKVStore } from "../../services/user";

const KVStorage = () => {
  const { game, domain } = useAppContext();
  const [KVStorage, setKVStorage] = useState([]);
  const { userId } = useParams();

  useEffect(() => {
    const getKVStorage = async () => {
      if (game && domain) {
        const KVStorage = await getUserKVStore(game.name, domain, userId);
        setKVStorage(KVStorage);
      }
    };
    getKVStorage();
  }, [game, domain, userId]);
  return (
    <Container className="p-0">
      {KVStorage && (
        <div className="table-wrapper">
          <Table
            size="sm"
            className="table-fixed-storage"
            bordered
            hover
            borderless
            responsive
          >
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>ACL</th>
              </tr>
            </thead>
            <tbody>
              {KVStorage.map((e) => {
                return (
                  <tr key={`line-${e.key}`}>
                    <td key={`key-${e.key}`}>{e.key}</td>
                    <td key={`value-${e.key}`} className="td-overflow">
                      {e.value}
                    </td>
                    <td key={`acl-${e.key}`} className="td-overflow">
                      {e.acl}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default KVStorage;
