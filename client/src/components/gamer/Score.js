import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { useAppContext } from "../../context/app-context";
import { useParams } from "react-router-dom";
import { getBestScores } from "../../services/user";

const Score = () => {
  const [scores, setScores] = useState(null);
  console.log('scores:', scores)
  const { game, domain } = useAppContext();
  const { userId } = useParams();

  useEffect(() => {
    const getRangeTx = async () => {
      if (game.name) {
        const scores = await getBestScores(game.name, domain, userId);
        setScores(scores);
      }
    };
    getRangeTx();
  }, [game, domain, userId]);

  return (
    <Container>
      {scores && (
        <div>
          <Table size="sm" bordered hover borderless responsive>
            <thead>
              <tr>
                <th className="col-2">leaderBoard</th>
                <th className="col-2">Score</th>
                <th className="col-8">Rank</th>
                <th className="col-8">Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(scores).map((key) => {
                return (
                  <tr key={`line-${scores[key].timestamp}`}>
                    <td key={`key-${scores[key].timestamp}`}>{[key]}</td>
                    <td key={`score-${scores[key].timestamp}`}>{scores[key].score}</td>
                    <td key={`rank-${scores[key].timestamp}`}>{scores[key].rank}</td>
                    <td key={`desc-${scores[key].timestamp}`}>{scores[key].info}</td>
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

export default Score;
