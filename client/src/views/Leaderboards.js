import React, { useState, useEffect } from "react";
import { getGame, getLeaderboard, deleteLeaderboard } from "../services/leaderboard";
import { useAppContext } from "./../context/app-context";
import { Container, Form, Button, ButtonGroup, Table } from "react-bootstrap";
import { Trophy, Trash, ArrowRepeat } from "react-bootstrap-icons";
import Paginate from "../components/Paginate";
import HighScoresModal from "../components/modals/leaderboard/HighScoresModal";

const Leaderboards = () => {
  const { game, domain } = useAppContext();
  const [leaderboards, setLeaderboards] = useState();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState();
  const [leaderboard, setLeaderboard] = useState();
  const [page, setPage] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(10);
  const [showHighScores, setShowHighScores] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    (async () => {
      if (game && domain) {
        const gameData = await getGame(game.name, domain);
        setLeaderboards(gameData.leaderboards);
        setSelectedLeaderboard(Object.keys(gameData.leaderboards)[0]);
      }
    })();
  }, [game, domain]);

  useEffect(() => {
    if (selectedLeaderboard) {
      (async () => {
        const data = await getLeaderboard(
          game.name,
          domain,
          selectedLeaderboard,
          page,
          itemsNumber
        );

        setLeaderboard(data);
      })();
    }
  }, [selectedLeaderboard, itemsNumber, domain, page, game]);

  const rebuildLB = async () => {
    const rebuilt = await getLeaderboard(
      game.name,
      domain,
      selectedLeaderboard,
      page,
      itemsNumber
    );

    setLeaderboard(rebuilt);
  };

  const deleteLB = () => {
    deleteLeaderboard(game.name, domain, selectedLeaderboard)
    const updatedLeaderboards = {...leaderboards}
    delete updatedLeaderboards[selectedLeaderboard]
    setLeaderboards(updatedLeaderboards)
    setSelectedLeaderboard(Object.keys(leaderboards)[0])
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowHighScores(true);
  };

  return (
    <Container className="mb-5">
      <div className="d-flex align-items-center justify-content-center my-5">
        <Trophy className="mx-1" size={40} />
        <h1 className="m-0 mx-1">Leaderboards</h1>
      </div>

      {leaderboards && (
        <div>
          <div>
            <Form.Label>Leaderboards :</Form.Label>
            <Form.Select
              aria-label="Select a leaderboard"
              onChange={(e) => setSelectedLeaderboard(e.target.value)}
            >
              {Object.keys(leaderboards).map((leaderboard) => {
                return (
                  <option value={leaderboard} key={leaderboard}>
                    {leaderboard}
                  </option>
                );
              })}
            </Form.Select>
          </div>
          <div className="mt-3">
            <ButtonGroup aria-label="import-export">
              <Button
                variant="danger"
                onClick={() => deleteLB()}
                className="d-flex align-items-center"
              >
                <Trash size={20} className="mr-2" /> Delete leaderboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => rebuildLB()}
                className="d-flex align-items-center"
              >
                <ArrowRepeat size={20} className="mr-2" /> Rebuild leaderboard
              </Button>
            </ButtonGroup>
          </div>

          {leaderboard && Object.keys(leaderboard)[0] === selectedLeaderboard && (
            <div>
              <Table
                size="sm"
                className="table-fixed-storage mt-5"
                bordered
                hover
                borderless
                responsive
              >
                <thead>
                  <tr>
                    <th className="col-2">GamerID</th>
                    <th className="col-2">Name</th>
                    <th className="col-2">Score</th>
                    <th className="col-5">Info</th>
                    <th className="col-1">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard[selectedLeaderboard].scores.map((e) => {
                    return (
                      <tr
                        key={`line-${e.gamer_id}`}
                        onClick={() => openModal(e)}
                      >
                        <td key={`gamerid-${e.gamer_id}`} className="col-2">
                          {e.gamer_id}
                        </td>
                        <td key={`name-${e.gamer_id}`} className="col-2">
                          {e.profile.displayName}
                        </td>
                        <td key={`score-${e.gamer_id}`} className="col-2">
                          {e.score.score}
                        </td>
                        <td key={`info-${e.gamer_id}`} className="col-5">
                          {e.score.info}
                        </td>
                        <td key={`language-${e.gamer_id}`} className="col-1">
                          {e.profile.lang}
                        </td>
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
                maxPage={leaderboard[selectedLeaderboard].maxpage}
              />
              <HighScoresModal
                show={showHighScores}
                user={selectedUser}
                setSelectedUser={setSelectedUser}
                setShowHighScores={setShowHighScores}
              />
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default Leaderboards;
