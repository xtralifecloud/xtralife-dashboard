import React, { useEffect, useState } from "react";
import { Container, Table, FormCheck, Button, Form } from "react-bootstrap";
import { Controller, Trash, Search } from "react-bootstrap-icons";
import { useAppContext } from "./../context/app-context";
import { getMatches, deleteMatch, getMatchesCount } from "../services/match";
import Paginate from "../components/Paginate";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Matches = () => {
  const { game, domain } = useAppContext();
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);
  const [matches, setMatches] = useState();
  const [count, setCount] = useState(0);

  const [hideFinished, setHideFinished] = useState(false);
  const [gamerId, setGamerId] = useState(null);
  const [customProperties, setCustomProperties] = useState(null);

  const [selectedMatches, setSelectedMatches] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const navigate = useNavigate();


  useEffect(() => {
    const skip = (page - 1) * itemsNumber;
    try {
      if (customProperties) JSON.parse(customProperties);
    } catch (e) {
      return toast.warn("Custom properties must be a valid JSON");
    }
    getMatchesAsync(game.name, domain, skip, itemsNumber, hideFinished, gamerId, customProperties);
    getMatchesCountAsync(game.name, domain, hideFinished, gamerId, customProperties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, domain, page, itemsNumber, hideFinished, refresh]);

  const getMatchesAsync = async (gameName, domain, skip, limit, hideFinished, gamerId, customProperties) => {
    const matches = await getMatches(gameName, domain, skip, limit, hideFinished, gamerId, customProperties);
    if (matches.list) setMatches(matches.list);
  };

  const getMatchesCountAsync = async (gameName, domain, hideFinished, gamerId, customProperties) => {
    const count = await getMatchesCount(gameName, domain, hideFinished, gamerId, customProperties);
    if (count.total) setCount(count.total);
  };

  useEffect(() => {
    if (selectedMatches.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [selectedMatches]);

  const handleSelection = (e, matchId) => {
    if (e.target.checked) {
      setSelectedMatches((selectedMatches) => [...selectedMatches, matchId]);
    } else {
      setSelectedMatches(selectedMatches.filter((id) => id !== matchId));
    }
  };

  const bulkDeleteMatches = async () => {
    for (const matchId of selectedMatches) {
      await deleteMatch(game.name, matchId);
    }
    setSelectedMatches([]);
    setRefresh((refresh) => refresh + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setRefresh((refresh) => refresh + 1);
    setPage(1);
  };

  return (
    <Container className="my-5">
      <div className="d-flex align-items-center justify-content-center my-3">
        <Controller className="mx-1" size={50} />
        <h1 className="m-0 mx-1">Matches</h1>
      </div>

      {matches && (
        <div>
          <div className="d-flex align-items-center justify-content-between my-5">
            <Button variant="danger" disabled={buttonDisabled} onClick={() => bulkDeleteMatches()} className="d-flex align-items-center">
              <Trash size={20} className="mr-2" /> Delete {selectedMatches.length} {selectedMatches.length === 1 ? "match" : "matches"}
            </Button>
            <Form className="d-flex ">
              <div>
                <Form.Control placeholder="UserID" onChange={(e) => setGamerId(e.target.value)} />
              </div>
              <div className="mx-4">
                <Form.Control placeholder="Custom properties (JSON)" onChange={(e) => setCustomProperties(e.target.value)} />
              </div>
              <div>
                <Button variant="secondary" type="submit" onClick={(e) => handleSearch(e)}>
                  <Search size={15} />
                </Button>
              </div>
            </Form>
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <p className="mx-1 my-0">Note : click on a matchId cell to see his data</p>
            <FormCheck type="checkbox" label="Hide finished matches" defaultChecked={hideFinished} onClick={() => setHideFinished(!hideFinished)} />
          </div>
          <div>
            {itemsNumber !== 10 && (
              <Paginate page={page} setPage={setPage} itemsNumber={itemsNumber} setItemsNumber={setItemsNumber} totalItems={count} />
            )}
          </div>
          <Table size="sm" bordered hover borderless responsive className="my-3">
            <thead>
              <tr>
                <th></th>
                <th>Match ID</th>
                <th>Description</th>
                <th>Creator UserID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={`line-${match._id}`}>
                  <td className="align-middle">
                    <div className="d-flex align-items-center justify-content-center">
                      <FormCheck.Input type="checkbox" className="m-0" onClick={(e) => handleSelection(e, match._id)} />
                    </div>
                  </td>
                  <td className="align-middle clickable" key={`id-${match._id}`} 
                      onClick={() => navigate(`/matches/${match._id}`)}>
                    {match._id}
                  </td>
                  <td className="align-middle" key={`desc-${match._id}`}>
                    {match.description}
                  </td>
                  <td className="align-middle" key={`creator-${match._id}`}>
                    {match.creator}
                  </td>
                  <td className="align-middle" key={`status-${match._id}`}>
                    {match.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Paginate page={page} setPage={setPage} itemsNumber={itemsNumber} setItemsNumber={setItemsNumber} totalItems={count} />
        </div>
      )}
    </Container>
  );
};

export default Matches;
