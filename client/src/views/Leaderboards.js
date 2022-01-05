import React, { useState, useEffect } from "react";
import { getGame, getLeaderboard } from "../services/leaderboard";
import { useAppContext } from "./../context/app-context";
import { Container, Form, Button, ButtonGroup, Table} from "react-bootstrap";
import { Trophy, Trash, ArrowRepeat } from "react-bootstrap-icons";

const Leaderboards = () => {
  const { game, domain } = useAppContext();
  const [leaderboards, setLeaderboards] = useState();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState();
  console.log('selectedLeaderboard:', selectedLeaderboard)
  const [leaderboard, setLeaderboard] = useState();
  console.log('leaderboard:', leaderboard)
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(10);

  useEffect(() => {
    const getLeaderboards = async () => {
      if (game && domain) {
        const gameData = await getGame(game.name, domain);
        setLeaderboards(gameData.leaderboards);
        setSelectedLeaderboard(Object.keys(gameData.leaderboards)[0]);
      }
    };
    getLeaderboards();
  }, [game, domain]);

  useEffect(() => {
    if (selectedLeaderboard) {
      const getLeaderboardData = async () => {
        const data = await getLeaderboard(
          game.name,
          domain,
          selectedLeaderboard,
          page,
          count
        );

        setLeaderboard(data);
      };

      getLeaderboardData();
    }
  }, [selectedLeaderboard, count, domain, page, game]);

  const rebuildLeaderboard = async () => {
    const rebuilt = await getLeaderboard(
      game.name,
      domain,
      selectedLeaderboard,
      page,
      count
    );

    setLeaderboard(rebuilt);
  };

  const deleteLeaderboard = () => {};

  return (
    <Container>
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
              <Button variant="danger" onClick={() => deleteLeaderboard()}>
                <Trash size={20} /> Delete leaderboard
              </Button>
              <Button variant="secondary" onClick={() => rebuildLeaderboard()}>
                <ArrowRepeat size={20} /> Rebuild leaderboard
              </Button>
            </ButtonGroup>
          </div>
          
          {leaderboard && Object.keys(leaderboard)[0] === selectedLeaderboard && <Table
              size="sm"
              className="table-fixed-storage mt-5"
              bordered
              hover
              borderless
              responsive
            >
              <thead>
                <tr>
                  <th style={{width:"20%"}}>GamerID</th>
                  <th style={{width:"20%"}}>Name</th>
                  <th style={{width:"20%"}}>Score</th>
                  <th style={{width:"20%"}}>Info</th>
                  <th style={{width:"20%"}}>Language</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard[selectedLeaderboard].scores.map((e) => {
                  return (
                    <tr
                      key={`line-${e.gamer_id}`}
                    >
                      <td key={`gamerid-${e.gamer_id}`} style={{width:"20%"}}>
                        {e.gamer_id}
											</td>
                      <td key={`name-${e.gamer_id}`} style={{width:"20%"}}>
                        {e.profile.displayName}
											</td>
                      <td key={`score-${e.gamer_id}`} style={{width:"20%"}}>
                        {e.score.score}
											</td>
                      <td key={`info-${e.gamer_id}`} style={{width:"20%"}}>
                        {e.score.info}
											</td>
                      <td key={`language-${e.gamer_id}`} style={{width:"20%"}}>
                        {e.profile.lang}
											</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>}
        </div>
      )}
    </Container>
  );
};

export default Leaderboards;
